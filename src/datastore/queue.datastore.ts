import { AbstractDatastore } from 'ice-container';

import { Queue, QueueSchema } from '../model/queue.model';

export class QueueDatastore extends AbstractDatastore<Queue> {
	constructor() {
		super('Queue', QueueSchema);
	}
	
	public getUnfinishedQueues(options: any) {
		const query = this.model.find({ progress: { $lt: 100 } }, null, options);

		return this.observe(query);
	}

	public countUnfinishedQueues() {
		const query = this.model.countDocuments({ progress: { $lt: 100 } });

		return this.observe(query);
	}
}