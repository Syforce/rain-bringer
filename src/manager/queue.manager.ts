import { IceContainerService } from 'ice-container';

import { QueueDatastore } from '../datastore/queue.datastore';

import { Queue } from '../model/queue.model';

import { responseData } from 'src/util/model/responseData.model';

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
	
	public async getQueuesPaginated(currentPage: number, itemsPerPage: number, sortBy?: string, sortOrder?: number): Promise<any> {
		const skip = (currentPage - 1) * itemsPerPage;
		let sortOptions: any;

		// TODO: SQL Injection Error
		if (sortBy && sortOrder) {
			sortOptions = {
				[sortBy]: sortOrder
			}
		}

		const options = {
			skip: skip,
			limit: itemsPerPage,
			sort: sortOptions
		}

		const list: Array<Queue> = await this.queueDatastore.getManyByOptions({ progress: { $lt: 100 } }, options);
		const total: number = await this.queueDatastore.count({progress: { $lt: 100 }});
		
		const data: responseData = {
			list: list,
			total: total
		}

		return data;
	}
}