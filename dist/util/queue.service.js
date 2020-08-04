"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const fs_1 = require("fs");
const storage_service_1 = require("./storage.service");
const convert_service_1 = require("./convert.service");
const queue_manager_1 = require("../manager/queue.manager");
const config_1 = require("../config");
const temDir = config_1.CONFIG.fileStorage.destination;
class QueueService {
    constructor() {
        this.jobs = new Array();
        this.storageService = storage_service_1.StorageService.getInstance();
        this.convertService = convert_service_1.ConvertService.getInstance();
        // TODO: REMOVE DIRTY FIX, replace with iceContainer.getDatastoreV2
        setTimeout(() => {
            this.queueManager = new queue_manager_1.QueueManager();
        });
    }
    static getInstance() {
        return this.instance;
    }
    nextTick() {
        this.getNextJob();
    }
    applyProgressToJobs(data) {
        data.list.forEach(item => {
            this.jobs.forEach(job => {
                if (item._id.equals(job._id)) {
                    item.progress = Math.floor(job.fileProgress * 0.6 + job.previewProgress * 0.2 + job.uploadProgress * 0.2);
                }
            });
        });
        return data;
    }
    async getNextJob() {
        try {
            if (this.jobs.length < config_1.CONFIG.threadConfig.threads) {
                const queue = await this.queueManager.getQueueByProgress();
                if (queue) {
                    queue.fileProgress = 0;
                    queue.previewProgress = 0;
                    queue.uploadProgress = 0;
                    this.processQueue(queue);
                }
            }
        }
        catch (e) {
            console.log(e);
        }
    }
    processQueue(queue) {
        this.jobs.push(queue);
        this.nextTick();
        this.convertQueue(queue);
    }
    async convertQueue(queue) {
        try {
            const { outStream, thumbnailOptions, previewOptions } = this.getFileDetails(queue);
            return new Promise((resolve, reject) => {
                this.convertService.createPreviewAndThumbnails(queue, outStream, thumbnailOptions, previewOptions)
                    .then(async (convertedFile) => {
                    console.log(convertedFile);
                    // convertedFile[0].filepath - video
                    // convertedFile[0].screenshots - thumbnails
                    // convertedFile[1].preview - preview
                    const original = queue.path;
                    const video = convertedFile[0].filepath;
                    const thumbnails = convertedFile[0].screenshots;
                    const preview = convertedFile[1].preview;
                    const selectedThumbnail = queue.selectedThumbnail;
                    const thumbnailsPromises = new Array();
                    for (let i = 0; i < thumbnails.length; i++) {
                        thumbnailsPromises.push(this.storageService.upload(thumbnails[i]));
                    }
                    const promiseSelectedThumbnail = this.storageService.upload(selectedThumbnail);
                    const promiseOriginal = this.storageService.uploadLarge(original);
                    const promiseVideo = this.storageService.uploadLarge(video);
                    const promisePreview = this.storageService.uploadLarge(preview);
                    const values = await Promise.all([promiseOriginal, promiseVideo, promisePreview, Promise.all(thumbnailsPromises), promiseSelectedThumbnail]);
                    const originalPath = values[0];
                    const videoPath = values[1];
                    const previewPath = values[2];
                    const thumbnailsPath = values[3];
                    const selectedThumbnailPath = values[4];
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
        }
        catch (e) {
            throw (e);
        }
    }
    updateQueue(queue, originalPath, videoPath, previewPath, thumbnailsPath, selectedThumbnailPath) {
        const update = {
            progress: 100,
            path: videoPath,
            original: originalPath,
            preview: previewPath,
            thumbnails: thumbnailsPath,
            selectedThumbnail: selectedThumbnailPath
        };
        this.queueManager.updateQueue(queue, update);
    }
    removeFiles(files) {
        files.forEach(file => {
            if (Array.isArray(file)) {
                file.forEach(elem => {
                    fs_1.unlink(elem, err => {
                        if (err) {
                            console.log(err);
                        }
                    });
                });
            }
            else {
                fs_1.unlink(file, err => {
                    if (err) {
                        console.log(err);
                    }
                });
            }
        });
    }
    getFileDetails(queue) {
        const fileName = queue.path.split('\\').pop().split('.').shift();
        const outStream = `stream_${fileName}.mp4`;
        const thumbnailOptions = {
            folder: temDir,
            filename: `thumbnail-${fileName}-at-%i.png`,
            maxWidth: config_1.CONFIG.thumbnailConfig.maxWidth,
            maxHeight: config_1.CONFIG.thumbnailConfig.maxHeight,
            count: config_1.CONFIG.thumbnailConfig.count
        };
        const previewOptions = {
            startPreview: config_1.CONFIG.thumbnailConfig.start,
            maxWidth: config_1.CONFIG.thumbnailConfig.maxWidth,
            maxHeight: config_1.CONFIG.thumbnailConfig.maxHeight,
            endPreview: config_1.CONFIG.thumbnailConfig.end,
        };
        return {
            fileName,
            outStream,
            thumbnailOptions,
            previewOptions
        };
    }
    createVideo(queue, path, preview, thumbnails, original, thumbnail) {
        const data = JSON.stringify({
            path: path,
            selectedThumbnail: thumbnail,
            thumbnails: thumbnails,
            preview: preview,
            original: original,
            talent: queue.talent,
            title: queue.title
        });
        const req = http_1.request({
            hostname: config_1.CONFIG.request.hostname,
            port: config_1.CONFIG.request.port,
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
exports.QueueService = QueueService;
QueueService.instance = new QueueService();
