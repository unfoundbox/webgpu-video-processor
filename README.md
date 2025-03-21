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

## Getting Started

```typescript
// Example usage (coming soon)
import { VideoProcessor } from 'webgpu-video-processor';

const processor = new VideoProcessor({
  canvas: document.querySelector('canvas'),
  fallbackToWebGL2: true
});

// Apply effects
processor.addEffect('logo', {
  image: logoImage,
  position: { x: 10, y: 10 }
});

// Process video
processor.process(videoElement);
```

## Browser Support

- Chrome/Edge: WebGPU (primary)
- Firefox/Safari: WebGL2 (fallback)

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Roadmap

- [ ] Basic video processing pipeline
- [ ] WebGPU implementation
- [ ] WebGL2 fallback
- [ ] Common effects library
- [ ] Performance optimizations
- [ ] Documentation and examples
- [ ] Browser compatibility testing

## Acknowledgments

- WebGPU Working Group
- WebGL Working Group
- Contributors and maintainers of similar projects

## Support

For support, please open an issue in the GitHub repository. 