import { randomUUID } from "crypto";
import { AsyncLocalStorage } from "async_hooks";

export function generateTraceId(): string {
    return randomUUID();
}

const asyncLocalStorage = new AsyncLocalStorage();

export class Context {
    traceId: string;
    startTime: number;
    attributes: Record<string, any>;

    constructor(traceId: string) {
        this.traceId = traceId;
        this.startTime = Date.now();
        this.attributes = {};
    }

    setAttribute(key: string, value: any) {
        this.attributes[key] = value;
    }

    getAttribute(key: string) {
        return this.attributes[key];
    }
}

export function runWithContext(context: Context, fn: () => unknown) {
    return asyncLocalStorage.run(context, fn as any);
}

export function getCurrentContext() {
    return asyncLocalStorage.getStore() as any;
}
