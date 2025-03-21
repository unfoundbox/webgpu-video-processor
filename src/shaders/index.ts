export { videoFrameShader } from './video-frame';
export { colorAdjustShader } from './color-adjust';
export { filterEffectsShader } from './filter-effects';

export type ShaderType = 'webgpu' | 'webgl2';

export interface ShaderModule {
  vertex: string;
  fragment: string;
}

export interface ShaderCollection {
  webgpu: ShaderModule;
  webgl2: ShaderModule;
} 