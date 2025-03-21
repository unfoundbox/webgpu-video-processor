# Contributing to WebGPU Video Processor

Thank you for your interest in contributing to WebGPU Video Processor! This document provides guidelines and instructions for contributing to the project.

## Development Setup

1. Fork and clone the repository:
```bash
git clone https://github.com/yourusername/webgpu-video-processor.git
cd webgpu-video-processor
```

2. Install dependencies:
```bash
npm install
```

3. Create a new branch for your feature:
```bash
git checkout -b feature/your-feature-name
```

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow the existing code style and formatting
- Run `npm run format` before committing
- Run `npm run lint` to check for linting errors

### Testing

- Write unit tests for all new features
- Add E2E tests for critical user flows
- Ensure all tests pass before submitting PR
- Maintain or improve test coverage

```bash
# Run all tests
npm run test:ci

# Run tests with coverage
npm run test:coverage
```

### Documentation

- Update README.md for significant changes
- Add JSDoc comments for new public APIs
- Include examples for new features
- Update API documentation

### Commit Messages

Follow conventional commits format:
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- style: Code style changes
- refactor: Code refactoring
- test: Adding or modifying tests
- chore: Maintenance tasks

## Pull Request Process

1. Update your branch with the latest changes:
```bash
git fetch origin
git rebase origin/main
```

2. Run tests and linting:
```bash
npm run test:ci
npm run lint
```

3. Push your changes:
```bash
git push origin feature/your-feature-name
```

4. Create a Pull Request:
   - Use a clear title
   - Provide a detailed description
   - Link related issues
   - Include screenshots for UI changes

## Review Process

- All PRs require at least one review
- Address review comments promptly
- Keep PRs focused and manageable
- Update PR based on feedback

## GPU Testing Guidelines

### Unit Tests

- Test GPU context creation and cleanup
- Verify texture operations
- Test error handling
- Include WebGL2 fallback tests

### E2E Tests

- Test GPU capabilities detection
- Verify basic GPU rendering
- Test GPU context lifecycle
- Include visual regression tests

### Performance Testing

- Benchmark critical operations
- Test with different input sizes
- Verify memory usage
- Compare WebGPU vs WebGL2 performance

## Release Process

1. Update version in package.json
2. Update CHANGELOG.md
3. Create release branch
4. Run full test suite
5. Build and verify
6. Create GitHub release
7. Publish to npm

## Getting Help

- Open an issue for bugs
- Use discussions for questions
- Join our community chat
- Check existing documentation

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License. 