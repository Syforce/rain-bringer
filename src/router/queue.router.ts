import { WaterfallGateService, AbstractRouter, Request } from 'waterfall-gate';
import { Schema } from 'ice-container';
import { RockGatherService } from 'rock-gather';

import { QueueManager } from '../manager/queue.manager';
import { QueueService } from '../util/queue.service';

import { Queue } from '../model/queue.model';
import { listenerCount } from 'process';
import { responseData } from 'src/util/model/responseData.model';

export class QueueRouter extends AbstractRouter {
    private waterfallGateService: WaterfallGateService;
    private rockGatherService: RockGatherService;
    private queueService: QueueService;
    private queueManager: QueueManager = new QueueManager();

    constructor(routeMap) {
        super(routeMap);

        this.rockGatherService = RockGatherService.getInstance();
        this.waterfallGateService = WaterfallGateService.getInstance();
        this.queueService = QueueService.getInstance();
    }

    public initRoutes() {
        this.get({
            url: '/api/queues',
            callback: this.getQueues.bind(this)
        });

        this.post({
            url: '/api/video',
            callback: this.createQueue.bind(this),
            middleware: [this.rockGatherService.getMiddleware(['file', 'thumbnail'])]
        });

        this.delete({
            url: '/api/admin/queues',
            callback: this.deleteQueues.bind(this)
        });
    }

    private async getQueues(request: Request) {
        const currentPage: number = +request.query.currentPage;
        const itemsPerPage: number = +request.query.itemsPerPage;
        const sortBy: string = request.query.sortBy as string;
        const sortOrder: number = +request.query.sortOrder;
        
        if (currentPage && itemsPerPage) {
            let data: responseData = await this.queueManager.getManyByOptions(currentPage, itemsPerPage, sortBy, sortOrder);
            const jobs: Array<Queue> = this.queueService.getJobs();

            data.list.forEach(item => {
                jobs.forEach(job => {
                    if ((item._id as Schema.ObjectId).equals(job._id)) {
                        item.progress = job.progress;
                    }
                });
            });

            return data;
        } else {
            const list: Array<Queue> = await this.queueManager.getAll();
            return list;
        }
    }

    private async createQueue(request: Request) {
        const item: Queue = request.body;
        const file = request.files.file[0];
        const thumbnail = request.files.thumbnail[0];

        const queue: Queue = await this.queueManager.createQueue(item, file, thumbnail);
        this.queueService.nextTick();

        return queue;
    }

    private deleteQueues(request: Request) {
        return this.queueManager.deleteQueues();
    }
}
