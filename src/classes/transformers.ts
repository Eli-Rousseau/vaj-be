import { plainToInstance, instanceToPlain } from "class-transformer";

type TransformerOptions = {
  isNullable?: boolean;
};

class TransformerError extends Error {
    
    constructor(message: string) {
        super(message);
        this.name = "TransfomerError";
    }
}

abstract class TransformerClass {
  static fromPlain<T extends TransformerClass>(
    this: new (...args: any[]) => T,
    plain: unknown
  ): T {
    return plainToInstance(this, plain as object);
  }

  toPlain(): object {
    return instanceToPlain(this);
  }
}

const EPOCH_PATTERN = /^\d+$/;
const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DATETIME_PATTERN = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{6}$/;

export const toDay = function (
  value: any,
  options: TransformerOptions = { isNullable: false }
) {
  if (options?.isNullable && value === null) return null;

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
  value: any,
  options: TransformerOptions = { isNullable: false }
) {
  if (options?.isNullable && value === null) return null;

  if (value instanceof Date) {
    return value.getDate().toString();
  }

  throw new TransformerError(`Expected a Date instance. Recieved: ${value}`);
};

export const toDatetime = function (
  value: any,
  options: TransformerOptions = { isNullable: false }
) {
  if (options?.isNullable && value === null) return null;

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
  value: Date | null | undefined,
  options: TransformerOptions = { isNullable: false }
): string | null | undefined {
  if (options?.isNullable && value === null) return null;

  if (value instanceof Date) {
    return value.getDate().toString();
  }

  throw new TransformerError(`Expected an Date instance. Recieved: ${value}`);
};

export const toJSON = function (
  value: any,
  options: TransformerOptions = { isNullable: false }
) {
  if (options?.isNullable && value === null) return null;

  if (typeof value === "string") {
    return JSON.parse(value);
  }

  throw new TransformerError(`Expected a JSON instance. Recieved: ${value}`);
};

export const fromJSON = function (
  value: any,
  options: TransformerOptions = { isNullable: false }
) {
  if (options?.isNullable && value === null) return null;

  return JSON.stringify(value);
};