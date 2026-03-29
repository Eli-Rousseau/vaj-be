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

export function Annotate(annotation: string): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    let annotations = {} as Record<string, Set<string>>;
    if (target?.annotations) {
      annotations = target.annotations;
    }

    if (Object.keys(annotation).includes(String(propertyKey))) annotations[String(propertyKey)].add(annotation);
    else annotations[String(propertyKey)] = new Set([annotation]);

    target["annotations"] = annotations;
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

  private getAnnotations(propertyKey: string | symbol): Set<string> {
    const annotations = (this as any)?.annotations;
    if (!annotations) return new Set();

    let propertyAnnotations = new Set<string>();
    if (Object.keys(annotations).includes(String(propertyKey))) {
      propertyAnnotations = annotations[String(propertyKey)] as Set<string>;
    }

    return propertyAnnotations;
  }

  toPlain(options?: ToPlainOptions): object {
    let plain = instanceToPlain(this);

    if (options?.onlyMutables) {
      const allKeys = Object.keys(plain);
      const nonMutableKeys = allKeys.filter((key) => !this.getAnnotations(key).has("Mutable"));
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
    return value.toISOString();
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