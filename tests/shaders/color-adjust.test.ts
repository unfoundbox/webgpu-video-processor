/// <reference types="@webgpu/types" />
import { colorAdjustShader } from '../../src/shaders';
import {
  createTestContext,
  createTestTexture,
  createTestGPUTexture,
  FULLSCREEN_QUAD_VERTICES,
  compareFramebuffers,
  TestContext
} from '../utils/shader-test-utils';

describe('Color Adjustment Shader', () => {
  let context: TestContext;
  const width = 64;
  const height = 64;
  const testData = new Uint8Array(width * height * 4).fill(128);

  beforeEach(async () => {
    context = await createTestContext();
  });

  it('should apply color adjustments correctly in WebGL2', async () => {
    if (!context.gl) throw new Error('WebGL2 context not available');
    const gl = context.gl;

    // Create shader program
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) throw new Error('Failed to create shaders');

    gl.shaderSource(vertexShader, colorAdjustShader.webgl2.vertex);
    gl.shaderSource(fragmentShader, colorAdjustShader.webgl2.fragment);
    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);

    const program = gl.createProgram();
    if (!program) throw new Error('Failed to create program');
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Set up vertex buffer
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, FULLSCREEN_QUAD_VERTICES, gl.STATIC_DRAW);

    // Set up attributes
    const positionLoc = gl.getAttribLocation(program, 'position');
    const texCoordLoc = gl.getAttribLocation(program, 'texCoord');
    gl.enableVertexAttribArray(positionLoc);
    gl.enableVertexAttribArray(texCoordLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 16, 0);
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 16, 8);

    // Create and bind texture
    const texture = createTestTexture(gl, width, height, testData);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(gl.getUniformLocation(program, 'videoTexture'), 0);

    // Set uniforms
    gl.uniform1f(gl.getUniformLocation(program, 'brightness'), 0.5);
    gl.uniform1f(gl.getUniformLocation(program, 'contrast'), 1.5);
    gl.uniform1f(gl.getUniformLocation(program, 'saturation'), 1.2);

    // Render
    gl.viewport(0, 0, width, height);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    // Read pixels
    const pixels = new Uint8Array(width * height * 4);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

    // Verify adjustments were applied
    // We expect the values to be different from the input due to adjustments
    expect(compareFramebuffers(pixels, testData, 1)).toBe(false);
  });

  it('should apply color adjustments correctly in WebGPU', async () => {
    context = await createTestContext('webgpu');
    if (!context.device) throw new Error('WebGPU device not available');
    const device = context.device;

    // Create pipeline
    const pipeline = await device.createRenderPipelineAsync({
      layout: 'auto',
      vertex: {
        module: device.createShaderModule({
          code: colorAdjustShader.webgpu.vertex
        }),
        entryPoint: 'main',
        buffers: [{
          arrayStride: 16,
          attributes: [
            { format: 'float32x2', offset: 0, shaderLocation: 0 },
            { format: 'float32x2', offset: 8, shaderLocation: 1 }
          ]
        }]
      },
      fragment: {
        module: device.createShaderModule({
          code: colorAdjustShader.webgpu.fragment
        }),
        entryPoint: 'main',
        targets: [{ format: 'rgba8unorm' }]
      },
      primitive: {
        topology: 'triangle-list'
      }
    });

    // Create vertex buffer
    const vertexBuffer = device.createBuffer({
      size: FULLSCREEN_QUAD_VERTICES.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    });
    device.queue.writeBuffer(vertexBuffer, 0, FULLSCREEN_QUAD_VERTICES);

    // Create uniform buffer
    const uniformBuffer = device.createBuffer({
      size: 12, // 3 floats
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });
    const uniformData = new Float32Array([0.5, 1.5, 1.2]); // brightness, contrast, saturation
    device.queue.writeBuffer(uniformBuffer, 0, uniformData);

    // Create texture and sampler
    const texture = await createTestGPUTexture(device, width, height, testData);
    const sampler = device.createSampler({
      magFilter: 'nearest',
      minFilter: 'nearest'
    });

    // Create bind group
    const bindGroup = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: sampler },
        { binding: 1, resource: texture.createView() },
        { binding: 2, resource: { buffer: uniformBuffer } }
      ]
    });

    // Create output texture
    const outputTexture = device.createTexture({
      size: { width, height, depthOrArrayLayers: 1 },
      format: 'rgba8unorm',
      usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC
    });

    // Create command encoder
    const commandEncoder = device.createCommandEncoder();
    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [{
        view: outputTexture.createView(),
        clearValue: { r: 0, g: 0, b: 0, a: 1 },
        loadOp: 'clear',
        storeOp: 'store'
      }]
    });

    renderPass.setPipeline(pipeline);
    renderPass.setBindGroup(0, bindGroup);
    renderPass.setVertexBuffer(0, vertexBuffer);
    renderPass.draw(4, 1, 0, 0);
    renderPass.end();

    // Read back pixels
    const readbackBuffer = device.createBuffer({
      size: width * height * 4,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
    });

    commandEncoder.copyTextureToBuffer(
      { texture: outputTexture },
      { buffer: readbackBuffer, bytesPerRow: width * 4, rowsPerImage: height },
      { width, height, depthOrArrayLayers: 1 }
    );

    device.queue.submit([commandEncoder.finish()]);

    await readbackBuffer.mapAsync(GPUMapMode.READ);
    const pixels = new Uint8Array(readbackBuffer.getMappedRange());

    // Verify adjustments were applied
    // We expect the values to be different from the input due to adjustments
    expect(compareFramebuffers(pixels, testData, 1)).toBe(false);
  });
}); 