"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const waterfall_gate_1 = require("waterfall-gate");
const ice_container_1 = require("ice-container");
const rock_gather_1 = require("rock-gather");
const storage_service_1 = require("./util/storage.service");
const queue_datastore_1 = require("./datastore/queue.datastore");
const queue_router_1 = require("./router/queue.router");
const config_1 = require("./config");
class App {
    constructor() {
        this.init();
    }
    init() {
        this.waterfallGateService = waterfall_gate_1.WaterfallGateService.getInstance();
        this.iceContainerService = ice_container_1.IceContainerService.getInstance();
        this.rockGatherService = rock_gather_1.RockGatherService.getInstance();
        this.storageService = storage_service_1.StorageService.getInstance();
        this.startDatabase();
        this.startStorage();
        this.startServer();
    }
    startDatabase() {
        this.iceContainerService.registerDatastore(queue_datastore_1.QueueDatastore);
        // this.iceContainerService.registerDatastore(QueueDatastore);
        this.iceContainerService.init(config_1.CONFIG.database);
    }
    startStorage() {
        this.rockGatherService.init(config_1.CONFIG.fileStorage);
        this.storageService.init(config_1.CONFIG.storage);
    }
    startServer() {
        this.waterfallGateService.registerRouter(queue_router_1.QueueRouter);
        this.waterfallGateService.init(config_1.CONFIG.server);
    }
}
exports.default = new App().app;
