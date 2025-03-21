import { GPUContext, WebGPUContext, WebGL2Context } from './types';
import { WebGPUContextImpl } from './webgpu-context';
import { WebGL2ContextImpl } from './webgl2-context';

export class GPUContextFactory {
  static async createContext(canvas: HTMLCanvasElement): Promise<GPUContext> {
    // Check for WebGPU support
    if (navigator.gpu) {
      try {
        const adapter = await navigator.gpu.requestAdapter();
        if (adapter) {
          const context = new WebGPUContextImpl(canvas);
          await context.initialize();
          return context;
        }
      } catch (error) {
        console.warn('WebGPU initialization failed, falling back to WebGL2:', error);
      }
    }

    // Fallback to WebGL2
    try {
      const context = new WebGL2ContextImpl(canvas);
      await context.initialize();
      return context;
    } catch (error) {
      throw new Error('Neither WebGPU nor WebGL2 is supported in this browser');
    }
  }

  static isWebGPUSupported(): boolean {
    return !!navigator.gpu;
  }

  static isWebGL2Supported(): boolean {
    const canvas = document.createElement('canvas');
    return !!canvas.getContext('webgl2');
  }
} 