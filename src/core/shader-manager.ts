import { GPUContext, WebGPUContext, WebGL2Context } from './types';

export interface ShaderConfig {
  vertex: string;
  fragment: string;
  bindGroupLayouts?: GPUBindGroupLayout[];
  vertexBuffers?: GPUVertexBufferLayout[];
  targets?: GPUColorTargetState[];
}

export interface CompiledShader {
  pipeline: GPURenderPipeline | WebGLProgram;
  bindGroupLayouts: GPUBindGroupLayout[];
  dispose: () => void;
}

export class ShaderManager {
  private context: GPUContext;
  private isWebGPU: boolean;
  private shaderCache: Map<string, CompiledShader>;

  constructor(context: GPUContext) {
    this.context = context;
    this.isWebGPU = 'device' in context;
    this.shaderCache = new Map();
  }

  async createShader(config: ShaderConfig, key: string): Promise<CompiledShader> {
    // Check cache first
    const cached = this.shaderCache.get(key);
    if (cached) {
      return cached;
    }

    if (this.isWebGPU) {
      return this.createWebGPUShader(config, key);
    } else {
      return this.createWebGL2Shader(config, key);
    }
  }

  private async createWebGPUShader(config: ShaderConfig, key: string): Promise<CompiledShader> {
    const context = this.context as WebGPUContext;
    const { device } = context;

    // Create pipeline layout
    const pipelineLayout = device.createPipelineLayout({
      bindGroupLayouts: config.bindGroupLayouts || [],
    });

    // Create render pipeline
    const pipeline = device.createRenderPipeline({
      layout: pipelineLayout,
      vertex: {
        module: device.createShaderModule({
          code: config.vertex,
        }),
        entryPoint: 'main',
        buffers: config.vertexBuffers || [],
      },
      fragment: {
        module: device.createShaderModule({
          code: config.fragment,
        }),
        entryPoint: 'main',
        targets: config.targets || [{
          format: 'bgra8unorm',
        }],
      },
      primitive: {
        topology: 'triangle-list',
      },
    });

    const shader: CompiledShader = {
      pipeline,
      bindGroupLayouts: config.bindGroupLayouts || [],
      dispose: () => {
        pipeline.destroy?.();
      },
    };

    this.shaderCache.set(key, shader);
    return shader;
  }

  private createWebGL2Shader(config: ShaderConfig, key: string): CompiledShader {
    const context = this.context as WebGL2Context;
    const gl = context.gl;

    // Create vertex shader
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    if (!vertexShader) {
      throw new Error('Failed to create vertex shader');
    }
    gl.shaderSource(vertexShader, config.vertex);
    gl.compileShader(vertexShader);

    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(vertexShader);
      gl.deleteShader(vertexShader);
      throw new Error(`Vertex shader compilation failed: ${info}`);
    }

    // Create fragment shader
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    if (!fragmentShader) {
      throw new Error('Failed to create fragment shader');
    }
    gl.shaderSource(fragmentShader, config.fragment);
    gl.compileShader(fragmentShader);

    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(fragmentShader);
      gl.deleteShader(fragmentShader);
      gl.deleteShader(vertexShader);
      throw new Error(`Fragment shader compilation failed: ${info}`);
    }

    // Create program
    const program = gl.createProgram();
    if (!program) {
      throw new Error('Failed to create shader program');
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      throw new Error(`Shader program link failed: ${info}`);
    }

    // Clean up individual shaders
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    const shader: CompiledShader = {
      pipeline: program,
      bindGroupLayouts: [], // WebGL2 doesn't use bind group layouts
      dispose: () => {
        gl.deleteProgram(program);
      },
    };

    this.shaderCache.set(key, shader);
    return shader;
  }

  dispose(key?: string): void {
    if (key) {
      const shader = this.shaderCache.get(key);
      if (shader) {
        shader.dispose();
        this.shaderCache.delete(key);
      }
    } else {
      // Dispose all shaders
      this.shaderCache.forEach(shader => shader.dispose());
      this.shaderCache.clear();
    }
  }
} 