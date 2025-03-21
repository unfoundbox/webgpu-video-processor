import {
  WebGPUContext,
  GPUTexture,
  GPUDevice,
  GPUQueue,
  GPUCommandEncoder,
  GPUTextureFormat,
  GPUTextureUsageFlags,
} from './types';

declare global {
  interface Navigator {
    gpu: GPU;
  }

  interface HTMLCanvasElement {
    getContext(contextId: 'webgpu'): GPUCanvasContext | null;
  }

  interface GPUCanvasContext {
    configure(configuration: GPUCanvasConfiguration): void;
    getCurrentTexture(): GPUTexture;
  }

  interface GPU {
    requestAdapter(options?: GPURequestAdapterOptions): Promise<GPUAdapter | null>;
  }

  interface GPUAdapter {
    requestDevice(descriptor?: GPUDeviceDescriptor): Promise<GPUDevice>;
  }

  interface GPURequestAdapterOptions {
    powerPreference?: 'low-power' | 'high-performance';
    forceFallbackAdapter?: boolean;
  }

  interface GPUDeviceDescriptor {
    requiredFeatures?: GPUFeatureName[];
    requiredLimits?: Record<string, number>;
    defaultQueue?: GPUQueueDescriptor;
  }

  interface GPUQueueDescriptor {
    label?: string;
  }

  interface GPUFeatureName {
    toString(): string;
  }

  interface GPUCanvasConfiguration {
    device: GPUDevice;
    format: GPUTextureFormat;
    alphaMode?: 'opaque' | 'premultiplied';
  }
}

export class WebGPUContextImpl implements WebGPUContext {
  device!: GPUDevice;
  queue!: GPUQueue;
  commandEncoder!: GPUCommandEncoder;
  private canvas: HTMLCanvasElement;
  private context: GPUCanvasContext | null = null;
  private format: GPUTextureFormat = 'bgra8unorm';

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  async initialize(): Promise<void> {
    if (!navigator.gpu) {
      throw new Error('WebGPU is not supported in this browser');
    }

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      throw new Error('No WebGPU adapter found');
    }

    this.device = await adapter.requestDevice();
    this.queue = this.device.queue;
    this.context = this.canvas.getContext('webgpu');
    
    if (!this.context) {
      throw new Error('Failed to get WebGPU context');
    }

    this.context.configure({
      device: this.device,
      format: this.format,
      alphaMode: 'premultiplied',
    });

    this.commandEncoder = this.device.createCommandEncoder();
  }

  createTexture(width: number, height: number, format: string = this.format): GPUTexture {
    return this.device.createTexture({
      size: { width, height, depthOrArrayLayers: 1 },
      format: format as GPUTextureFormat,
      usage: 1 | 2, // COPY_DST | RENDER_ATTACHMENT
    });
  }

  createSampler(): any {
    return this.device.createSampler({
      magFilter: 'linear',
      minFilter: 'linear',
      mipmapFilter: 'linear',
    });
  }

  createPipeline(): any {
    // TODO: Implement pipeline creation
    throw new Error('Not implemented');
  }

  submit(): void {
    this.queue.submit([this.commandEncoder.finish()]);
    this.commandEncoder = this.device.createCommandEncoder();
  }

  dispose(): void {
    this.device.destroy();
  }
} 