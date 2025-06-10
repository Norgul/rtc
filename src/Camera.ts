import {FilterManager} from './FilterManager';

class CameraController {
    private videoElement: HTMLVideoElement;
    private canvasElement: HTMLCanvasElement;
    private canvasContext: CanvasRenderingContext2D;
    private filterManager: FilterManager | null = null;
    private captureButton: HTMLButtonElement;
    private recordButton: HTMLButtonElement;
    private isProcessing: boolean = false;
    private animationFrameId: number | null = null;
    private mediaRecorder: MediaRecorder | null = null;
    private recordedChunks: Blob[] = [];
    private isRecording: boolean = false;

    constructor() {
        this.videoElement = document.getElementById('videoElement') as HTMLVideoElement;

        this.canvasElement = document.getElementById('canvasElement') as HTMLCanvasElement;
        this.canvasContext = this.canvasElement.getContext('2d', {willReadFrequently: true})!;

        this.captureButton = document.getElementById('captureButton') as HTMLButtonElement;
        this.recordButton = document.getElementById('recordButton') as HTMLButtonElement;

        this.captureButton.addEventListener('click', () => this.capturePhoto());
        this.recordButton.addEventListener('click', () => this.toggleRecording());

        this.startCamera();

        window.addEventListener('beforeunload', () => this.dispose());
    }

    private capturePhoto(): void {
        if (this.isProcessing) return;
        this.isProcessing = true;

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvasElement.width;
        tempCanvas.height = this.canvasElement.height;
        const tempContext = tempCanvas.getContext('2d')!;

        tempContext.drawImage(this.canvasElement, 0, 0);

        tempCanvas.toBlob((blob) => {
            if (!blob) {
                console.error('Failed to create image blob');
                this.isProcessing = false;
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
            this.isProcessing = false;
        }, 'image/png');
    }

    private toggleRecording(): void {
        if (this.isRecording) {
            this.stopRecording();
        } else {
            this.startRecording();
        }
    }

    private startRecording(): void {
        if (!this.videoElement.srcObject) return;

        const canvasStream = this.canvasElement.captureStream(30);
        this.mediaRecorder = new MediaRecorder(canvasStream, {
            mimeType: 'video/webm;codecs=vp9'
        });

        this.recordedChunks = [];
        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                this.recordedChunks.push(event.data);
            }
        };

        this.mediaRecorder.onstop = () => {
            const blob = new Blob(this.recordedChunks, {
                type: 'video/webm'
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `video_${new Date().toISOString().replace(/[:.]/g, '-')}.webm`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        };

        this.mediaRecorder.start();
        this.isRecording = true;
        this.recordButton.textContent = 'Stop Recording';
        this.recordButton.classList.add('recording');
    }

    private stopRecording(): void {
        if (!this.mediaRecorder || !this.isRecording) return;

        this.mediaRecorder.stop();
        this.isRecording = false;
        this.recordButton.textContent = 'Record Video';
        this.recordButton.classList.remove('recording');
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
            if (!this.isProcessing) {
                this.canvasContext.drawImage(this.videoElement, 0, 0);

                if (this.filterManager) {
                    this.filterManager.applyFilters();
                }
            }

            this.animationFrameId = requestAnimationFrame(processFrame);
        };

        processFrame();
    }

    public dispose(): void {
        if (this.isRecording) {
            this.stopRecording();
        }

        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        if (this.videoElement.srcObject) {
            const stream = this.videoElement.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            this.videoElement.srcObject = null;
        }

        if (this.filterManager) {
            this.filterManager.dispose();
            this.filterManager = null;
        }

        this.canvasContext.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        this.canvasElement.width = 1;
        this.canvasElement.height = 1;

        this.captureButton.removeEventListener('click', () => this.capturePhoto());
        this.recordButton.removeEventListener('click', () => this.toggleRecording());
    }
}

// Initialize the camera controller when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CameraController();
});
