"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const waterfall_gate_1 = require("waterfall-gate");
const rock_gather_1 = require("rock-gather");
const queue_manager_1 = require("../manager/queue.manager");
const queue_service_1 = require("../util/queue.service");
class QueueRouter extends waterfall_gate_1.AbstractRouter {
    constructor(routeMap) {
        super(routeMap);
        this.queueManager = new queue_manager_1.QueueManager();
        this.rockGatherService = rock_gather_1.RockGatherService.getInstance();
        this.waterfallGateService = waterfall_gate_1.WaterfallGateService.getInstance();
        this.queueService = queue_service_1.QueueService.getInstance();
    }
    initRoutes() {
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
    async getQueues(request) {
        const currentPage = +request.query.currentPage;
        const itemsPerPage = +request.query.itemsPerPage;
        const sortBy = request.query.sortBy;
        const sortOrder = +request.query.sortOrder;
        const data = await this.queueManager.getQueues(currentPage, itemsPerPage, sortBy, sortOrder);
        return this.queueService.applyProgressToJobs(data);
    }
    async createQueue(request) {
        const item = request.body;
        const file = request.files.file[0];
        const thumbnail = request.files.thumbnail[0];
        const queue = await this.queueManager.createQueue(item, file, thumbnail);
        this.queueService.nextTick();
        return queue;
    }
    deleteQueues(request) {
        return this.queueManager.deleteQueues();
    }
}
exports.QueueRouter = QueueRouter;
