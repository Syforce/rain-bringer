import { AbstractDatastore } from 'ice-container';
import { Queue } from '../model/queue.model';
export declare class QueueDatastore extends AbstractDatastore<Queue> {
    constructor();
    getUnfinishedQueues(options: any): Promise<Queue & Queue[]>;
    countUnfinishedQueues(): Promise<Queue & Queue[]>;
}
