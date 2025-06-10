import {FilterManager} from './FilterManager';

class CameraController {
    private videoElement: HTMLVideoElement;
    private canvasElement: HTMLCanvasElement;
    private canvasContext: CanvasRenderingContext2D;
    private toggleButton: HTMLButtonElement;
    private stream: MediaStream | null = null;
    private isCameraActive: boolean = false;
    private animationFrameId: number | null = null;
    private filterManager: FilterManager | null = null;

    constructor() {
        this.videoElement = document.getElementById('videoElement') as HTMLVideoElement;
        this.canvasElement = document.getElementById('canvasElement') as HTMLCanvasElement;
        this.canvasContext = this.canvasElement.getContext('2d', {willReadFrequently: true})!;
        this.toggleButton = document.getElementById('toggleButton') as HTMLButtonElement;
        this.initializeEventListeners();
    }

    private initializeEventListeners(): void {
        this.toggleButton.addEventListener('click', () => this.toggleCamera());
    }

    private async toggleCamera(): Promise<void> {
        if (this.isCameraActive) {
            this.stopCamera();
        } else {
            await this.startCamera();
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

            this.videoElement.onloadedmetadata = () => {
                this.canvasElement.width = this.videoElement.videoWidth;
                this.canvasElement.height = this.videoElement.videoHeight;

                this.filterManager = new FilterManager(
                    this.canvasContext,
                    this.canvasElement.width,
                    this.canvasElement.height
                );

                this.filterManager.enableAllButtons();
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

            if (this.filterManager) {
                this.filterManager.destroy();
                this.filterManager = null;
            }

            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = null;
            }
        }
    }

    private startVideoProcessing(): void {
        const processFrame = () => {
            if (!this.isCameraActive) return;

            this.canvasContext.drawImage(this.videoElement, 0, 0);

            if (this.filterManager) {
                this.filterManager.applyFilters();
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
