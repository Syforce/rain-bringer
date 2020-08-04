import { AbstractRouter } from 'waterfall-gate';
export declare class QueueRouter extends AbstractRouter {
    private waterfallGateService;
    private rockGatherService;
    private queueService;
    private queueManager;
    constructor(routeMap: any);
    initRoutes(): void;
    private getQueues;
    private createQueue;
    private deleteQueues;
}
