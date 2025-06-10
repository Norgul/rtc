import {GrayscaleFilter} from './filters/Grayscale';
import {SepiaFilter} from './filters/Sepia';
import {BlurFilter} from './filters/Blur';
import {InvertFilter} from './filters/Invert';

export type FilterType = 'grayscale' | 'sepia' | 'blur' | 'invert';

export class FilterManager {
    private canvasContext: CanvasRenderingContext2D;
    private width: number;
    private height: number;
    private activeFilters: Set<FilterType> = new Set();
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
    private checkboxes!: {
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
        this.initializeCheckboxes();
        this.initializeEventListeners();
    }

    private initializeFilters(): void {
        this.filters.grayscale = new GrayscaleFilter(this.tempContext, this.width, this.height);
        this.filters.sepia = new SepiaFilter(this.tempContext, this.width, this.height);
        this.filters.blur = new BlurFilter(this.tempContext, this.width, this.height);
        this.filters.invert = new InvertFilter(this.tempContext, this.width, this.height);
    }

    private initializeCheckboxes(): void {
        this.checkboxes = {
            grayscale: document.getElementById('grayscaleButton') as HTMLInputElement,
            sepia: document.getElementById('sepiaButton') as HTMLInputElement,
            blur: document.getElementById('blurButton') as HTMLInputElement,
            invert: document.getElementById('invertButton') as HTMLInputElement
        };
    }

    private initializeEventListeners(): void {
        Object.keys(this.checkboxes).forEach(filterType => {
            const checkbox = this.checkboxes[filterType as FilterType];
            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    this.activeFilters.add(filterType as FilterType);
                } else {
                    this.activeFilters.delete(filterType as FilterType);
                }
            });
        });
    }

    public applyFilters(): void {
        if (this.activeFilters.size === 0) {
            return;
        }

        this.tempContext.drawImage(this.canvasContext.canvas, 0, 0);

        this.activeFilters.forEach(filterType => {
            const filter = this.filters[filterType];
            if (filter) {
                filter.apply();
            }
        });

        this.canvasContext.drawImage(this.tempCanvas, 0, 0);
    }

    public enableAllButtons(): void {
        Object.values(this.checkboxes).forEach(checkbox => {
            checkbox.disabled = false;
        });
    }

    public disableAllButtons(): void {
        Object.values(this.checkboxes).forEach(checkbox => {
            checkbox.disabled = true;
        });
    }

    public clearFilters(): void {
        this.activeFilters.clear();
        Object.values(this.checkboxes).forEach(checkbox => {
            checkbox.checked = false;
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
