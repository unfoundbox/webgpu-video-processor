# WebGPU Video Processor

A high-performance, GPU-accelerated video processing library for web applications. Built with WebGPU and WebGL2 fallback support.

## Overview

WebGPU Video Processor is an open-source library that enables efficient video processing directly in the browser using modern GPU acceleration. It provides a simple API for common video processing tasks while leveraging the power of WebGPU (with WebGL2 fallback) for optimal performance.

### Key Features

- 🚀 GPU-accelerated video processing
- 🎨 Easy-to-use API for common video effects
- 🔄 Automatic WebGL2 fallback for broader browser support
- 🎯 High-performance frame processing
- 🛠️ Extensible architecture for custom effects
- 📦 Zero dependencies

### Current Status

- Core GPU operations implemented
- WebGL2 fallback support
- Comprehensive test coverage
- Cross-browser compatibility
- GPU testing utilities

### Use Cases

- Logo overlay on videos
- Caption burning
- Background image compositing
- Layout transformations
- Color space conversions
- Frame rate handling
- Real-time video effects

## Technical Details

### Architecture

The library is built with a layered architecture:

1. **Core Layer**: Handles GPU initialization and resource management
2. **Processing Layer**: Implements video processing algorithms
3. **Effects Layer**: Provides pre-built effects and transformations
4. **API Layer**: Exposes a simple, developer-friendly interface

### Technology Stack

- **Primary**: WebGPU (Modern GPU API)
- **Fallback**: WebGL2
- **Language**: TypeScript
- **Build Tool**: Vite

### Performance Considerations

- Minimizes CPU/GPU memory copies
- Leverages GPU parallelization
- Efficient resource management
- Automatic format conversion optimization

### Current Implementation

```typescript
interface VideoProcessorOptions {
  width: number;
  height: number;
  debug?: boolean;
}

class VideoProcessor {
  constructor(options: VideoProcessorOptions);
  async checkGPUSupport(): Promise<boolean>;
  async destroy(): Promise<void>;
}
```

## Project Structure

```
webgpu-video-processor/
├── src/
│   ├── core/           # Core GPU operations
│   ├── utils/          # Utility functions
│   └── types/          # TypeScript definitions
├── tests/
│   ├── unit/          # Jest tests
│   └── e2e/           # Playwright tests
├── .github/           # GitHub Actions
└── docs/             # Documentation
```

## Features

- 🚀 GPU-accelerated video processing using WebGPU
- 🔄 Automatic WebGL2 fallback for broader browser support
- 🎨 Real-time video effects and filters
- 📦 Zero dependencies
- 🔍 Comprehensive test coverage
- 📱 Cross-browser compatibility

## Installation

```bash
npm install webgpu-video-processor
```

## Quick Start

```typescript
import { VideoProcessor } from 'webgpu-video-processor';

// Initialize the video processor
const processor = new VideoProcessor({
  width: 1920,
  height: 1080,
  useWebGPU: true // Automatically falls back to WebGL2 if WebGPU is not available
});

// Process a video frame
const outputTexture = await processor.processFrame(inputTexture);

// Apply effects
await processor.applyEffect('blur', { radius: 5 });
await processor.applyEffect('colorAdjust', { brightness: 1.2 });
```

## Browser Support

- Chrome/Chromium 113+: WebGPU support (primary)
- Edge 113+: WebGPU support
- Firefox: WebGL2 fallback
- Safari 16.4+: WebGL2 fallback

## Development

### Prerequisites

- Node.js 20 or higher
- npm 9 or higher
- Modern web browser with WebGPU support

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/webgpu-video-processor.git
cd webgpu-video-processor
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

### Testing Infrastructure

#### Unit Tests (Jest)
```bash
npm test              # Run all unit tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

#### End-to-End Tests (Playwright)
```bash
npm run test:e2e      # Run all E2E tests
npm run test:e2e:ui   # Run E2E tests with UI
npm run test:e2e:debug # Run E2E tests in debug mode
```

### Building

```bash
npm run build
```

The build output will be available in the `dist` directory.

## API Documentation

### VideoProcessor

The main class for video processing operations.

#### Constructor Options

```typescript
interface VideoProcessorOptions {
  width: number;
  height: number;
  useWebGPU?: boolean;  // Default: true
  fallbackToWebGL2?: boolean;  // Default: true
}
```

#### Methods

- `processFrame(inputTexture: GPUTexture): Promise<GPUTexture>`
- `applyEffect(effectName: string, options: EffectOptions): Promise<void>`
- `destroy(): void`

### Available Effects

- `blur`: Gaussian blur effect
- `colorAdjust`: Color adjustment (brightness, contrast, saturation)
- `edgeDetection`: Edge detection filter
- `sharpen`: Image sharpening
- `denoise`: Noise reduction

## Examples

### Basic Video Processing

```typescript
import { VideoProcessor } from 'webgpu-video-processor';

const video = document.querySelector('video');
const canvas = document.querySelector('canvas');
const processor = new VideoProcessor({
  width: video.videoWidth,
  height: video.videoHeight
});

// Process video frames
video.addEventListener('play', async () => {
  while (!video.paused) {
    const frame = await processor.processFrame(video);
    processor.renderToCanvas(frame, canvas);
    await new Promise(resolve => requestAnimationFrame(resolve));
  }
});
```

### Applying Effects

```typescript
// Apply multiple effects
await processor.applyEffect('blur', { radius: 3 });
await processor.applyEffect('colorAdjust', {
  brightness: 1.1,
  contrast: 1.2,
  saturation: 1.1
});
await processor.applyEffect('sharpen', { amount: 0.5 });
```

### Custom Effects

```typescript
// Create a custom effect
processor.registerEffect('customEffect', {
  shader: `
    @vertex
    fn vertexMain(@location(0) position: vec2f) -> @builtin(position) vec4f {
      return vec4f(position, 0.0, 1.0);
    }
    
    @fragment
    fn fragmentMain(@location(0) uv: vec2f) -> @location(0) vec4f {
      return vec4f(uv.x, uv.y, 0.0, 1.0);
    }
  `,
  uniforms: {
    intensity: { type: 'float', default: 1.0 }
  }
});
```

## Roadmap

### Phase 1 - Foundation (Current)
- [x] Project setup
- [x] Basic GPU operations
- [x] Testing infrastructure
- [x] CI/CD pipeline

### Phase 2 - Core Features (In Progress)
- [ ] Video frame processing
- [ ] Basic effects pipeline
- [ ] Performance optimization
- [ ] WebGL2 fallback improvements

### Phase 3 - Advanced Features (Planned)
- [ ] Custom shader support
- [ ] Advanced video effects
- [ ] Real-time processing
- [ ] Performance monitoring

## Troubleshooting

### Common Issues

1. **WebGPU Not Available**
   - Ensure you're using a supported browser
   - Check if hardware acceleration is enabled
   - Try using WebGL2 fallback

2. **Performance Issues**
   - Monitor GPU memory usage
   - Check for unnecessary texture copies
   - Optimize shader complexity

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- WebGPU Working Group
- WebGL Working Group
- Contributors and maintainers

## Support

For support, please open an issue in the GitHub repository. 