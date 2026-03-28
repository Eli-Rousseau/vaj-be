import { Transform, plainToInstance, instanceToPlain } from 'class-transformer';

class TransformerError extends Error {
    
    constructor(message: string) {
        super(message);
        this.name = "TransfomerError";
    }
}

export function Default(defaultValue: any = null): PropertyDecorator {
	return (target: Object, propertyKey: string | symbol) => {
		Transform(({ value }) => {
			if (value !== null && value !== undefined) return value;

			if (typeof defaultValue === "function") return defaultValue();

			if (Array.isArray(defaultValue)) return [...defaultValue];

			if (typeof defaultValue === "object") {
				return defaultValue === null ? null : { ...defaultValue };
			}

			return defaultValue;
		})(target, propertyKey);
	};
}

const annotationMetadata = new WeakMap<object, Map<string | symbol, symbol>>();

export function Annotate(annotation: string): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    const valueKey = Symbol(`__${String(propertyKey)}_value`);
    const annotationsKey = Symbol(`__${String(propertyKey)}_annotations`);

    let map = annotationMetadata.get(target);
    if (!map) {
      map = new Map();
      annotationMetadata.set(target, map);
    }
    map.set(propertyKey, annotationsKey);

    Object.defineProperty(target, propertyKey, {
      get: function () {
        return this[valueKey];
      },
      set: function (newValue: any) {
        this[valueKey] = newValue;

        if (!this[annotationsKey]) {
          this[annotationsKey] = [];
        }

        if (!this[annotationsKey].includes(annotation)) {
          this[annotationsKey].push(annotation);
        }
      },
      enumerable: true,
      configurable: true,
    });
  };
}

type ToPlainOptions = {
  onlyMutables?: boolean;
}

export class TransformerClass {
  static fromPlain<T extends TransformerClass>(
    this: new (...args: any[]) => T,
    plain: unknown
  ): T {
    return plainToInstance(this, plain as object, { excludeExtraneousValues: true });
  }

  private getAnnotations(propertyKey: string | symbol): string[] {
    const proto = Object.getPrototypeOf(this);
    const map = annotationMetadata.get(proto);

    if (!map) return [];

    const annotationsKey = map.get(propertyKey);
    if (!annotationsKey) return [];

    const self = this as any;
    return self[annotationsKey] || [];
  }

  toPlain(options?: ToPlainOptions): object {
    let plain = instanceToPlain(this);

    if (options?.onlyMutables) {
      const allKeys = Object.keys(plain);
      const nonMutableKeys = allKeys.filter((key) => !this.getAnnotations(key).includes("Mutable"));
      nonMutableKeys.forEach((key) => { delete plain[key] });
    }

    return plain
  }
}

const EPOCH_PATTERN = /^\d+$/;
const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DATETIME_PATTERN = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{6}$/;

export const toDay = function (
  value: any
) {
  if (value === undefined || value === null) return null;

  if (value instanceof Date) return value;

  if (typeof value == "string") {

    if (DAY_PATTERN.test(value)) {
        const [year, month, day] = value.split("-").map(Number);
        return new Date(Date.UTC(year, month - 1, day));
    }

    if (EPOCH_PATTERN.test(value)) {
        const timestamp = Number(value);
        return new Date(timestamp);
    }

  }

  throw new TransformerError(`Expected a day value. Received: ${value}`);
};

export const fromDay = function (
  value: any
) {
  if (value === undefined || value === null) return null;

  if (value instanceof Date) {
    return value.getDate().toString();
  }

  throw new TransformerError(`Expected a Date instance. Recieved: ${value}`);
};

export const toDatetime = function (
  value: any
) {
  if (value === undefined || value === null) return null;

  if (value instanceof Date) return value;

  if (typeof value === "string") {

    if (DATETIME_PATTERN.test(value)) {
        const splittedDatetime = value.split(" ");
        const [year, month, day] = splittedDatetime[0].split("-").map(Number);
        const [hours, minutes, seconds] = splittedDatetime[1].split(":").map(Number);
        const milliseconds = (seconds - Math.floor(seconds)) * 1000;

        return new Date(
            Date.UTC(
            year,
            month - 1,
            day,
            hours,
            minutes,
            Math.floor(seconds),
            milliseconds
            )
        );
    }

    if (EPOCH_PATTERN.test(value)) {
        const timestamp = Number(value);
        return new Date(timestamp);
    }

  }

  throw new TransformerError(`Expected a day value. Received: ${value}`);
};

export const fromDatetime = function (
  value: Date | null
): string | null {
  if (value === undefined || value === null) return null;

  if (value instanceof Date) {
    return value.getDate().toString();
  }

  throw new TransformerError(`Expected an Date instance. Recieved: ${value}`);
};

export const toJSON = function (
  value: any
) {
  if (value === undefined || value === null) return null;

  if (typeof value === "string") {
    return JSON.parse(value);
  }

  throw new TransformerError(`Expected a JSON instance. Recieved: ${value}`);
};

export const fromJSON = function (
  value: any
) {
  if (value === undefined || value === null) return null;

  return JSON.stringify(value);
};