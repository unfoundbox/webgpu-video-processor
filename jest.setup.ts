import '@testing-library/jest-dom';

// Mock WebGPU globals
declare global {
  interface Navigator {
    gpu: any;
  }
}

global.navigator.gpu = {
  requestAdapter: async () => ({
    requestDevice: async () => ({
      createTexture: () => ({
        width: 256,
        height: 256,
        format: 'rgba8unorm',
        destroy: () => {}
      }),
      destroy: () => {}
    })
  })
};

// Mock WebGL2 context
const mockWebGL2Context = {
  getExtension: () => ({
    loseContext: () => {}
  })
} as unknown as WebGL2RenderingContext;

// Mock canvas getContext
const originalGetContext = HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.getContext = function(contextId: string, options?: any) {
  if (contextId === 'webgl2') {
    return mockWebGL2Context;
  }
  return originalGetContext.call(this, contextId as any, options);
}; 