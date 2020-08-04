"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ice_container_1 = require("ice-container");
const queue_model_1 = require("../model/queue.model");
class QueueDatastore extends ice_container_1.AbstractDatastore {
    constructor() {
        super('Queue', queue_model_1.QueueSchema);
    }
    getUnfinishedQueues(options) {
        const query = this.model.find({ progress: { $lt: 100 } }, null, options);
        return this.observe(query);
    }
    countUnfinishedQueues() {
        const query = this.model.countDocuments({ progress: { $lt: 100 } });
        return this.observe(query);
    }
}
exports.QueueDatastore = QueueDatastore;
