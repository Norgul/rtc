export class InvertFilter {
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
            const invertedR = 255 - data[i];
            const invertedG = 255 - data[i + 1];
            const invertedB = 255 - data[i + 2];

            data[i] = data[i] * (1 - intensity) + invertedR * intensity;
            data[i + 1] = data[i + 1] * (1 - intensity) + invertedG * intensity;
            data[i + 2] = data[i + 2] * (1 - intensity) + invertedB * intensity;
        }

        this.canvasContext.putImageData(imageData, 0, 0);
    }
}
