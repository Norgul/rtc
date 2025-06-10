import {GrayscaleFilter} from './filters/Grayscale';
import {SepiaFilter} from './filters/Sepia';
import {BlurFilter} from './filters/Blur';
import {InvertFilter} from './filters/Invert';

export type FilterType = 'grayscale' | 'sepia' | 'blur' | 'invert';

export class FilterManager {
    private canvasContext: CanvasRenderingContext2D;
    private width: number;
    private height: number;
    private filters: {
        grayscale: GrayscaleFilter | null;
        sepia: SepiaFilter | null;
        blur: BlurFilter | null;
        invert: InvertFilter | null;
    } = {
        grayscale: null,
        sepia: null,
        blur: null,
        invert: null
    };
    private intensitySliders!: {
        grayscale: HTMLInputElement;
        sepia: HTMLInputElement;
        blur: HTMLInputElement;
        invert: HTMLInputElement;
    };

    // Using temp canvas so we can make filters additive
    private tempCanvas: HTMLCanvasElement;
    private tempContext: CanvasRenderingContext2D;

    constructor(canvasContext: CanvasRenderingContext2D, width: number, height: number) {
        this.canvasContext = canvasContext;
        this.width = width;
        this.height = height;

        // Create temporary canvas for filter operations
        this.tempCanvas = document.createElement('canvas');
        this.tempCanvas.width = width;
        this.tempCanvas.height = height;
        this.tempContext = this.tempCanvas.getContext('2d')!;

        this.initializeFilters();
        this.initializeIntensitySliders();
    }

    private initializeFilters(): void {
        this.filters.grayscale = new GrayscaleFilter(this.tempContext, this.width, this.height);
        this.filters.sepia = new SepiaFilter(this.tempContext, this.width, this.height);
        this.filters.blur = new BlurFilter(this.tempContext, this.width, this.height);
        this.filters.invert = new InvertFilter(this.tempContext, this.width, this.height);
    }

    private initializeIntensitySliders(): void {
        this.intensitySliders = {
            grayscale: document.getElementById('grayscaleIntensity') as HTMLInputElement,
            sepia: document.getElementById('sepiaIntensity') as HTMLInputElement,
            blur: document.getElementById('blurIntensity') as HTMLInputElement,
            invert: document.getElementById('invertIntensity') as HTMLInputElement
        };
    }

    public applyFilters(): void {
        // Copy the current canvas state to the temp canvas
        this.tempContext.drawImage(this.canvasContext.canvas, 0, 0);

        // Apply each filter based on its intensity
        Object.entries(this.filters).forEach(([filterType, filter]) => {
            if (filter) {
                const intensity = parseInt(this.intensitySliders[filterType as FilterType].value) / 100;
                if (intensity > 0) {
                    filter.apply(intensity);
                }
            }
        });

        // Copy the final result back to the main canvas
        this.canvasContext.drawImage(this.tempCanvas, 0, 0);
    }

    public enableAllButtons(): void {
        Object.values(this.intensitySliders).forEach(slider => {
            slider.disabled = false;
        });
    }

    public disableAllButtons(): void {
        Object.values(this.intensitySliders).forEach(slider => {
            slider.disabled = true;
        });
    }

    public clearFilters(): void {
        Object.values(this.intensitySliders).forEach(slider => {
            slider.value = '0';
        });
    }

    public destroy(): void {
        this.clearFilters();
        this.disableAllButtons();
        this.filters = {
            grayscale: null,
            sepia: null,
            blur: null,
            invert: null
        };
    }
}
