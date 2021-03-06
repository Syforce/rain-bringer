import { ConnectionConfig } from 'ice-container';
import { ServerConnectionConfig } from 'waterfall-gate';
import { FileStorageConfig } from 'rock-gather';

import { StorageConfig } from './util/storage.service';
import { ThumbnailsConfig } from './util/config/thumbnails-options.config';
import { RequestConfig } from './util/config/request-config';
import { ThreadConfig } from './util/config/thread.config';

const databaseConfig: ConnectionConfig = {
	host: process.env.MONGO_HQ || 'mongodb://localhost/bringer'
};

const serverConfig: ServerConnectionConfig = {
	port: +process.env.PORT || 8002
};

const fileConfig: FileStorageConfig = {
	destination: './uploads/',
	randomNames: true
};

const storageConfig: StorageConfig = {
	name: 'syforce',
	apiKey: '733675221936768',
	apiSecret: 'Efa6K4_TiioWE20EBQ2Gpzm3U-U'
};

const thumbnailConfig: ThumbnailsConfig = {
	maxWidth: 300,
	maxHeight: 300,
	count: 30,
	queueLimit: 2,
	start: 2,
	end: 5,
};

const requestConfig: RequestConfig = {
	hostname: 'localhost',
	port: 8111,
}

const threadConfig: ThreadConfig = {
	threads: 2,
}

export const CONFIG = {
	server: serverConfig,
	database: databaseConfig,
	fileStorage: fileConfig,
	storage: storageConfig,
	thumbnailConfig: thumbnailConfig,
	request: requestConfig,
	threadConfig: threadConfig
};