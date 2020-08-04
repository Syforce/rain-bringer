"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Cloudinary = require('cloudinary').v2;
class StorageService {
    constructor() { }
    init(config) {
        Cloudinary.config({
            cloud_name: config.name,
            api_key: config.apiKey,
            api_secret: config.apiSecret
        });
    }
    upload(path) {
        return new Promise((resolve, fail) => {
            Cloudinary.uploader.upload(path, (error, result) => {
                if (error) {
                    console.log('Cloudinary error:', error);
                }
                else {
                    resolve(result.url);
                }
            });
        });
    }
    uploadLarge(path) {
        console.log(path);
        return new Promise((resolve, fail) => {
            Cloudinary.uploader.upload_large(path, {
                resource_type: 'video'
            }, (error, result) => {
                if (error) {
                    console.log('Cloudinary error:', error);
                }
                else {
                    resolve(result.url);
                }
            });
        });
    }
    static getInstance() {
        return this.instance;
    }
}
exports.StorageService = StorageService;
StorageService.instance = new StorageService();
