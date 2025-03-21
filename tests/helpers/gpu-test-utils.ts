import { GPUContextFactory } from '../../src/core/gpu-context-factory';
import type { GPUDevice, GPUTexture, GPUTextureFormat } from '@webgpu/types';
import { GPUTextureUsage } from '@webgpu/types';

export interface GPUContext {
  device?: GPUDevice;
  gl?: WebGL2RenderingContext;
  canvas: HTMLCanvasElement;
}

export async function createTestGPUContext(width: number = 256, height: number = 256): Promise<GPUContext> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const context = await GPUContextFactory.createContext(canvas);
  return {
    ...context,
    canvas
  };
}

export function cleanupGPUContext(context: GPUContext) {
  if (context.device) {
    context.device.destroy();
  }
  if (context.gl) {
    const gl = context.gl;
    const loseContext = gl.getExtension('WEBGL_lose_context');
    if (loseContext) {
      loseContext.loseContext();
    }
  }
}

export function isWebGPUSupported(): boolean {
  return GPUContextFactory.isWebGPUSupported();
}

export function isWebGL2Supported(): boolean {
  return GPUContextFactory.isWebGL2Supported();
}

export async function createMockTexture(
  context: GPUContext,
  width: number,
  height: number,
  format: GPUTextureFormat = 'rgba8unorm'
): Promise<GPUTexture> {
  if (!context.device) {
    throw new Error('WebGPU context not available');
  }
  
  return context.device.createTexture({
    size: [width, height],
    format,
    usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
  });
} 