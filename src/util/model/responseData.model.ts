import { Queue } from "src/model/queue.model";

export interface responseData {
    list: Array<Queue>;
    total: number;
}