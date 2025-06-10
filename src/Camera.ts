import {FilterManager} from './FilterManager';

class CameraController {
    private videoElement: HTMLVideoElement;
    private canvasElement: HTMLCanvasElement;
    private canvasContext: CanvasRenderingContext2D;
    private filterManager: FilterManager | null = null;
    private captureButton: HTMLButtonElement;

    constructor() {
        this.videoElement = document.getElementById('videoElement') as HTMLVideoElement;

        this.canvasElement = document.getElementById('canvasElement') as HTMLCanvasElement;
        this.canvasContext = this.canvasElement.getContext('2d', {willReadFrequently: true})!;

        this.captureButton = document.getElementById('captureButton') as HTMLButtonElement;
        this.captureButton.addEventListener('click', () => this.capturePhoto());

        this.startCamera();
    }

    private capturePhoto(): void {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvasElement.width;
        tempCanvas.height = this.canvasElement.height;
        const tempContext = tempCanvas.getContext('2d')!;

        tempContext.drawImage(this.canvasElement, 0, 0);

        tempCanvas.toBlob((blob) => {
            if (!blob) {
                console.error('Failed to create image blob');
                return;
            }

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `photo_${new Date().toISOString().replace(/[:.]/g, '-')}.png`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(url);
        }, 'image/png');
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

                this.startVideoProcessing();
            };
        } catch (error) {
            console.error('Error accessing camera:', error);

            if (await this.handleCameraError(error)) {
                await this.startCamera();
            }
        }
    }

    private async handleCameraError(error: unknown): Promise<boolean> {
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

        return confirm(errorMessage + '\n\nWould you like to try again?');
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
