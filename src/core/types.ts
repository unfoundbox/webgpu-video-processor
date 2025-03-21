// WebGPU type declarations
declare global {
  interface Window {
    gpu: GPU;
  }
}

export interface GPU {
  requestAdapter(options?: GPURequestAdapterOptions): Promise<GPUAdapter | null>;
}

export interface GPUAdapter {
  requestDevice(descriptor?: GPUDeviceDescriptor): Promise<GPUDevice>;
}

export interface GPUDevice {
  createCommandEncoder(descriptor?: GPUCommandEncoderDescriptor): GPUCommandEncoder;
  createTexture(descriptor: GPUTextureDescriptor): WebGPUTexture;
  createSampler(descriptor?: GPUSamplerDescriptor): GPUSampler;
  createPipelineLayout(descriptor: GPUPipelineLayoutDescriptor): GPUPipelineLayout;
  queue: GPUQueue;
  destroy(): void;
}

export interface GPUQueue {
  submit(commandBuffers: GPUCommandBuffer[]): void;
}

export interface GPUCommandEncoder {
  beginRenderPass(descriptor: GPURenderPassDescriptor): GPURenderPassEncoder;
  finish(): GPUCommandBuffer;
}

interface WebGPUTexture {
  width: number;
  height: number;
  format: string;
  destroy(): void;
}

interface GPUSampler {
  destroy(): void;
}

interface GPUPipelineLayout {
  destroy(): void;
}

interface GPURenderPassDescriptor {
  colorAttachments: GPURenderPassColorAttachment[];
}

interface GPURenderPassColorAttachment {
  view: GPUTextureView;
  clearValue?: GPUColor;
  loadOp: GPULoadOp;
  storeOp: GPUStoreOp;
}

interface GPUTextureView {
  texture: WebGPUTexture;
  format: string;
  dimension: GPUTextureViewDimension;
  aspect: GPUTextureAspect;
  baseArrayLayer: number;
  arrayLayerCount: number;
  baseMipLevel: number;
  mipLevelCount: number;
}

type GPUColor = [number, number, number, number];
type GPULoadOp = 'clear' | 'load';
type GPUStoreOp = 'store' | 'discard';
export type GPUTextureViewDimension = '1d' | '2d' | '2d-array' | 'cube' | 'cube-array' | '3d';
type GPUTextureAspect = 'all' | 'stencil-only' | 'depth-only';
export type GPUFeatureName = string;

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

interface GPUCommandEncoderDescriptor {
  label?: string;
}

interface GPUTextureDescriptor {
  size: GPUExtent3D;
  mipLevelCount?: number;
  sampleCount?: number;
  dimension?: GPUTextureDimension;
  format: GPUTextureFormat;
  usage: GPUTextureUsageFlags;
  label?: string;
}

interface GPUExtent3D {
  width: number;
  height: number;
  depthOrArrayLayers: number;
}

type GPUTextureDimension = '1d' | '2d' | '3d';
export type GPUTextureFormat = 'rgba8unorm' | 'rgba8unorm-srgb' | 'bgra8unorm' | 'bgra8unorm-srgb';
export type GPUTextureUsageFlags = number;

interface GPUSamplerDescriptor {
  addressModeU?: GPUAddressMode;
  addressModeV?: GPUAddressMode;
  addressModeW?: GPUAddressMode;
  magFilter?: GPUFilterMode;
  minFilter?: GPUFilterMode;
  mipmapFilter?: GPUFilterMode;
  lodMinClamp?: number;
  lodMaxClamp?: number;
  compare?: GPUCompareFunction;
  label?: string;
}

type GPUAddressMode = 'clamp-to-edge' | 'repeat' | 'mirror-repeat';
type GPUFilterMode = 'nearest' | 'linear';
type GPUCompareFunction = 'never' | 'less' | 'equal' | 'less-equal' | 'greater' | 'not-equal' | 'greater-equal' | 'always';

interface GPUPipelineLayoutDescriptor {
  bindGroupLayouts?: GPUBindGroupLayout[];
  pushConstantRanges?: GPUPushConstantRange[];
  label?: string;
}

interface GPUBindGroupLayout {
  entries: GPUBindGroupLayoutEntry[];
  label?: string;
}

interface GPUBindGroupLayoutEntry {
  binding: number;
  visibility: GPUShaderStageFlags;
  buffer?: GPUBufferBindingLayout;
  sampler?: GPUSamplerBindingLayout;
  texture?: GPUTextureBindingLayout;
  storageTexture?: GPUStorageTextureBindingLayout;
}

type GPUShaderStageFlags = number;

interface GPUBufferBindingLayout {
  type: GPUBufferBindingType;
  hasDynamicOffset?: boolean;
  minBindingSize?: number;
}

type GPUBufferBindingType = 'uniform' | 'storage' | 'read-only-storage';

interface GPUSamplerBindingLayout {
  type: GPUSamplerBindingType;
}

type GPUSamplerBindingType = 'filtering' | 'non-filtering' | 'comparison';

interface GPUTextureBindingLayout {
  sampleType: GPUTextureSampleType;
  multisampled: boolean;
  viewDimension: GPUTextureViewDimension;
}

type GPUTextureSampleType = 'unfilterable-float' | 'filterable-float' | 'unfilterable-uint' | 'unfilterable-sint' | 'depth';

interface GPUStorageTextureBindingLayout {
  access: GPUStorageTextureAccess;
  format: GPUTextureFormat;
  viewDimension: GPUTextureViewDimension;
}

type GPUStorageTextureAccess = 'read-only' | 'write-only';

interface GPUPushConstantRange {
  offset: number;
  size: number;
  stageFlags: GPUShaderStageFlags;
}

interface GPUCommandBuffer {
  label?: string;
}

interface GPURenderPassEncoder {
  end(): void;
  setPipeline(pipeline: GPURenderPipeline): void;
  setBindGroup(index: number, bindGroup: GPUBindGroup, dynamicOffsets?: number[]): void;
  setVertexBuffer(slot: number, buffer: GPUBuffer, offset?: number, size?: number): void;
  setIndexBuffer(buffer: GPUBuffer, format: GPUIndexFormat, offset?: number, size?: number): void;
  draw(vertexCount: number, instanceCount?: number, firstVertex?: number, firstInstance?: number): void;
  drawIndexed(indexCount: number, instanceCount?: number, firstIndex?: number, baseVertex?: number, firstInstance?: number): void;
}

interface GPURenderPipeline {
  label?: string;
}

interface GPUBuffer {
  label?: string;
  size: number;
  usage: GPUBufferUsageFlags;
  mapAsync(mode: GPUMapMode, offset?: number, size?: number): Promise<void>;
  getMappedRange(offset?: number, size?: number): ArrayBuffer;
  unmap(): void;
  destroy(): void;
}

interface GPUBindGroup {
  label?: string;
}

type GPUBufferUsageFlags = number;
type GPUIndexFormat = 'uint16' | 'uint32';
type GPUMapMode = number;

export interface GPUTexture {
  width: number;
  height: number;
  format: string;
  destroy(): void;
}

export interface GPUContext {
  initialize(): Promise<void>;
  createTexture(width: number, height: number, format: string): GPUTexture;
  createSampler(): any;
  createPipeline(): any;
  submit(): void;
  dispose(): void;
}

export interface WebGPUContext extends GPUContext {
  device: GPUDevice;
  queue: GPUQueue;
  commandEncoder: GPUCommandEncoder;
}

export interface WebGL2Context extends GPUContext {
  gl: WebGL2RenderingContext;
  program: WebGLProgram;
} 