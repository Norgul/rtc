class CameraController {
    private videoElement: HTMLVideoElement;
    private startButton: HTMLButtonElement;
    private stopButton: HTMLButtonElement;
    private stream: MediaStream | null = null;

    constructor() {
        this.videoElement = document.getElementById('videoElement') as HTMLVideoElement;
        this.startButton = document.getElementById('startButton') as HTMLButtonElement;
        this.stopButton = document.getElementById('stopButton') as HTMLButtonElement;

        this.initializeEventListeners();
    }

    private initializeEventListeners(): void {
        this.startButton.addEventListener('click', () => this.startCamera());
        this.stopButton.addEventListener('click', () => this.stopCamera());
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
            this.startButton.disabled = true;
            this.stopButton.disabled = false;
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
            this.startButton.disabled = false;
            this.stopButton.disabled = true;
        }
    }
}

// Initialize the camera controller when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CameraController();
}); 