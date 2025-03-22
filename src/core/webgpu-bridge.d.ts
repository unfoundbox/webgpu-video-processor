/// <reference types="@webgpu/types" />

declare global {
  interface Navigator extends NavigatorGPU {}
}

// Bridge interfaces to handle type compatibility
interface GPUObjectBase {
  label: string | undefined;
}

interface GPUObjectDescriptorBase {
  label?: string;
}

interface GPUDeviceBridge extends GPUDevice, GPUObjectBase {
  features: GPUFeatureSet;
  limits: Required<GPUSupportedLimits>;
  queue: GPUQueue;
  lost: Promise<GPUDeviceLostInfo>;
  pushErrorScope(filter: GPUErrorFilter): void;
  popErrorScope(): Promise<GPUError | null>;
  createBuffer(descriptor: GPUBufferDescriptor): GPUBuffer;
  createTexture(descriptor: GPUTextureDescriptor): GPUTexture;
  createSampler(descriptor?: GPUSamplerDescriptor): GPUSampler;
  createBindGroupLayout(descriptor: GPUBindGroupLayoutDescriptor): GPUBindGroupLayout;
  createPipelineLayout(descriptor: GPUPipelineLayoutDescriptor): GPUPipelineLayout;
  createBindGroup(descriptor: GPUBindGroupDescriptor): GPUBindGroup;
  createShaderModule(descriptor: GPUShaderModuleDescriptor): GPUShaderModule;
  createComputePipeline(descriptor: GPUComputePipelineDescriptor): GPUComputePipeline;
  createRenderPipeline(descriptor: GPURenderPipelineDescriptor): GPURenderPipeline;
  createCommandEncoder(descriptor?: GPUCommandEncoderDescriptor): GPUCommandEncoder;
  createRenderBundleEncoder(descriptor: GPURenderBundleEncoderDescriptor): GPURenderBundleEncoder;
  destroy(): void;
}

interface GPUQueueBridge extends GPUQueue {
  submit(commandBuffers: Iterable<GPUCommandBuffer>): void;
  onSubmittedWorkDone(): Promise<void>;
  writeBuffer(
    buffer: GPUBuffer,
    bufferOffset: number,
    data: BufferSource,
    dataOffset?: number,
    size?: number
  ): void;
  writeTexture(
    destination: GPUImageCopyTexture,
    data: BufferSource,
    dataLayout: GPUImageDataLayout,
    size: GPUExtent3D
  ): void;
}

export {
  GPUDeviceBridge as GPUDevice,
  GPUQueueBridge as GPUQueue
}; 