import { IceContainerService } from 'ice-container';

import { QueueDatastore } from '../datastore/queue.datastore';

import { Queue } from '../model/queue.model';

import { ResponseData } from 'src/util/model/response-data.model';

export class QueueManager {
	private iceContainerService: IceContainerService;
	private queueDatastore: QueueDatastore;

	constructor() {
		this.iceContainerService = IceContainerService.getInstance();

		this.queueDatastore = this.iceContainerService.getDatastore(QueueDatastore.name) as QueueDatastore;
	}

	public async getQueues(currentPage: number, itemsPerPage: number, sortBy: string, sortOrder: number): Promise<ResponseData> {
		let options: any = {};

		if (currentPage && itemsPerPage) {
			const skip = (currentPage - 1) * itemsPerPage;
			const limit = itemsPerPage;

			options.skip = skip;
			options.limit = limit;

			if (sortBy && sortOrder) {
				let sortOptions: any;

				sortOptions = {
					[sortBy]: sortOrder
				}

				options.sort = sortOptions;
			}
		}

		const list: Array<Queue> = await this.queueDatastore.getUnfinishedQueues(options);;
		const total: number = await this.queueDatastore.countUnfinishedQueues();
		const data: ResponseData = {
			list: list,
			total: total
		}

		return data;
	}

	public getQueueByProgress(): Promise<Queue> {
		return this.queueDatastore.getOneByOptionsAndUpdate({
			progress: -1
		}, { progress: 0 });
	}

	public updateQueue(queue: Queue, update: any): Promise<Queue> {
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