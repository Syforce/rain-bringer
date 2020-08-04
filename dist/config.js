"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const databaseConfig = {
    host: process.env.MONGO_HQ || 'mongodb://localhost/bringer'
};
const serverConfig = {
    port: +process.env.PORT || 8002
};
const fileConfig = {
    destination: './uploads/',
    randomNames: true
};
const storageConfig = {
    name: 'syforce',
    apiKey: '733675221936768',
    apiSecret: 'Efa6K4_TiioWE20EBQ2Gpzm3U-U'
};
const thumbnailConfig = {
    maxWidth: 300,
    maxHeight: 300,
    count: 30,
    queueLimit: 2,
    start: 2,
    end: 5,
};
const requestConfig = {
    hostname: 'localhost',
    port: 8111,
};
const threadConfig = {
    threads: 2,
};
exports.CONFIG = {
    server: serverConfig,
    database: databaseConfig,
    fileStorage: fileConfig,
    storage: storageConfig,
    thumbnailConfig: thumbnailConfig,
    request: requestConfig,
    threadConfig: threadConfig
};
