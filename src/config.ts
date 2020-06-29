import { ConnectionConfig } from 'ice-container';
import { ServerConnectionConfig } from 'waterfall-gate';
import { FileStorageConfig } from 'rock-gather';

import { StorageConfig } from './util/storage.service';
import { ThumbnailsConfig } from './util/config/thumbnails-options.config';

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
	queueLimit: 2
};

export const CONFIG = {
	server: serverConfig,
	database: databaseConfig,
	fileStorage: fileConfig,
	storage: storageConfig,
	thumbnailConfig: thumbnailConfig
};