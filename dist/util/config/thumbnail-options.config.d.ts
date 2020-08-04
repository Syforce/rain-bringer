export interface ThumbnailOptions {
    folder: string;
    filename: string;
    count?: number;
    size?: string;
    maxWidth?: number;
    maxHeight?: number;
    aspect?: string;
    timemarks?: (string | number)[];
}
