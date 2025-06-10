class CameraController {
    private videoElement: HTMLVideoElement;
    private toggleButton: HTMLButtonElement;
    private stream: MediaStream | null = null;
    private isCameraActive: boolean = false;

    constructor() {
        this.videoElement = document.getElementById('videoElement') as HTMLVideoElement;
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
    }

    private async startCamera(): Promise<void> {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });

            this.videoElement.srcObject = this.stream;
            this.isCameraActive = true;
            this.toggleButton.textContent = 'Stop Camera';
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
            this.isCameraActive = false;
            this.toggleButton.textContent = 'Start Camera';
        }
    }
}

// Initialize the camera controller when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CameraController();
}); 