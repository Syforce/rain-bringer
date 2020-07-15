const Cloudinary = require('cloudinary').v2;

export class StorageService {
	private static instance: StorageService = new StorageService();

	private constructor() {}

	public init(config: StorageConfig) {
		Cloudinary.config({
			cloud_name: config.name,
			api_key: config.apiKey,
			api_secret: config.apiSecret
		});
	}

	public upload(path: string): Promise<string> {
		return new Promise((resolve, fail) => {
			Cloudinary.uploader.upload(path, (error, result) => {
				if (error) {
					console.log('Cloudinary error:', error);
				} else {
					resolve(result.url);
				}
			});
		});
	}

	public uploadLarge(path: string): Promise<string> {
        console.log(path);
		return new Promise((resolve, fail) => {
			Cloudinary.uploader.upload_large(path, {
				resource_type: 'video'
			}, (error, result) => {
				if (error) {
					console.log('Cloudinary error:', error);
				} else {
					resolve(result.url);
				}
			});
		});
	}

	public static getInstance(): StorageService {
		return this.instance;
	}
}

export interface StorageConfig {
	name: string;
	apiKey: string;
	apiSecret: string;
}