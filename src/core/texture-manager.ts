import { GPUContext, WebGPUContext, WebGL2Context } from './types';
import '@webgpu/types';

export interface TextureConfig {
  format?: GPUTextureFormat;
  usage?: number;
  width?: number;
  height?: number;
}

export interface ManagedTexture {
  width: number;
  height: number;
  format: string;
  texture: GPUTexture | WebGLTexture;
  destroy(): void;
}

export class TextureManager {
  private context: GPUContext;
  private textures: Map<string, ManagedTexture>;
  private isWebGPU: boolean;

  constructor(context: GPUContext) {
    this.context = context;
    this.textures = new Map();
    this.isWebGPU = 'device' in context;
  }

  async createVideoTexture(video: HTMLVideoElement, config?: TextureConfig): Promise<ManagedTexture> {
    if (this.isWebGPU) {
      return this.createWebGPUVideoTexture(video, config);
    } else {
      return this.createWebGL2VideoTexture(video, config);
    }
  }

  private async createWebGPUVideoTexture(video: HTMLVideoElement, config?: TextureConfig): Promise<ManagedTexture> {
    const context = this.context as WebGPUContext;
    const format = config?.format || 'rgba8unorm';
    const usage = config?.usage || (
      GPUTextureUsage.TEXTURE_BINDING |
      GPUTextureUsage.COPY_DST |
      GPUTextureUsage.RENDER_ATTACHMENT
    );

    const texture = context.device.createTexture({
      size: {
        width: video.videoWidth,
        height: video.videoHeight,
        depthOrArrayLayers: 1
      },
      format,
      usage,
    });

    // Create a temporary canvas to copy video frame
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context');
    }
    
    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0);
    
    // Copy canvas contents to texture
    context.device.queue.writeTexture(
      { texture },
      ctx.getImageData(0, 0, video.videoWidth, video.videoHeight).data,
      { bytesPerRow: video.videoWidth * 4, rowsPerImage: video.videoHeight },
      { width: video.videoWidth, height: video.videoHeight, depthOrArrayLayers: 1 }
    );

    const managedTexture: ManagedTexture = {
      width: video.videoWidth,
      height: video.videoHeight,
      format,
      texture,
      destroy: () => texture.destroy()
    };

    const textureId = `video-${video.src}-${Date.now()}`;
    this.textures.set(textureId, managedTexture);
    return managedTexture;
  }

  private createWebGL2VideoTexture(video: HTMLVideoElement, config?: TextureConfig): ManagedTexture {
    const context = this.context as WebGL2Context;
    const gl = context.gl;
    
    const texture = gl.createTexture();
    if (!texture) {
      throw new Error('Failed to create WebGL2 texture');
    }

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);

    const managedTexture: ManagedTexture = {
      width: video.videoWidth,
      height: video.videoHeight,
      format: 'rgba8unorm',
      texture,
      destroy: () => gl.deleteTexture(texture)
    };

    const textureId = `video-${video.src}-${Date.now()}`;
    this.textures.set(textureId, managedTexture);
    return managedTexture;
  }

  updateVideoTexture(video: HTMLVideoElement, managedTexture: ManagedTexture): void {
    if (video.paused || video.ended || !video.videoWidth) {
      return;
    }

    if (this.isWebGPU) {
      const context = this.context as WebGPUContext;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get 2D context');
      }
      
      ctx.drawImage(video, 0, 0);
      
      context.device.queue.writeTexture(
        { texture: managedTexture.texture as GPUTexture },
        ctx.getImageData(0, 0, video.videoWidth, video.videoHeight).data,
        { bytesPerRow: video.videoWidth * 4, rowsPerImage: video.videoHeight },
        { width: video.videoWidth, height: video.videoHeight, depthOrArrayLayers: 1 }
      );
    } else {
      const context = this.context as WebGL2Context;
      const gl = context.gl;
      gl.bindTexture(gl.TEXTURE_2D, managedTexture.texture as WebGLTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
    }
  }

  createSampler(options: GPUSamplerDescriptor = {}): GPUSampler | null {
    if (this.isWebGPU) {
      const context = this.context as WebGPUContext;
      const defaultOptions: GPUSamplerDescriptor = {
        magFilter: 'linear',
        minFilter: 'linear',
        mipmapFilter: 'linear',
        addressModeU: 'clamp-to-edge',
        addressModeV: 'clamp-to-edge',
        ...options,
      };
      return context.device.createSampler(defaultOptions);
    } else {
      // WebGL2 doesn't have separate sampler objects
      return null;
    }
  }

  dispose(textureId?: string): void {
    if (textureId) {
      const texture = this.textures.get(textureId);
      if (texture) {
        texture.destroy();
        this.textures.delete(textureId);
      }
    } else {
      this.textures.forEach(texture => texture.destroy());
      this.textures.clear();
    }
  }
} 