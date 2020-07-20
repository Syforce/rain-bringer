import * as fluent from 'fluent-ffmpeg';
import { request } from 'http';
import { join } from 'path';
import { readdir, unlink } from 'fs';

import { StorageService } from './storage.service';
import { ConvertService } from './convert.service';

import { QueueManager } from '../manager/queue.manager';

import { Queue } from '../model/queue.model';
import { ThumbnailOptions } from './config/thumbnail-options.config';
import { PreviewOptions } from './config/preview-options.config';

import { CONFIG } from '../config';

const temDir = CONFIG.fileStorage.destination;

export class QueueService {
	private static instance: QueueService = new QueueService();
	private queueManager: QueueManager = new QueueManager();
	private storageService: StorageService;
	private convertService: ConvertService;

	private jobs: Array<Queue> = new Array<Queue>();

	private constructor() {
		this.storageService = StorageService.getInstance();
		this.convertService = ConvertService.getInstance();
	}

	public static getInstance(): QueueService {
		return this.instance;
	}

	public nextTick() {
		this.getNextJob();
	}

	private async getNextJob() {
		try {
			if (this.jobs.length < CONFIG.threadConfig.nrOfItems) {
				const queue: Queue = await this.queueManager.getQueueByProgress();

				if (queue) {
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

						const originalPath: string = await this.storageService.uploadLarge(original);
						const videoPath: string = await this.storageService.uploadLarge(video);
						const previewPath: string = await this.storageService.uploadLarge(preview);
						const thumbnailsPath: Array<string> = new Array<string>();

						for (let i = 0; i < thumbnails.length; i++) {
							thumbnailsPath.push(await this.storageService.upload(thumbnails[i]));
						}

						await this.createVideo(queue, videoPath, previewPath, thumbnailsPath, originalPath, '');

						this.removeFiles(original, video, preview, thumbnails);

						this.updateQueue(queue, originalPath, videoPath, previewPath, thumbnailsPath);

						this.jobs.splice(this.jobs.indexOf(queue), 1);
						this.nextTick();

						// const video: Video = VideoParser.parserConvertedVideo(convertedFile, previewOptions, queue);
						// if (!video.url) {
						// 	// this.deleteTempFiles([queue.fileName]);
						// 	reject('REQUEST_ERRORS.ERROR_CONVERTING_FILE');
						// }
						// this.saveVideoDetailFiles(video)
						// 	.then((uploadedVideoData) => {
						// 		const uploadedVideo = VideoParser.parseUploadedVideoDetails(uploadedVideoData, video);
						// 		this.videoManager.createVideo(uploadedVideo)
						// 			.then(() => {
						// 				const files = uploadedVideoData.map((el) => el.val);
						// 				files.push(queue.fileName);
						// 				this.deleteTempFiles(files);
						// 				resolve(queue)
						// 			}).catch((err) => {
						// 				reject(err);
						// 			});
						// 	}).catch((e) => reject(e));
					}).catch((e) => {
						console.log(e);
						reject(e);
					});
			});
		} catch(e) {
			throw(e);
		}
		


		// const videoPath: string = await this.storageService.uploadLarge(queue.path)
		// const thumbnailPath: string = await this.storageService.upload(queue.thumbnail);

		
	}

	private updateQueue(queue, originalPath, videoPath, previewPath, thumbnailsPath) {
		const options = {
			_id: queue._id
		}
		const update = {
			progress: 100,
			path: videoPath,
			original: originalPath,
			preview: previewPath,
			thumbnails: thumbnailsPath
		}

		this.queueManager.updateQueue(options, update);
	}

	private removeFiles(original, video, preview, thumbnails) {
		unlink(video, err => {
			if (err) {
				console.log(err);
			}
		});
		unlink(preview, err => {
			if (err) {
				console.log(err);
			}
		});
		unlink(original, err => {
			if (err) {
				console.log(err);
			}
		});
		thumbnails.forEach(thumbnail => {
			unlink(thumbnail, err => {
				if (err) {
					console.log(err);
				}
			})
		});
	}

	private getFileDetails(queue) {
		// console.log(queue);
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
			// thumbnail: thumbnail,
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