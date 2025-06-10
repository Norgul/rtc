export class BlurFilter {
    private canvasContext: CanvasRenderingContext2D;
    private width: number;
    private height: number;
    private maxRadius: number;

    constructor(canvasContext: CanvasRenderingContext2D, width: number, height: number, maxRadius: number = 3) {
        this.canvasContext = canvasContext;
        this.width = width;
        this.height = height;
        this.maxRadius = maxRadius;
    }

    public apply(intensity: number = 1): void {
        const imageData = this.canvasContext.getImageData(0, 0, this.width, this.height);
        const data = imageData.data;
        const tempData = new Uint8ClampedArray(data);
        const radius = Math.floor(this.maxRadius * intensity);

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let r = 0, g = 0, b = 0, a = 0;
                let count = 0;

                for (let ky = -radius; ky <= radius; ky++) {
                    for (let kx = -radius; kx <= radius; kx++) {
                        const posX = x + kx;
                        const posY = y + ky;

                        if (posX >= 0 && posX < this.width && posY >= 0 && posY < this.height) {
                            const i = (posY * this.width + posX) * 4;
                            r += tempData[i];
                            g += tempData[i + 1];
                            b += tempData[i + 2];
                            a += tempData[i + 3];
                            count++;
                        }
                    }
                }

                const i = (y * this.width + x) * 4;
                data[i] = r / count;
                data[i + 1] = g / count;
                data[i + 2] = b / count;
                data[i + 3] = a / count;
            }
        }

        this.canvasContext.putImageData(imageData, 0, 0);
    }
} 