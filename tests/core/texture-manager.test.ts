import { TextureManager, ManagedTexture } from '../../src/core/texture-manager';
import { GPUContext, WebGPUContext, WebGL2Context } from '../../src/core/types';

describe('TextureManager', () => {
  let mockWebGPUContext: WebGPUContext;
  let mockWebGL2Context: WebGL2Context;
  let mockVideo: HTMLVideoElement;

  beforeEach(() => {
    // Mock WebGPU context
    mockWebGPUContext = {
      device: {
        createTexture: jest.fn().mockReturnValue({
          destroy: jest.fn(),
        }),
        createSampler: jest.fn().mockReturnValue({}),
        queue: {
          writeTexture: jest.fn(),
        },
      },
      initialize: jest.fn(),
      createTexture: jest.fn(),
      createSampler: jest.fn(),
      createPipeline: jest.fn(),
      submit: jest.fn(),
      dispose: jest.fn(),
    } as unknown as WebGPUContext;

    // Mock WebGL2 context
    mockWebGL2Context = {
      gl: {
        createTexture: jest.fn().mockReturnValue({}),
        bindTexture: jest.fn(),
        texParameteri: jest.fn(),
        texImage2D: jest.fn(),
        deleteTexture: jest.fn(),
        TEXTURE_2D: 0x0DE1,
        TEXTURE_WRAP_S: 0x2802,
        TEXTURE_WRAP_T: 0x2803,
        TEXTURE_MIN_FILTER: 0x2801,
        TEXTURE_MAG_FILTER: 0x2800,
        CLAMP_TO_EDGE: 0x812F,
        LINEAR: 0x2601,
        RGBA: 0x1908,
        UNSIGNED_BYTE: 0x1401,
      },
      initialize: jest.fn(),
      createTexture: jest.fn(),
      createSampler: jest.fn(),
      createPipeline: jest.fn(),
      submit: jest.fn(),
      dispose: jest.fn(),
    } as unknown as WebGL2Context;

    // Create a base mock video object
    const videoBase = {} as HTMLVideoElement;

    // Add read-only properties
    Object.defineProperties(videoBase, {
      videoWidth: { value: 640, configurable: true },
      videoHeight: { value: 480, configurable: true },
      paused: { value: false, configurable: true },
      ended: { value: false, configurable: true },
      src: { value: 'test-video.mp4', configurable: true }
    });

    mockVideo = videoBase;

    // Mock canvas and context
    const mockCtx = {
      drawImage: jest.fn(),
      getImageData: jest.fn().mockReturnValue({
        data: new Uint8Array(640 * 480 * 4),
      }),
    };

    global.document.createElement = jest.fn().mockReturnValue({
      getContext: jest.fn().mockReturnValue(mockCtx),
    });
  });

  describe('WebGPU implementation', () => {
    let textureManager: TextureManager;

    beforeEach(() => {
      textureManager = new TextureManager(mockWebGPUContext);
    });

    it('should create a video texture with WebGPU', async () => {
      const texture = await textureManager.createVideoTexture(mockVideo);
      
      expect(mockWebGPUContext.device.createTexture).toHaveBeenCalledWith({
        size: {
          width: mockVideo.videoWidth,
          height: mockVideo.videoHeight,
          depthOrArrayLayers: 1,
        },
        format: 'rgba8unorm',
        usage: expect.any(Number),
      });

      expect(texture).toBeDefined();
      expect(texture.width).toBe(mockVideo.videoWidth);
      expect(texture.height).toBe(mockVideo.videoHeight);
    });

    it('should update a video texture with WebGPU', async () => {
      const texture = await textureManager.createVideoTexture(mockVideo);
      textureManager.updateVideoTexture(mockVideo, texture);

      expect(mockWebGPUContext.device.queue.writeTexture).toHaveBeenCalled();
    });

    it('should create a sampler with WebGPU', () => {
      const sampler = textureManager.createSampler();
      expect(mockWebGPUContext.device.createSampler).toHaveBeenCalled();
      expect(sampler).toBeDefined();
    });
  });

  describe('WebGL2 implementation', () => {
    let textureManager: TextureManager;

    beforeEach(() => {
      textureManager = new TextureManager(mockWebGL2Context);
    });

    it('should create a video texture with WebGL2', async () => {
      const texture = await textureManager.createVideoTexture(mockVideo);
      
      expect(mockWebGL2Context.gl.createTexture).toHaveBeenCalled();
      expect(mockWebGL2Context.gl.texParameteri).toHaveBeenCalledTimes(4);
      expect(mockWebGL2Context.gl.texImage2D).toHaveBeenCalled();

      expect(texture).toBeDefined();
      expect(texture.width).toBe(mockVideo.videoWidth);
      expect(texture.height).toBe(mockVideo.videoHeight);
    });

    it('should update a video texture with WebGL2', async () => {
      const texture = await textureManager.createVideoTexture(mockVideo);
      textureManager.updateVideoTexture(mockVideo, texture);

      expect(mockWebGL2Context.gl.bindTexture).toHaveBeenCalled();
      expect(mockWebGL2Context.gl.texImage2D).toHaveBeenCalled();
    });

    it('should return null for sampler with WebGL2', () => {
      const sampler = textureManager.createSampler();
      expect(sampler).toBeNull();
    });
  });

  describe('Common functionality', () => {
    let textureManager: TextureManager;

    beforeEach(() => {
      textureManager = new TextureManager(mockWebGPUContext);
    });

    it('should not update texture if video is paused', async () => {
      const texture = await textureManager.createVideoTexture(mockVideo);
      Object.defineProperty(mockVideo, 'paused', { value: true, configurable: true });
      textureManager.updateVideoTexture(mockVideo, texture);

      expect(mockWebGPUContext.device.queue.writeTexture).not.toHaveBeenCalled();
    });

    it('should not update texture if video has ended', async () => {
      const texture = await textureManager.createVideoTexture(mockVideo);
      Object.defineProperty(mockVideo, 'ended', { value: true, configurable: true });
      textureManager.updateVideoTexture(mockVideo, texture);

      expect(mockWebGPUContext.device.queue.writeTexture).not.toHaveBeenCalled();
    });

    it('should dispose of textures', async () => {
      const texture = await textureManager.createVideoTexture(mockVideo);
      const destroySpy = jest.spyOn(texture, 'destroy');
      
      textureManager.dispose();
      expect(destroySpy).toHaveBeenCalled();
    });
  });
}); 