import * as fluent from 'fluent-ffmpeg';
import { request } from 'http';
import { unlink } from 'fs';

import { Schema } from 'ice-container';

import { StorageService } from './storage.service';
import { ConvertService } from './convert.service';

import { QueueManager } from '../manager/queue.manager';

import { Queue } from '../model/queue.model';
import { ThumbnailOptions } from './config/thumbnail-options.config';
import { PreviewOptions } from './config/preview-options.config';

import { CONFIG } from '../config';
import { ResponseData } from './model/response-data.model';

const temDir = CONFIG.fileStorage.destination;

export class QueueService {
	private static instance: QueueService = new QueueService();
	private queueManager: QueueManager;
	private storageService: StorageService;
	private convertService: ConvertService;

	private jobs: Array<Queue> = new Array<Queue>();

	private constructor() {
		this.storageService = StorageService.getInstance();
		this.convertService = ConvertService.getInstance();

		// TODO: REMOVE DIRTY FIX, replace with iceContainer.getDatastoreV2
		setTimeout(() => {

			this.queueManager = new QueueManager();
		})
	}

	public static getInstance(): QueueService {
		return this.instance;
	}

	public nextTick() {
		this.getNextJob();
	}

	public applyProgressToJobs(data: ResponseData) {
		data.list.forEach(item => {
			this.jobs.forEach(job => {
				if ((item._id as Schema.ObjectId).equals(job._id)) {
					item.progress = Math.floor(job.fileProgress * 0.6 + job.previewProgress * 0.2 + job.uploadProgress * 0.2);
				}
			});
		});

		return data;
	}

	private async getNextJob() {
		try {
			if (this.jobs.length < CONFIG.threadConfig.threads) {
				const queue: Queue = await this.queueManager.getQueueByProgress();

				if (queue) {
					queue.fileProgress = 0;
					queue.previewProgress = 0;
					queue.uploadProgress = 0;

					this.processQueue(queue);
				}
			}
		} catch (e) {
			console.log(e);
		}
	}

	private processQueue(queue: Queue) {
		this.jobs.push(queue);
		this.nextTick();
		this.convertQueue(queue);
	}

	private async convertQueue(queue: Queue) {
		try {
			const { outStream, thumbnailOptions, previewOptions } = this.getFileDetails(queue);
			return new Promise<Queue>((resolve, reject) => {
				this.convertService.createPreviewAndThumbnails(queue, outStream, thumbnailOptions, previewOptions)
					.then(async (convertedFile) => {
						console.log(convertedFile);
						// convertedFile[0].filepath - video
						// convertedFile[0].screenshots - thumbnails
						// convertedFile[1].preview - preview

						const original: string = queue.path;
						const video: string = convertedFile[0].filepath;
						const thumbnails: Array<string> = convertedFile[0].screenshots;
						const preview: string = convertedFile[1].preview;
						const selectedThumbnail: string = queue.selectedThumbnail;
						const thumbnailsPromises: Array<Promise<string>> = new Array<Promise<string>>();

						for (let i = 0; i< thumbnails.length; i++) {
							thumbnailsPromises.push(this.storageService.upload(thumbnails[i]));
						}

						const promiseSelectedThumbnail = this.storageService.upload(selectedThumbnail);
						const promiseOriginal = this.storageService.uploadLarge(original);
						const promiseVideo = this.storageService.uploadLarge(video);
						const promisePreview = this.storageService.uploadLarge(preview);
						const values = await Promise.all([promiseOriginal, promiseVideo, promisePreview, Promise.all(thumbnailsPromises), promiseSelectedThumbnail]);
						const originalPath: string =values[0];
						const videoPath: string = values[1];
						const previewPath: string = values[2];
						const thumbnailsPath: Array<string> = values[3];
						const selectedThumbnailPath: string = values[4];

						queue.uploadProgress = 100;

						this.createVideo(queue, videoPath, previewPath, thumbnailsPath, originalPath, selectedThumbnailPath);

						this.removeFiles([original, video, preview, thumbnails, selectedThumbnail]);

						this.updateQueue(queue, originalPath, videoPath, previewPath, thumbnailsPath, selectedThumbnailPath);

						this.jobs.splice(this.jobs.indexOf(queue), 1);
						this.nextTick();
					}).catch((e) => {
						console.log(e);
						reject(e);
					});
			});
		} catch(e) {
			throw(e);
		}	
	}

	private updateQueue(queue: Queue, originalPath: string, videoPath: string, previewPath: string, thumbnailsPath: Array<string>, selectedThumbnailPath: string) {
		const update = {
			progress: 100,
			path: videoPath,
			original: originalPath,
			preview: previewPath,
			thumbnails: thumbnailsPath,
			selectedThumbnail: selectedThumbnailPath
		}

		this.queueManager.updateQueue(queue, update);
	}

	private removeFiles(files: Array<string | Array<string>>) {
		files.forEach(file => {
			if (Array.isArray(file)) {
				file.forEach(elem => {
					unlink(elem, err => {
						if (err) {
							console.log(err);
						}
					});
				})
			} else {
				unlink(file, err => {
					if (err) {
						console.log(err);
					}
				});
			}
		});
	}

	private getFileDetails(queue: Queue) {
		const fileName = queue.path.split('\\').pop().split('.').shift();
		const outStream = `stream_${fileName}.mp4`;
		const thumbnailOptions: ThumbnailOptions = {
			folder: temDir,
			filename: `thumbnail-${fileName}-at-%i.png`,
			maxWidth: CONFIG.thumbnailConfig.maxWidth,
			maxHeight: CONFIG.thumbnailConfig.maxHeight,
			count: CONFIG.thumbnailConfig.count
		}
		const previewOptions: PreviewOptions = {
			startPreview: CONFIG.thumbnailConfig.start,
			maxWidth: CONFIG.thumbnailConfig.maxWidth,
			maxHeight: CONFIG.thumbnailConfig.maxHeight,
			endPreview: CONFIG.thumbnailConfig.end,
		}

		return {
			fileName,
			outStream,
			thumbnailOptions,
			previewOptions
		}
	}


	private createVideo(queue: Queue, path: string, preview: string, thumbnails: Array<string>, original: string , thumbnail: string) {

		const data = JSON.stringify({
			path: path,
			selectedThumbnail: thumbnail,
			thumbnails: thumbnails,
			preview: preview,
			original: original,
			talent: queue.talent,
			title: queue.title
		});

		const req = request({
			hostname: CONFIG.request.hostname,
			port: CONFIG.request.port,
			path: '/api/video',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Content-Length': data.length
			}
		});

		req.write(data);
		req.end();
	}
}