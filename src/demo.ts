import { WebGPUVideoProcessor } from './index';

async function main() {
    // Create video element
    const video = document.createElement('video');
    video.width = 640;
    video.height = 480;
    video.autoplay = true;
    video.muted = true; // Required for autoplay in most browsers
    
    // Get user media (webcam)
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 640 },
                height: { ideal: 480 }
            }
        });
        video.srcObject = stream;
        document.body.appendChild(video);
        
        // Create canvas for output
        const canvas = document.createElement('canvas');
        canvas.width = video.width;
        canvas.height = video.height;
        document.body.appendChild(canvas);
        
        // Initialize video processor
        const processor = new WebGPUVideoProcessor({
            enableWebGL2Fallback: false,
            preferHighPerformance: true,
            debug: true
        });
        
        // Wait for video to be ready
        await new Promise<void>((resolve) => {
            video.onloadedmetadata = () => resolve();
            video.onerror = () => {
                throw new Error('Failed to load video');
            };
        });
        
        // Start processing
        await processor.initialize(canvas);
        
        // Process frames in a loop
        async function processFrame() {
            if (processor.isInitialized) {
                await processor.process(video);
            }
            requestAnimationFrame(processFrame);
        }
        
        processFrame();
        
    } catch (error) {
        console.error('Error:', error);
    }
}

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
        color: white;
        font-family: Arial, sans-serif;
    }
    video, canvas {
        margin: 10px;
        border: 2px solid #333;
        border-radius: 4px;
    }
`;
document.head.appendChild(style);

main().catch(console.error); 