"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ice_container_1 = require("ice-container");
exports.QueueSchema = new ice_container_1.Schema({
    path: String,
    selectedThumbnail: String,
    original: String,
    preview: String,
    talent: String,
    thumbnails: [String],
    title: String,
    progress: {
        type: Number,
        default: -1
    }
}, {
    timestamps: true
});
