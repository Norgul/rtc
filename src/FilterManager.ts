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
    private buttons!: {
        grayscale: HTMLButtonElement;
        sepia: HTMLButtonElement;
        blur: HTMLButtonElement;
        invert: HTMLButtonElement;
    };

    constructor(canvasContext: CanvasRenderingContext2D, width: number, height: number) {
        this.canvasContext = canvasContext;
        this.width = width;
        this.height = height;
        this.initializeFilters();
        this.initializeButtons();
        this.initializeEventListeners();
    }

    private initializeFilters(): void {
        this.filters.grayscale = new GrayscaleFilter(this.canvasContext, this.width, this.height);
        this.filters.sepia = new SepiaFilter(this.canvasContext, this.width, this.height);
        this.filters.blur = new BlurFilter(this.canvasContext, this.width, this.height);
        this.filters.invert = new InvertFilter(this.canvasContext, this.width, this.height);
    }

    private initializeButtons(): void {
        this.buttons = {
            grayscale: document.getElementById('grayscaleButton') as HTMLButtonElement,
            sepia: document.getElementById('sepiaButton') as HTMLButtonElement,
            blur: document.getElementById('blurButton') as HTMLButtonElement,
            invert: document.getElementById('invertButton') as HTMLButtonElement
        };
    }

    private initializeEventListeners(): void {
        Object.keys(this.buttons).forEach(filterType => {
            this.buttons[filterType as FilterType].addEventListener('click', () => {
                this.handleFilterToggle(filterType as FilterType);
            });
        });
    }

    private handleFilterToggle(filterType: FilterType): void {
        const isActive = this.toggleFilter(filterType);
        this.buttons[filterType].textContent = isActive ? `Disable ${filterType}` : `Enable ${filterType}`;
    }

    public toggleFilter(filterType: FilterType): boolean {
        if (this.activeFilters.has(filterType)) {
            this.activeFilters.delete(filterType);
            return false;
        } else {
            this.activeFilters.add(filterType);
            return true;
        }
    }

    public isFilterActive(filterType: FilterType): boolean {
        return this.activeFilters.has(filterType);
    }

    public applyFilters(): void {
        this.activeFilters.forEach(filterType => {
            const filter = this.filters[filterType];
            if (filter) {
                filter.apply();
            }
        });
    }

    public enableAllButtons(): void {
        Object.values(this.buttons).forEach(button => {
            button.disabled = false;
        });
    }

    public disableAllButtons(): void {
        Object.values(this.buttons).forEach(button => {
            button.disabled = true;
        });
    }

    public clearFilters(): void {
        this.activeFilters.clear();
        Object.entries(this.buttons).forEach(([filterType, button]) => {
            button.textContent = `Enable ${filterType}`;
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
