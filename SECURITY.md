# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of our library seriously. If you discover a security vulnerability, please follow these steps:

1. **Do Not** disclose the vulnerability publicly until it has been addressed
2. Email your findings to [security contact email]
3. Provide detailed information about the vulnerability:
   - Description of the issue
   - Steps to reproduce
   - Potential impact
   - Suggested fixes (if any)
4. We will acknowledge receipt within 48 hours
5. We will provide a timeline for addressing the issue

## Security Best Practices

When using the WebGPU Video Processor library:

1. Always use the latest version
2. Keep your dependencies up to date
3. Run security audits regularly:
   ```bash
   npm audit
   ```
4. Follow the recommended usage patterns in our documentation
5. Use secure contexts (HTTPS) when possible

## Known Security Considerations

1. WebGPU Context:
   - Always validate GPU device capabilities
   - Handle device loss gracefully
   - Use appropriate error boundaries

2. WebGL2 Fallback:
   - Ensure proper context attributes
   - Handle context loss appropriately
   - Validate shader inputs

## Security Updates

Security updates will be released as patch versions (e.g., 0.1.1 → 0.1.2) and will be clearly marked in the [CHANGELOG.md](CHANGELOG.md).

## Contact

For security-related issues, please contact [security contact email]. 