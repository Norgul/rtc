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
    private blurRadiusSlider!: HTMLInputElement;

    constructor(canvasContext: CanvasRenderingContext2D, width: number, height: number) {
        this.canvasContext = canvasContext;
        this.width = width;
        this.height = height;

        this.initializeFilters();
        this.initializeIntensitySliders();
        this.enableAllButtons();
    }

    private initializeFilters(): void {
        this.filters.grayscale = new GrayscaleFilter(this.canvasContext, this.width, this.height);
        this.filters.sepia = new SepiaFilter(this.canvasContext, this.width, this.height);
        this.filters.blur = new BlurFilter(this.canvasContext, this.width, this.height);
        this.filters.invert = new InvertFilter(this.canvasContext, this.width, this.height);
    }

    private initializeIntensitySliders(): void {
        this.intensitySliders = {
            grayscale: document.getElementById('grayscaleIntensity') as HTMLInputElement,
            sepia: document.getElementById('sepiaIntensity') as HTMLInputElement,
            blur: document.getElementById('blurIntensity') as HTMLInputElement,
            invert: document.getElementById('invertIntensity') as HTMLInputElement
        };

        this.blurRadiusSlider = document.getElementById('blurRadius') as HTMLInputElement;
        this.blurRadiusSlider.addEventListener('input', () => {
            if (this.filters.blur) {
                const radius = parseInt(this.blurRadiusSlider.value);
                this.filters.blur.dispose();
                this.filters.blur = new BlurFilter(this.canvasContext, this.width, this.height, radius);
            }
        });
    }

    public applyFilters(): void {
        Object.entries(this.filters).forEach(([filterType, filter]) => {
            if (!filter) {
                return;
            }

            const intensity = parseInt(this.intensitySliders[filterType as FilterType].value) / 100;
            if (intensity > 0) {
                if (filterType === 'blur') {
                    (filter as BlurFilter).updateSource(this.canvasContext.canvas);
                    (filter as BlurFilter).apply(intensity);
                } else {
                    filter.apply(intensity);
                }
            }
        });
    }

    public enableAllButtons(): void {
        Object.values(this.intensitySliders).forEach(slider => {
            slider.disabled = false;
        });
    }

    public dispose(): void {
        Object.values(this.filters).forEach(filter => {
            if (filter && 'dispose' in filter) {
                (filter as any).dispose();
            }
        });

        this.filters = {
            grayscale: null,
            sepia: null,
            blur: null,
            invert: null
        };

        if (this.blurRadiusSlider) {
            this.blurRadiusSlider.removeEventListener('input', () => {});
        }
    }
}
