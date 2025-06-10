import {GrayscaleFilter} from './filters/grayscale';

class CameraController {
    private videoElement: HTMLVideoElement;
    private canvasElement: HTMLCanvasElement;
    private canvasContext: CanvasRenderingContext2D;
    private toggleButton: HTMLButtonElement;
    private grayscaleButton: HTMLButtonElement;
    private stream: MediaStream | null = null;
    private isCameraActive: boolean = false;
    private isGrayscaleEnabled: boolean = false;
    private animationFrameId: number | null = null;
    private grayscaleFilter: GrayscaleFilter | null = null;

    constructor() {
        this.videoElement = document.getElementById('videoElement') as HTMLVideoElement;
        this.canvasElement = document.getElementById('canvasElement') as HTMLCanvasElement;
        this.canvasContext = this.canvasElement.getContext('2d')!;
        this.toggleButton = document.getElementById('toggleButton') as HTMLButtonElement;
        this.grayscaleButton = document.getElementById('grayscaleButton') as HTMLButtonElement;

        this.initializeEventListeners();
    }

    private initializeEventListeners(): void {
        this.toggleButton.addEventListener('click', () => this.toggleCamera());
        this.grayscaleButton.addEventListener('click', () => this.toggleGrayscale());
    }

    private async toggleCamera(): Promise<void> {
        if (this.isCameraActive) {
            this.stopCamera();
            this.grayscaleButton.disabled = true;
            this.isGrayscaleEnabled = false;
            this.grayscaleButton.textContent = 'Enable Grayscale';
        } else {
            await this.startCamera();
            this.grayscaleButton.disabled = false;
        }

        this.isCameraActive = !this.isCameraActive;
        this.toggleButton.textContent = this.isCameraActive ? 'Stop Camera' : 'Start Camera';
    }

    private async startCamera(): Promise<void> {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: {ideal: 1280},
                    height: {ideal: 720}
                }
            });

            this.videoElement.srcObject = this.stream;

            // Set canvas dimensions to match video
            this.videoElement.onloadedmetadata = () => {
                this.canvasElement.width = this.videoElement.videoWidth;
                this.canvasElement.height = this.videoElement.videoHeight;
                this.grayscaleFilter = new GrayscaleFilter(
                    this.canvasContext,
                    this.canvasElement.width,
                    this.canvasElement.height
                );
                this.startVideoProcessing();
            };
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('Error accessing camera. Please make sure you have granted camera permissions.');
        }
    }

    private stopCamera(): void {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.videoElement.srcObject = null;
            this.stream = null;
            this.grayscaleFilter = null;

            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = null;
            }
        }
    }

    private toggleGrayscale(): void {
        this.isGrayscaleEnabled = !this.isGrayscaleEnabled;
        this.grayscaleButton.textContent = this.isGrayscaleEnabled ? 'Disable Grayscale' : 'Enable Grayscale';
    }

    private startVideoProcessing(): void {
        const processFrame = () => {
            if (!this.isCameraActive) return;

            // Draw the video frame to the canvas
            this.canvasContext.drawImage(this.videoElement, 0, 0);

            if (this.isGrayscaleEnabled && this.grayscaleFilter) {
                this.grayscaleFilter.apply();
            }

            this.animationFrameId = requestAnimationFrame(processFrame);
        };

        processFrame();
    }
}

// Initialize the camera controller when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CameraController();
});
