import { ShaderManager, ShaderConfig } from '../../src/core/shader-manager';
import { WebGPUContext, WebGL2Context } from '../../src/core/types';
import { jest } from '@jest/globals';

describe('ShaderManager', () => {
  let mockWebGPUContext: WebGPUContext;
  let mockWebGL2Context: WebGL2Context;
  let basicShaderConfig: ShaderConfig;

  beforeEach(() => {
    // Mock WebGPU context
    mockWebGPUContext = {
      device: {
        createPipelineLayout: jest.fn().mockReturnValue({}),
        createRenderPipeline: jest.fn().mockReturnValue({
          destroy: jest.fn(),
        }),
        createShaderModule: jest.fn().mockReturnValue({
          compilationInfo: jest.fn().mockResolvedValue({ messages: [] }),
        }),
      },
      initialize: jest.fn(),
      createTexture: jest.fn(),
      createSampler: jest.fn(),
      createPipeline: jest.fn(),
      submit: jest.fn(),
      dispose: jest.fn(),
    } as unknown as WebGPUContext;

    // Mock WebGL2 context
    const mockGetShaderParameter = jest.fn<(shader: WebGLShader, pname: number) => boolean>();
    const mockGetShaderInfoLog = jest.fn<(shader: WebGLShader) => string>();
    const mockGetProgramParameter = jest.fn<(program: WebGLProgram, pname: number) => boolean>();
    const mockGetProgramInfoLog = jest.fn<(program: WebGLProgram) => string>();

    mockGetShaderParameter.mockReturnValue(true);
    mockGetShaderInfoLog.mockReturnValue('');
    mockGetProgramParameter.mockReturnValue(true);
    mockGetProgramInfoLog.mockReturnValue('');

    mockWebGL2Context = {
      gl: {
        createShader: jest.fn().mockReturnValue({}),
        shaderSource: jest.fn(),
        compileShader: jest.fn(),
        getShaderParameter: mockGetShaderParameter,
        getShaderInfoLog: mockGetShaderInfoLog,
        createProgram: jest.fn().mockReturnValue({}),
        attachShader: jest.fn(),
        linkProgram: jest.fn(),
        getProgramParameter: mockGetProgramParameter,
        getProgramInfoLog: mockGetProgramInfoLog,
        deleteShader: jest.fn(),
        deleteProgram: jest.fn(),
        VERTEX_SHADER: 0x8B31,
        FRAGMENT_SHADER: 0x8B30,
        COMPILE_STATUS: 0x8B81,
        LINK_STATUS: 0x8B82,
      },
      initialize: jest.fn(),
      createTexture: jest.fn(),
      createSampler: jest.fn(),
      createPipeline: jest.fn(),
      submit: jest.fn(),
      dispose: jest.fn(),
    } as unknown as WebGL2Context;

    // Basic shader configuration
    basicShaderConfig = {
      vertex: `
        @vertex
        fn main(@location(0) position: vec4f) -> @builtin(position) vec4f {
          return position;
        }
      `,
      fragment: `
        @fragment
        fn main() -> @location(0) vec4f {
          return vec4f(1.0, 0.0, 0.0, 1.0);
        }
      `,
    };
  });

  describe('WebGPU implementation', () => {
    let shaderManager: ShaderManager;

    beforeEach(() => {
      shaderManager = new ShaderManager(mockWebGPUContext);
    });

    it('should create a shader with WebGPU', async () => {
      const shader = await shaderManager.createShader(basicShaderConfig, 'test-shader');
      
      expect(mockWebGPUContext.device.createShaderModule).toHaveBeenCalledTimes(2);
      expect(mockWebGPUContext.device.createRenderPipeline).toHaveBeenCalled();
      expect(shader).toBeDefined();
      expect(shader.pipeline).toBeDefined();
    });

    it('should return cached shader if exists', async () => {
      const shader1 = await shaderManager.createShader(basicShaderConfig, 'test-shader');
      const shader2 = await shaderManager.createShader(basicShaderConfig, 'test-shader');
      
      expect(shader1).toBe(shader2);
      expect(mockWebGPUContext.device.createShaderModule).toHaveBeenCalledTimes(2);
    });

    it('should dispose shader resources', async () => {
      const shader = await shaderManager.createShader(basicShaderConfig, 'test-shader');
      shaderManager.dispose('test-shader');
      
      expect(shader.pipeline.destroy).toHaveBeenCalled();
    });
  });

  describe('WebGL2 implementation', () => {
    let shaderManager: ShaderManager;

    beforeEach(() => {
      shaderManager = new ShaderManager(mockWebGL2Context);
    });

    it('should create a shader with WebGL2', async () => {
      const shader = await shaderManager.createShader(basicShaderConfig, 'test-shader');
      
      expect(mockWebGL2Context.gl.createShader).toHaveBeenCalledTimes(2);
      expect(mockWebGL2Context.gl.createProgram).toHaveBeenCalled();
      expect(shader).toBeDefined();
      expect(shader.pipeline).toBeDefined();
    });

    it('should handle shader compilation errors', async () => {
      const gl = mockWebGL2Context.gl;
      (gl.getShaderParameter as jest.Mock).mockReturnValue(false);
      (gl.getShaderInfoLog as jest.Mock).mockReturnValue('Compilation failed');

      await expect(
        shaderManager.createShader(basicShaderConfig, 'test-shader')
      ).rejects.toThrow('Vertex shader compilation failed: Compilation failed');
    });

    it('should handle program linking errors', async () => {
      const gl = mockWebGL2Context.gl;
      (gl.getProgramParameter as jest.Mock).mockReturnValue(false);
      (gl.getProgramInfoLog as jest.Mock).mockReturnValue('Linking failed');

      await expect(
        shaderManager.createShader(basicShaderConfig, 'test-shader')
      ).rejects.toThrow('Shader program link failed: Linking failed');
    });

    it('should dispose shader resources', async () => {
      await shaderManager.createShader(basicShaderConfig, 'test-shader');
      shaderManager.dispose('test-shader');
      
      expect(mockWebGL2Context.gl.deleteProgram).toHaveBeenCalled();
    });
  });

  describe('Common functionality', () => {
    let shaderManager: ShaderManager;

    beforeEach(() => {
      shaderManager = new ShaderManager(mockWebGPUContext);
    });

    it('should dispose all shaders', async () => {
      await shaderManager.createShader(basicShaderConfig, 'shader1');
      await shaderManager.createShader(basicShaderConfig, 'shader2');
      
      shaderManager.dispose();
      
      expect(mockWebGPUContext.device.createRenderPipeline).toHaveBeenCalledTimes(2);
    });

    it('should handle invalid shader creation', async () => {
      const invalidConfig = {
        vertex: '',
        fragment: '',
      };

      await expect(
        shaderManager.createShader(invalidConfig, 'invalid-shader')
      ).rejects.toThrow();
    });
  });
}); 