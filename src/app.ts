import { WaterfallGateService } from 'waterfall-gate';
import { IceContainerService } from 'ice-container';
import { RockGatherService } from 'rock-gather';

import { StorageService } from './util/storage.service';

import { QueueDatastore } from './datastore/queue.datastore';

import { QueueRouter } from './router/queue.router';

import { CONFIG } from './config';

class App {
	public app;

	private waterfallGateService: WaterfallGateService;
	private iceContainerService: IceContainerService;
	private rockGatherService: RockGatherService;
	private storageService: StorageService;

	constructor() {
        this.init();
	}

	private init() {
		this.waterfallGateService = WaterfallGateService.getInstance();
		this.iceContainerService = IceContainerService.getInstance();
		this.rockGatherService = RockGatherService.getInstance();
		this.storageService = StorageService.getInstance();

		this.startDatabase();
		this.startStorage();
		this.startServer();
	}

	private startDatabase() {
		this.iceContainerService.registerDatastore(QueueDatastore);
		// this.iceContainerService.registerDatastore(QueueDatastore);

		this.iceContainerService.init(CONFIG.database);
    }

	private startStorage() {
		this.rockGatherService.init(CONFIG.fileStorage);
		this.storageService.init(CONFIG.storage);
	}

	private startServer() {
		this.waterfallGateService.registerRouter(QueueRouter);

		this.waterfallGateService.init(CONFIG.server);
    }
}

export default new App().app;