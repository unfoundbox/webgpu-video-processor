async function main() {
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    document.body.appendChild(canvas);

    // Check WebGPU support
    if (!navigator.gpu) {
        throw new Error('WebGPU is not supported in this browser');
    }

    // Request adapter and device
    const adapter = await navigator.gpu.requestAdapter({
        powerPreference: 'high-performance'
    });
    
    if (!adapter) {
        throw new Error('No WebGPU adapter found');
    }

    const device = await adapter.requestDevice();
    const context = canvas.getContext('webgpu');
    
    if (!context) {
        throw new Error('Failed to get WebGPU context');
    }

    // Configure canvas
    const format = navigator.gpu.getPreferredCanvasFormat();
    context.configure({
        device,
        format,
        alphaMode: 'premultiplied',
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_DST
    });

    // Create command encoder and render pass
    const commandEncoder = device.createCommandEncoder();
    const renderPassDescriptor: GPURenderPassDescriptor = {
        colorAttachments: [{
            view: context.getCurrentTexture().createView(),
            clearValue: { r: 0.0, g: 0.0, b: 1.0, a: 1.0 }, // Blue color
            loadOp: 'clear',
            storeOp: 'store'
        }]
    };

    // Create and submit command buffer
    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
    passEncoder.end();
    device.queue.submit([commandEncoder.finish()]);

    // Add some basic styling
    const style = document.createElement('style');
    style.textContent = `
        body {
            margin: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: #1a1a1a;
        }
        canvas {
            border: 2px solid #333;
            border-radius: 4px;
        }
    `;
    document.head.appendChild(style);
}

main().catch(console.error); 