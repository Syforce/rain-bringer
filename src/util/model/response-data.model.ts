import { Queue } from "src/model/queue.model";

export interface ResponseData {
    list: Array<Queue>;
    total: number;
}