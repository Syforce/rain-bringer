import { AbstractDatastore } from 'ice-container';

import { Queue, QueueSchema } from '../model/queue.model';

export class QueueDatastore extends AbstractDatastore<Queue> {
	constructor() {
		super('Queue', QueueSchema);
	}
}