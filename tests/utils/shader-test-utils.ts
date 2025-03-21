import { ShaderType, ShaderModule } from '../../src/shaders';

// Basic vertex data for a fullscreen quad
export const FULLSCREEN_QUAD_VERTICES = new Float32Array([
  -1.0, -1.0,  // Position
   0.0,  0.0,  // TexCoord
   1.0, -1.0,  
   1.0,  0.0,
   1.0,  1.0,
   1.0,  1.0,
   -1.0,  1.0,
   0.0,  1.0,
]);

export interface TestContext {
  type: ShaderType;
  canvas: HTMLCanvasElement;
  gl?: WebGL2RenderingContext;
  device?: GPUDevice;
}

export async function createTestContext(type: ShaderType = 'webgl2'): Promise<TestContext> {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;

  if (type === 'webgl2') {
    const gl = canvas.getContext('webgl2');
    if (!gl) throw new Error('WebGL2 not supported');
    return { type, canvas, gl };
  } else {
    if (!navigator.gpu) throw new Error('WebGPU not supported');
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) throw new Error('No GPU adapter found');
    const device = await adapter.requestDevice();
    return { type, canvas, device };
  }
}

export function compareFramebuffers(
  actual: Uint8Array,
  expected: Uint8Array,
  threshold = 0
): boolean {
  if (actual.length !== expected.length) return false;
  
  for (let i = 0; i < actual.length; i++) {
    if (Math.abs(actual[i] - expected[i]) > threshold) {
      return false;
    }
  }
  return true;
}

export function createTestTexture(
  gl: WebGL2RenderingContext,
  width: number,
  height: number,
  data: Uint8Array
): WebGLTexture {
  const texture = gl.createTexture();
  if (!texture) throw new Error('Failed to create texture');
  
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    width,
    height,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    data
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  
  return texture;
}

export async function createTestGPUTexture(
  device: GPUDevice,
  width: number,
  height: number,
  data: Uint8Array
): Promise<GPUTexture> {
  const texture = device.createTexture({
    size: { width, height, depthOrArrayLayers: 1 },
    format: 'rgba8unorm',
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
  });
  
  device.queue.writeTexture(
    { texture },
    data,
    { bytesPerRow: width * 4, rowsPerImage: height },
    { width, height, depthOrArrayLayers: 1 }
  );
  
  return texture;
} 