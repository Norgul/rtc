export class GrayscaleFilter {
    private canvasContext: CanvasRenderingContext2D;
    private width: number;
    private height: number;

    constructor(canvasContext: CanvasRenderingContext2D, width: number, height: number) {
        this.canvasContext = canvasContext;
        this.width = width;
        this.height = height;
    }

    public apply(): void {
        const imageData = this.canvasContext.getImageData(0, 0, this.width, this.height);
        const data = imageData.data;

        // Apply grayscale filter (advancing by 4 - RGBA)
        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = avg;     // red
            data[i + 1] = avg; // green
            data[i + 2] = avg; // blue
        }

        this.canvasContext.putImageData(imageData, 0, 0);
    }
}
