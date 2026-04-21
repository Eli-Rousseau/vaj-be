import { randomUUID, randomBytes } from "crypto";
import { AsyncLocalStorage } from "async_hooks";

export function generateTraceId(): string {
    return randomUUID();
}

export function generateSpanId() {
    return randomBytes(8).toString('hex');
}


const asyncLocalStorage = new AsyncLocalStorage();

export class Context {
    traceId: string;
    spanId: string;
    parentSpanId: string;
    startTime: number;
    attributes: Record<string, any>;

    constructor(traceId: string, spanId: string, parentSpanId: string) {
        this.traceId = traceId;
        this.spanId = spanId;
        this.parentSpanId = parentSpanId;
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
    return asyncLocalStorage.run(context, fn);
}

export function getCurrentContext() {
    return asyncLocalStorage.getStore();
}
