import { ConnectionConfig } from 'ice-container';
import { ServerConnectionConfig } from 'waterfall-gate';
import { FileStorageConfig } from 'rock-gather';
import { StorageConfig } from './util/storage.service';
import { ThumbnailsConfig } from './util/config/thumbnails-options.config';
import { RequestConfig } from './util/config/request-config';
import { ThreadConfig } from './util/config/thread.config';
export declare const CONFIG: {
    server: ServerConnectionConfig;
    database: ConnectionConfig;
    fileStorage: FileStorageConfig;
    storage: StorageConfig;
    thumbnailConfig: ThumbnailsConfig;
    request: RequestConfig;
    threadConfig: ThreadConfig;
};
