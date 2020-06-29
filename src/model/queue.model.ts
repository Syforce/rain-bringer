import { Schema } from 'ice-container';

export const QueueSchema: Schema = new Schema({
	path: String,
	thumbnail: String,
	talent: String,
	title: String,
	progress: {
		type: Number,
		default: -1
	}
});

export interface Queue {
	path: string;
	thumbnail?: string;
	progress?: number;
	talent: string;
	title: string;
}