import { Queue } from '../model/queue.model';
import { ResponseData } from 'src/util/model/response-data.model';
export declare class QueueManager {
    private iceContainerService;
    private queueDatastore;
    constructor();
    getQueues(currentPage: number, itemsPerPage: number, sortBy: string, sortOrder: number): Promise<ResponseData>;
    getQueueByProgress(): Promise<Queue>;
    updateQueue(queue: Queue, update: any): Promise<Queue>;
    createQueue(item: Queue, file: any, thumbnail: any): Promise<Queue>;
    deleteQueues(): Promise<Queue & Queue[]>;
}
