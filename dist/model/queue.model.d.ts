import { Schema } from 'ice-container';
export declare const QueueSchema: Schema;
export interface Queue {
    _id?: string;
    path: string;
    selectedThumbnail?: string;
    original?: string;
    preview?: string;
    thumbnails?: [string];
    progress?: number;
    fileProgress?: number;
    previewProgress?: number;
    uploadProgress?: number;
    talent: string;
    title: string;
}
