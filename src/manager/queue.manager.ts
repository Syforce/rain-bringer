import { IceContainerService } from 'ice-container';

import { QueueDatastore } from '../datastore/queue.datastore';

import { Queue } from '../model/queue.model';

export class QueueManager {
	private iceContainerService: IceContainerService;
	private queueDatastore: QueueDatastore;

	constructor() {
		this.iceContainerService = IceContainerService.getInstance();

		this.iceContainerService.getDatastoreV2(QueueDatastore.name).then((datastore) => {
			this.queueDatastore = datastore;
		});
	}

	public getAll(): Promise<Array<Queue>> {
		return this.queueDatastore.getAll();
	}

	public getQueueByProgress(): Promise<Queue> {
		return this.queueDatastore.getOneByOptionsAndUpdate({
			progress: -1
		}, { progress: 0 });
	}

	public updateQueue(queue, update): Promise<Queue> {
		const options = {
			_id: queue._id
		};

		return this.queueDatastore.getOneByOptionsAndUpdate(options, update);
	}

	public async createQueue(item: Queue, file, thumbnail): Promise<Queue> {
		const filePath: string = file.path;
		const thumbnailPath: string = thumbnail.path;

		item.path = filePath;
		item.thumbnail = thumbnailPath;

		const queue: Queue = await this.queueDatastore.create(item);
		return queue;
	}

	public deleteQueues() {
		return this.queueDatastore.removeAll();
	}
}