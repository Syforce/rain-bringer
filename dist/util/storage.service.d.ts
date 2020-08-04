export declare class StorageService {
    private static instance;
    private constructor();
    init(config: StorageConfig): void;
    upload(path: string): Promise<string>;
    uploadLarge(path: string): Promise<string>;
    static getInstance(): StorageService;
}
export interface StorageConfig {
    name: string;
    apiKey: string;
    apiSecret: string;
}
