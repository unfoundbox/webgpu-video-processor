import { test, expect } from '@playwright/test';
import { createTestGPUContext, cleanupGPUContext, isWebGPUSupported, isWebGL2Supported } from '../../helpers/gpu-test-utils';

test.describe('GPU Operations', () => {
  test('should detect GPU capabilities', async ({ page }) => {
    await page.goto('/');
    
    // Check GPU capabilities through page context
    const hasWebGPU = await page.evaluate(() => {
      return !!navigator.gpu;
    });
    
    const hasWebGL2 = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      return !!canvas.getContext('webgl2');
    });

    expect(hasWebGPU || hasWebGL2).toBeTruthy();
  });

  test('should render basic GPU content', async ({ page }) => {
    await page.goto('/');
    
    // Wait for canvas to be ready
    const canvas = await page.waitForSelector('canvas');
    expect(canvas).toBeTruthy();

    // Take a screenshot for visual regression testing
    await expect(page).toHaveScreenshot('gpu-render.png', {
      timeout: 5000, // Give more time for GPU operations
      fullPage: true
    });
  });

  test('should handle GPU context creation and cleanup', async ({ page }) => {
    await page.goto('/');
    
    // Test GPU context lifecycle
    const result = await page.evaluate(async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      
      try {
        const context = await navigator.gpu?.requestAdapter();
        if (!context) return { success: false, error: 'No GPU adapter found' };
        
        const device = await context.requestDevice();
        const texture = device.createTexture({
          size: {
            width: 256,
            height: 256,
            depthOrArrayLayers: 1
          },
          format: 'rgba8unorm',
          usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
        });
        
        // Cleanup
        texture.destroy();
        device.destroy();
        
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    expect(result.success).toBeTruthy();
  });
}); 