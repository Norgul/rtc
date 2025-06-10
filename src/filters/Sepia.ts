export class SepiaFilter {
    private canvasContext: CanvasRenderingContext2D;
    private width: number;
    private height: number;

    constructor(canvasContext: CanvasRenderingContext2D, width: number, height: number) {
        this.canvasContext = canvasContext;
        this.width = width;
        this.height = height;
    }

    public apply(intensity: number = 1): void {
        const imageData = this.canvasContext.getImageData(0, 0, this.width, this.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            const sepiaR = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
            const sepiaG = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
            const sepiaB = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));

            data[i] = r * (1 - intensity) + sepiaR * intensity;
            data[i + 1] = g * (1 - intensity) + sepiaG * intensity;
            data[i + 2] = b * (1 - intensity) + sepiaB * intensity;
        }

        this.canvasContext.putImageData(imageData, 0, 0);
    }
} 