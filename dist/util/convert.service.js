"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fluent = require("fluent-ffmpeg");
const config_1 = require("../config");
const temDir = config_1.CONFIG.fileStorage.destination;
class ConvertService {
    constructor() { }
    createPreviewAndThumbnails(queue, outputPath, thumbnailOptions, previewOptions) {
        return this.getFileDetails(queue.path)
            .then((details) => {
            const { maxHeight, maxWidth } = thumbnailOptions;
            const { aspect } = details;
            const size = maxWidth < maxHeight ? `${maxWidth}x?` : `?x${maxHeight}`;
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
    getFileDetails(path) {
        return new Promise((resolve, reject) => {
            return fluent.ffprobe(path, (err, videoDetails) => {
                if (err) {
                    return reject(err);
                }
                const { duration, size, format_name } = videoDetails.format;
                let stream;
                for (let i = 0; i < videoDetails.streams.length; i++) {
                    if (videoDetails.streams[i].codec_type === 'video') {
                        stream = videoDetails.streams[i];
                        break;
                    }
                }
                let aspect = stream.display_aspect_ratio;
                if (aspect === 'N/A' || !aspect) {
                    const ratio = this.gcd(stream.width, stream.height);
                    aspect = `${stream.width / ratio}:${stream.height / ratio}`;
                }
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
    gcd(width, height) {
        return (height == 0) ? width : this.gcd(height, width % height);
    }
    getPreviewDetails(details, videoDetails) {
        const { startPreview, endPreview } = details;
        const { duration: completeDuration } = videoDetails;
        let start = startPreview && startPreview > 0 ? startPreview : 0;
        let end = endPreview && endPreview > 0 ? endPreview : start + 5;
        end = end > completeDuration ? completeDuration : end;
        start = start < end ? start : 0;
        return { start, end };
    }
    convertPreview(queue, outputPath, details, videoDetails) {
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
                .on('progress', (progress) => {
                queue.previewProgress = Math.floor(progress.percent);
            })
                .on('end', () => {
                queue.previewProgress = 100;
                resolve({ preview: `${temDir}preview_${outputPath}` });
            })
                .run();
        });
    }
    convertFile(queue, outputPath, thumbnailOptions) {
        const path = queue.path;
        let thumbnails = [];
        return new Promise((resolve, reject) => {
            fluent(path)
                .input(path)
                .toFormat('mp4')
                .output(`${temDir}${outputPath}`, { end: true })
                .on('error', (err) => {
                console.log('error on video conversion', err);
                resolve('REQUEST_ERRORS.ERROR_CONVERTING_FILE');
            })
                .on('progress', (progress) => {
                queue.fileProgress = Math.floor(progress.percent);
            })
                .on('end', () => {
                queue.fileProgress = 100;
                console.log('process finished on stream');
                resolve({ filepath: `${temDir}${outputPath}`, screenshots: thumbnails });
            })
                .on('filenames', (data) => {
                thumbnails = data.map((path) => `${temDir}${path}`);
            })
                .screenshots(thumbnailOptions);
        });
    }
    static getInstance() {
        return this.instance;
    }
}
exports.ConvertService = ConvertService;
ConvertService.instance = new ConvertService();
