import { ResponseData } from './model/response-data.model';
export declare class QueueService {
    private static instance;
    private queueManager;
    private storageService;
    private convertService;
    private jobs;
    private constructor();
    static getInstance(): QueueService;
    nextTick(): void;
    applyProgressToJobs(data: ResponseData): ResponseData;
    private getNextJob;
    private processQueue;
    private convertQueue;
    private updateQueue;
    private removeFiles;
    private getFileDetails;
    private createVideo;
}
