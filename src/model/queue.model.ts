import { Schema } from 'ice-container';

export const QueueSchema: Schema = new Schema({
	path: String,
	selectedThumbnail: String,
	original: String,
	preview: String,
	talent: String,
	thumbnails: [String],
	title: String,
	progress: {
		type: Number,
		default: -1
	}
}, {
	timestamps: true
});

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