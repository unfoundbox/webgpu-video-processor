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
  createRenderPipeline(descriptor: GPURenderPipelineDescriptor): GPURenderPipeline;
  createShaderModule(descriptor: GPUShaderModuleDescriptor): GPUShaderModule;
  queue: GPUQueue;
  destroy(): void;
}

export interface GPUQueue {
  submit(commandBuffers: GPUCommandBuffer[]): void;
  writeTexture(
    destination: { texture: GPUTexture },
    data: BufferSource,
    dataLayout: { bytesPerRow: number; rowsPerImage: number },
    size: { width: number; height: number; depthOrArrayLayers: number }
  ): void;
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
export type GPUTextureFormat = 
  | 'rgba8unorm'
  | 'rgba8unorm-srgb'
  | 'bgra8unorm'
  | 'bgra8unorm-srgb'
  | 'r8unorm'
  | 'r8uint'
  | 'r8sint'
  | 'r16uint'
  | 'r16sint'
  | 'r16float'
  | 'rg8unorm'
  | 'rg8uint'
  | 'rg8sint'
  | 'rg16uint'
  | 'rg16sint'
  | 'rg16float'
  | 'rgb10a2unorm';
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

export interface GPUShaderModule {
  compilationInfo(): Promise<GPUCompilationInfo>;
  destroy(): void;
}

export interface GPUCompilationInfo {
  messages: GPUCompilationMessage[];
}

export interface GPUCompilationMessage {
  message: string;
  type: 'error' | 'warning' | 'info';
  lineNum: number;
  linePos: number;
}

export interface GPUShaderModuleDescriptor {
  code: string;
  sourceMap?: object;
}

export interface GPURenderPipelineDescriptor {
  layout: GPUPipelineLayout;
  vertex: GPUVertexState;
  fragment?: GPUFragmentState;
  primitive?: GPUPrimitiveState;
  depthStencil?: GPUDepthStencilState;
  multisample?: GPUMultisampleState;
}

export interface GPUVertexState {
  module: GPUShaderModule;
  entryPoint: string;
  buffers?: GPUVertexBufferLayout[];
}

export interface GPUFragmentState {
  module: GPUShaderModule;
  entryPoint: string;
  targets: GPUColorTargetState[];
}

export interface GPUColorTargetState {
  format: GPUTextureFormat;
  blend?: GPUBlendState;
  writeMask?: GPUColorWriteFlags;
}

export interface GPUBlendState {
  color: GPUBlendComponent;
  alpha: GPUBlendComponent;
}

export interface GPUBlendComponent {
  srcFactor?: GPUBlendFactor;
  dstFactor?: GPUBlendFactor;
  operation?: GPUBlendOperation;
}

export interface GPUPrimitiveState {
  topology?: GPUPrimitiveTopology;
  stripIndexFormat?: GPUIndexFormat;
  frontFace?: GPUFrontFace;
  cullMode?: GPUCullMode;
  unclippedDepth?: boolean;
}

export type GPUPrimitiveTopology = 
  | 'point-list'
  | 'line-list'
  | 'line-strip'
  | 'triangle-list'
  | 'triangle-strip';

export type GPUFrontFaceValue = 'ccw' | 'cw';
export type GPUCullMode = 'none' | 'front' | 'back';
export type GPUBlendFactor = 
  | 'zero'
  | 'one'
  | 'src'
  | 'one-minus-src'
  | 'dst'
  | 'one-minus-dst'
  | 'src-alpha'
  | 'one-minus-src-alpha'
  | 'dst-alpha'
  | 'one-minus-dst-alpha'
  | 'constant'
  | 'one-minus-constant';

export type GPUBlendOperation = 
  | 'add'
  | 'subtract'
  | 'reverse-subtract'
  | 'min'
  | 'max';

export type GPUColorWriteFlags = number;

export interface GPUVertexBufferLayout {
  arrayStride: number;
  stepMode?: GPUVertexStepMode;
  attributes: GPUVertexAttribute[];
}

export interface GPUVertexAttribute {
  format: GPUVertexFormat;
  offset: number;
  shaderLocation: number;
}

export type GPUVertexStepMode = 'vertex' | 'instance';
export type GPUVertexFormat = 
  | 'uint8x2'
  | 'uint8x4'
  | 'sint8x2'
  | 'sint8x4'
  | 'unorm8x2'
  | 'unorm8x4'
  | 'snorm8x2'
  | 'snorm8x4'
  | 'uint16x2'
  | 'uint16x4'
  | 'sint16x2'
  | 'sint16x4'
  | 'unorm16x2'
  | 'unorm16x4'
  | 'snorm16x2'
  | 'snorm16x4'
  | 'float16x2'
  | 'float16x4'
  | 'float32'
  | 'float32x2'
  | 'float32x3'
  | 'float32x4'
  | 'uint32'
  | 'uint32x2'
  | 'uint32x3'
  | 'uint32x4'
  | 'sint32'
  | 'sint32x2'
  | 'sint32x3'
  | 'sint32x4';

export interface GPUDepthStencilState {
  format: GPUTextureFormat;
  depthWriteEnabled: boolean;
  depthCompare: GPUCompareFunction;
  stencilWriteMask: number;
  stencilReadMask: number;
  front: GPUStencilState;
  back: GPUStencilState;
}

export interface GPUStencilState {
  compare: GPUCompareFunction;
  failOp: GPUStencilOp;
  depthFailOp: GPUStencilOp;
  passOp: GPUStencilOp;
}

export interface GPUStencilOp {
  operation: GPUStencilOperation;
}

export interface GPUFrontFace {
  face: GPUFrontFaceValue;
}

export interface GPUMultisampleState {
  count: number;
  mask: number;
  alphaToCoverageEnabled: boolean;
} 