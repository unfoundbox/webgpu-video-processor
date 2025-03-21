# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project setup
- WebGPU core implementation
- WebGL2 fallback support
- Basic video processing pipeline
- Unit test suite with Jest
- E2E test suite with Playwright
- CI/CD pipeline with GitHub Actions
- Comprehensive documentation
- GPU testing utilities
- Basic video effects (blur, color adjustment, edge detection)

### Changed
- None

### Deprecated
- None

### Removed
- None

### Fixed
- None

### Security
- None

## [0.1.0] - 2024-03-21

### Added
- Core shader implementation
  - Basic video frame rendering shader with WebGPU and WebGL2 support
  - Color adjustment shader with brightness, contrast, and saturation controls
  - Filter effects shader with grayscale, sepia, and invert filters
  - Shader module type definitions and interfaces

- Comprehensive test suite
  - Test utilities for WebGPU and WebGL2 context creation
  - Pixel comparison and texture creation helpers
  - Full test coverage for all shader modules
  - Integration tests for both WebGPU and WebGL2 rendering paths

### Technical Details
- WebGPU shader features:
  - Efficient texture sampling and rendering
  - Uniform buffer management for parameters
  - Modern WGSL shader language implementation
  - Pipeline state and bind group optimization

- WebGL2 shader features:
  - GLSL 300 es shader implementation
  - Vertex attribute management
  - Uniform parameter handling
  - Texture coordinate management

### Developer Notes
- All shaders support both WebGPU and WebGL2 for maximum compatibility
- Test framework includes pixel-perfect comparison with threshold support
- Modular design allows easy addition of new effects and filters 