import '@testing-library/jest-dom';
import { createTestGPUContext, cleanupGPUContext, isWebGPUSupported, isWebGL2Supported, createMockTexture } from '../../helpers/gpu-test-utils';

describe('GPU Operations', () => {
  let gpuContext: Awaited<ReturnType<typeof createTestGPUContext>>;

  beforeEach(async () => {
    gpuContext = await createTestGPUContext();
  });

  afterEach(() => {
    cleanupGPUContext(gpuContext);
  });

  describe('GPU Context Creation', () => {
    it('should detect GPU capabilities', () => {
      const hasWebGPU = isWebGPUSupported();
      const hasWebGL2 = isWebGL2Supported();
      
      expect(hasWebGPU || hasWebGL2).toBeTruthy();
    });

    it('should create a valid GPU context', () => {
      expect(gpuContext.canvas).toBeDefined();
      expect(gpuContext.device || gpuContext.gl).toBeDefined();
    });
  });

  describe('Texture Operations', () => {
    it('should create and destroy textures', async () => {
      if (!gpuContext.device) {
        console.warn('WebGPU not available, skipping texture test');
        return;
      }

      const texture = await createMockTexture(gpuContext, 256, 256);
      expect(texture).toBeDefined();
      
      // Test texture properties
      expect(texture.width).toBe(256);
      expect(texture.height).toBe(256);
      expect(texture.format).toBe('rgba8unorm');
      
      texture.destroy();
    });
  });

  describe('Error Handling', () => {
    it('should handle unsupported GPU gracefully', async () => {
      // Mock WebGPU as unsupported
      const originalGPU = global.navigator.gpu;
      global.navigator.gpu = undefined;

      try {
        const context = await createTestGPUContext();
        expect(context.gl).toBeDefined(); // Should fall back to WebGL2
        cleanupGPUContext(context);
      } finally {
        global.navigator.gpu = originalGPU;
      }
    });
  });
}); 