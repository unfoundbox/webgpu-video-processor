/// <reference types="@webgpu/types" />

declare global {
  var GPU: {
    prototype: GPU;
    new(): GPU;
  };
  
  interface Navigator {
    readonly gpu?: GPU;
  }

  interface HTMLCanvasElement {
    getContext(contextId: 'webgpu'): GPUCanvasContext | null;
  }
}

// This empty export makes this file a module
export {}; 