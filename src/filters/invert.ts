export class InvertFilter {
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

        for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i];         // red
            data[i + 1] = 255 - data[i + 1]; // green
            data[i + 2] = 255 - data[i + 2]; // blue
        }

        this.canvasContext.putImageData(imageData, 0, 0);
    }
}
