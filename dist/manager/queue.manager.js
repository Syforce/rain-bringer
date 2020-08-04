"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ice_container_1 = require("ice-container");
const queue_datastore_1 = require("../datastore/queue.datastore");
class QueueManager {
    constructor() {
        this.iceContainerService = ice_container_1.IceContainerService.getInstance();
        this.queueDatastore = this.iceContainerService.getDatastore(queue_datastore_1.QueueDatastore.name);
    }
    async getQueues(currentPage, itemsPerPage, sortBy, sortOrder) {
        let options = {};
        if (currentPage && itemsPerPage) {
            const skip = (currentPage - 1) * itemsPerPage;
            const limit = itemsPerPage;
            options.skip = skip;
            options.limit = limit;
            if (sortBy && sortOrder) {
                let sortOptions;
                sortOptions = {
                    [sortBy]: sortOrder
                };
                options.sort = sortOptions;
            }
        }
        const list = await this.queueDatastore.getUnfinishedQueues(options);
        ;
        const total = await this.queueDatastore.countUnfinishedQueues();
        const data = {
            list: list,
            total: total
        };
        return data;
    }
    getQueueByProgress() {
        return this.queueDatastore.getOneByOptionsAndUpdate({
            progress: -1
        }, { progress: 0 });
    }
    updateQueue(queue, update) {
        const options = {
            _id: queue._id
        };
        return this.queueDatastore.getOneByOptionsAndUpdate(options, update);
    }
    async createQueue(item, file, thumbnail) {
        const filePath = file.path;
        const thumbnailPath = thumbnail.path;
        item.path = filePath;
        item.selectedThumbnail = thumbnailPath;
        const queue = await this.queueDatastore.create(item);
        return queue;
    }
    deleteQueues() {
        return this.queueDatastore.removeAll();
    }
}
exports.QueueManager = QueueManager;
