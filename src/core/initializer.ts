export interface GPUContext {
  device: GPUDevice | WebGL2RenderingContext;
  canvas: HTMLCanvasElement;
  isWebGPU: boolean;
}

export class GPUInitializer {
  private static async initWebGPU(canvas: HTMLCanvasElement): Promise<GPUContext | null> {
    if (!navigator.gpu) {
      return null;
    }

    try {
      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter) {
        return null;
      }

      const device = await adapter.requestDevice();
      
      // Handle device loss
      device.lost.then((info) => {
        console.error(`WebGPU device was lost: ${info.message}`);
        if (info.reason !== 'destroyed') {
          // Attempt to reinitialize
          this.initWebGPU(canvas);
        }
      });

      // Get the WebGPU context
      const context = canvas.getContext('webgpu');
      if (!context) {
        return null;
      }

      // Configure the canvas context
      const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
      context.configure({
        device,
        format: canvasFormat,
        alphaMode: 'premultiplied',
      });

      return {
        device,
        canvas,
        isWebGPU: true,
      };
    } catch (error) {
      console.error('Failed to initialize WebGPU:', error);
      return null;
    }
  }

  private static initWebGL2(canvas: HTMLCanvasElement): GPUContext | null {
    try {
      const gl = canvas.getContext('webgl2');
      if (!gl) {
        return null;
      }

      return {
        device: gl,
        canvas,
        isWebGPU: false,
      };
    } catch (error) {
      console.error('Failed to initialize WebGL2:', error);
      return null;
    }
  }

  public static async initialize(canvas: HTMLCanvasElement, fallbackToWebGL2 = true): Promise<GPUContext> {
    // Try WebGPU first
    const webGPUContext = await this.initWebGPU(canvas);
    if (webGPUContext) {
      return webGPUContext;
    }

    // Fallback to WebGL2 if requested
    if (fallbackToWebGL2) {
      const webGL2Context = this.initWebGL2(canvas);
      if (webGL2Context) {
        return webGL2Context;
      }
    }

    throw new Error('Failed to initialize GPU context. WebGPU and WebGL2 are not available.');
  }
} 