import {
  GPUContext,
  WebGL2Context,
  GPUTexture,
  GPUTextureFormat
} from './types';

export class WebGL2ContextImpl implements WebGL2Context {
  gl: WebGL2RenderingContext;
  program: WebGLProgram;
  private canvas: HTMLCanvasElement;
  private format: GPUTextureFormat = 'bgra8unorm';

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const gl = canvas.getContext('webgl2', {
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance'
    });

    if (!gl) {
      throw new Error('WebGL2 is not supported in this browser');
    }

    this.gl = gl;
    this.program = this.createDefaultProgram();
  }

  async initialize(): Promise<void> {
    // WebGL2 context is already initialized in constructor
    // Additional initialization can be done here if needed
  }

  createTexture(width: number, height: number, format: string = this.format): GPUTexture {
    const texture = this.gl.createTexture();
    if (!texture) {
      throw new Error('Failed to create WebGL2 texture');
    }

    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA8,
      width,
      height,
      0,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      null
    );

    // Set texture parameters
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

    return {
      width,
      height,
      format,
      destroy: () => {
        this.gl.deleteTexture(texture);
      }
    };
  }

  createSampler(): any {
    // WebGL2 doesn't have a separate sampler concept
    // Texture parameters are set directly on textures
    return null;
  }

  createPipeline(): any {
    // WebGL2 uses shader programs instead of pipelines
    return this.program;
  }

  submit(): void {
    // WebGL2 doesn't have explicit command submission
    // Commands are executed immediately
  }

  dispose(): void {
    if (this.program) {
      this.gl.deleteProgram(this.program);
    }
  }

  private createDefaultProgram(): WebGLProgram {
    const vertexShader = this.createShader(this.gl.VERTEX_SHADER, `
      attribute vec2 position;
      attribute vec2 texCoord;
      varying vec2 vTexCoord;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
        vTexCoord = texCoord;
      }
    `);

    const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, `
      precision highp float;
      uniform sampler2D uTexture;
      varying vec2 vTexCoord;
      void main() {
        gl_FragColor = texture2D(uTexture, vTexCoord);
      }
    `);

    const program = this.gl.createProgram();
    if (!program) {
      throw new Error('Failed to create WebGL2 program');
    }

    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      throw new Error('Failed to link WebGL2 program');
    }

    return program;
  }

  private createShader(type: number, source: string): WebGLShader {
    const shader = this.gl.createShader(type);
    if (!shader) {
      throw new Error('Failed to create WebGL2 shader');
    }

    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const info = this.gl.getShaderInfoLog(shader);
      this.gl.deleteShader(shader);
      throw new Error(`Failed to compile WebGL2 shader: ${info}`);
    }

    return shader;
  }
} 