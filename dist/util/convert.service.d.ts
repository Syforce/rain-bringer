import { Queue } from '../model/queue.model';
import { ThumbnailOptions } from './config/thumbnail-options.config';
import { PreviewOptions } from './config/preview-options.config';
export declare class ConvertService {
    private static instance;
    private constructor();
    createPreviewAndThumbnails(queue: Queue, outputPath: string, thumbnailOptions: ThumbnailOptions, previewOptions: PreviewOptions): Promise<any[]>;
    private getFileDetails;
    private gcd;
    private getPreviewDetails;
    private convertPreview;
    private convertFile;
    static getInstance(): ConvertService;
}
