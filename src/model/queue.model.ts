import { Schema } from 'ice-container';

export const QueueSchema: Schema = new Schema({
	path: String,
	thumbnail: String,
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
	thumbnail?: string;
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