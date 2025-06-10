import {FilterManager} from './FilterManager';

class CameraController {
    private videoElement: HTMLVideoElement;
    private canvasElement: HTMLCanvasElement;
    private canvasContext: CanvasRenderingContext2D;
    private filterManager: FilterManager | null = null;

    constructor() {
        this.videoElement = document.getElementById('videoElement') as HTMLVideoElement;
        this.canvasElement = document.getElementById('canvasElement') as HTMLCanvasElement;
        this.canvasContext = this.canvasElement.getContext('2d', {willReadFrequently: true})!;
        this.startCamera();
    }

    private async startCamera(): Promise<void> {
        try {
            this.videoElement.srcObject = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: {ideal: 1280},
                    height: {ideal: 720}
                }
            });

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

            let errorMessage = 'Error accessing camera. ';
            if (error instanceof DOMException) {
                switch (error.name) {
                    case 'NotAllowedError':
                        errorMessage += 'Camera access was denied. Please grant camera permissions and try again.';
                        break;
                    case 'NotFoundError':
                        errorMessage += 'No camera device found. Please connect a camera and try again.';
                        break;
                    case 'NotReadableError':
                        errorMessage += 'Camera is already in use by another application. Please close other applications using the camera and try again.';
                        break;
                    default:
                        errorMessage += 'Please make sure you have granted camera permissions.';
                }
            }

            if (confirm(errorMessage + '\n\nWould you like to try again?')) {
                await this.startCamera();
            }
        }
    }

    private startVideoProcessing(): void {
        const processFrame = () => {
            this.canvasContext.drawImage(this.videoElement, 0, 0);

            if (this.filterManager) {
                this.filterManager.applyFilters();
            }

            requestAnimationFrame(processFrame);
        };

        processFrame();
    }
}

// Initialize the camera controller when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CameraController();
});
