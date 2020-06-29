import * as fluent from 'fluent-ffmpeg'

import { Queue } from '../model/queue.model';

import { ThumbnailOptions } from './config/thumbnail-options.config';
import { PreviewOptions } from './config/preview-options.config';
import { FileDetails } from './config/file-details.config';
import { PreviewSizes } from './config/preview-sizes.config';
import { ConvertPreviewResponse } from './config/preview-convert-options.config';
import { ConvertVideoResponse } from './config/convert-video-options.config';

import { CONFIG } from '../config';

const temDir = CONFIG.fileStorage.destination;

export class ConvertService {
	private static instance: ConvertService = new ConvertService();

	private constructor() {}

	public createPreviewAndThumbnails(queue: Queue,
		outputPath: string,
		thumbnailOptions: ThumbnailOptions,
		previewOptions: PreviewOptions): Promise<any[]> {
		return this.getFileDetails(queue.path)
			.then((details: any) => {
				const { maxHeight, maxWidth } = thumbnailOptions;
				const { aspect } = details;
				const size = maxWidth < maxHeight ? `${maxWidth}x?` : `?x${maxHeight}`

				previewOptions.aspect = aspect;
				thumbnailOptions.aspect = aspect;
				thumbnailOptions.size = size;
				previewOptions.size = size;
				return Promise.all([
					this.convertFile(queue, outputPath, thumbnailOptions),
					this.convertPreview(queue, outputPath, previewOptions, details)
				])
					.then((data) => {
						return data;
					})
					.catch((err => {
						console.log(err);
						return err;
					}));
			})
			.catch((e) => e);
	}

	private getFileDetails(path: string): Promise<FileDetails> {
		return new Promise<FileDetails>((resolve, reject) => {
			return fluent.ffprobe(path, (err, videoDetails) => {
				if (err) { return reject(err) }

				const { duration, size, format_name } = videoDetails.format;
				const aspect = videoDetails.streams[0].display_aspect_ratio;
				const format = format_name.split(',').shift();

				return resolve({
					size,
					duration: Math.floor(duration),
					aspect,
					format
				});
			});
		});
	}

	private getPreviewDetails(details: PreviewOptions, videoDetails): PreviewSizes {
		const { startPreview, endPreview } = details;
		const { duration: completeDuration } = videoDetails;

		let start = startPreview && startPreview > 0 ? startPreview : 0;
		let end = 0;

		end = endPreview && endPreview > 0 ? endPreview : start + 5;
		const d = completeDuration - 1 > 0 ? completeDuration - 1 : 0;
		end = end > d ? d : end;

		if (startPreview !== null && startPreview !== undefined && startPreview !== NaN) {
			start = start;
		} else {
			start = end && end > 5 ? end - 5 : 0;
		}

		return { start, end };
	}

	private convertPreview(queue: Queue, outputPath, details: PreviewOptions, videoDetails): Promise<string | ConvertPreviewResponse> {
		const inputPath = queue.path;
		const { start, end } = this.getPreviewDetails(details, videoDetails);

		return new Promise((resolve, reject) => {
			fluent()
				.input(inputPath)
				.toFormat('mp4')
				.noAudio()
				.size(details.size)
				.aspect(details.aspect)
				.inputOptions([`-ss ${start}`])
				.outputOptions([`-t ${end}`])
				.output(`${temDir}preview_${outputPath}`, { end: true })
				.on('error', (err) => {
					console.log('error on preview video conversion', err);
					resolve('REQUEST_ERRORS.ERROR_CONVERTING_PREVIEW');
				})
				.on('end', () => {
					resolve({ preview: `${temDir}preview_${outputPath}` });
				})
				.run();
		});
	}

	private convertFile(queue: Queue, outputPath: string, thumbnailOptions: ThumbnailOptions): Promise<ConvertVideoResponse | string> {
		const path = queue.path;
		let thumbnails = [];
		return new Promise<ConvertVideoResponse | string>((resolve, reject) => {
			fluent(path)
				.input(path)
				.toFormat('mp4')
				.output(`${temDir}${outputPath}`, { end: true })
				.on('error', (err) => {
					console.log('error on video conversion', err);
					resolve('REQUEST_ERRORS.ERROR_CONVERTING_FILE');
				})
				.on('progress', (progress) => {
					queue.progress = Math.floor(progress.percent);
					console.log(queue.progress);
				})
				.on('end', () => {
					console.log('process finished on stream');
					resolve({ filepath: `${temDir}${outputPath}`, screenshots: thumbnails });
				})
				.on('filenames', (data) => {
					thumbnails = data.map((path) => `${temDir}${path}`);
				})
				.screenshots(thumbnailOptions);
		});
	}

	public static getInstance(): ConvertService {
		return this.instance;
	}
}