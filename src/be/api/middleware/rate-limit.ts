///////////
// TYPES //
///////////
type FixedWindowRateLimiterOptions = {
    windowMs?: number;
    maxRequests?: number;
}

type RateLimitEvent = {
    id: string;
    role: string;
};

type RateLimitResult = {
    allowed: boolean;
    remaining: number;
    maxRequests: number;
};

/////////////
// HELPERS //
/////////////
class FixedWindowRateLimiter {
    protected windowMs: number;
    protected maxRequests: number;
    protected windows: Map<string, number>;

  constructor(options: FixedWindowRateLimiterOptions) {
    this.windowMs = options.windowMs || 60000; // 1 minute
    this.maxRequests = options.maxRequests || 50;
    this.windows = new Map();
  }

  protected getWindowKey(id: string) {
    const windowStart = Math.floor(Date.now() / this.windowMs);
    return `${id}:${windowStart}`;
  }

  isAllowed(id: string) {
    const key = this.getWindowKey(id);
    const current = this.windows.get(key) || 0;

    if (current >= this.maxRequests) {
      return { allowed: false, remaining: 0, maxRequests: this.maxRequests };
    }

    this.windows.set(key, current + 1);

    this.cleanup();

    return {
      allowed: true,
      remaining: this.maxRequests - current - 1,
      maxRequests: this.maxRequests
    };
  }

  cleanup() {
    const now = Date.now();
    const currentWindow = Math.floor(now / this.windowMs);

    for (const [key] of this.windows) {
      const windowNum = key.slice(key.lastIndexOf(':') + 1);
      if (parseInt(windowNum) < currentWindow - 1) {
        this.windows.delete(key);
      }
    }
  }
}

const fixedWindowRateLimiter = new FixedWindowRateLimiter({
    windowMs: 300_000,
    maxRequests: 100
});

//////////
// MAIN //
//////////
export function rateLimit(event: RateLimitEvent): RateLimitResult {
    const { id, role } = event;
    if (["DEVELOPER"].includes(role)) return {
        allowed: true,
        remaining: -1,
        maxRequests: -1
    };
    return fixedWindowRateLimiter.isAllowed(id);
}