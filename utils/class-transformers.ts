type TransformerOptions = {
  isNullable?: boolean;
  isUndefinable?: boolean;
};

export const toInteger = function (
  value: number | null | undefined,
  options: TransformerOptions = { isNullable: false, isUndefinable: false }
): number | null | undefined {
  if (
    options.hasOwnProperty("isNullable") &&
    options.isNullable &&
    value === null
  ) {
    return null;
  }
  if (
    options.hasOwnProperty("isUndefinable") &&
    options.isUndefinable &&
    value === undefined
  ) {
    return undefined;
  }
  if (typeof value !== "number") {
    throw new Error(`Expected a numeric value. Received: ${value}`);
  }

  return Math.round(value);
};

export const fromInteger = function (
  value: number | null | undefined,
  options: TransformerOptions = { isNullable: false, isUndefinable: false }
): number | null | undefined {
  if (
    options.hasOwnProperty("isNullable") &&
    options.isNullable &&
    value === null
  ) {
    return null;
  }
  if (
    options.hasOwnProperty("isUndefinable") &&
    options.isUndefinable &&
    value === undefined
  ) {
    return undefined;
  }
  if (typeof value !== "number") {
    throw new Error(`Expected a numeric value. Received: ${value}`);
  }

  return Math.round(value);
};

export const toDay = function (
  value: string | Date | null | undefined,
  options: TransformerOptions = { isNullable: false, isUndefinable: false }
): Date | null | undefined {
  if (
    options.hasOwnProperty("isNullable") &&
    options.isNullable &&
    value === null
  ) {
    return null;
  }
  if (
    options.hasOwnProperty("isUndefinable") &&
    options.isUndefinable &&
    value === undefined
  ) {
    return undefined;
  }
  if (value instanceof Date) {
    return value;
  }

  const isDayPattern: RegExp = /\d{4}-\d{2}-\d{2}/;
  if (typeof value !== "string" || !isDayPattern.test(value)) {
    throw new Error(`Expected a day value. Received: ${value}`);
  }

  const dayValue: string = value.match(isDayPattern)?.[0]!;

  const [year, month, day] = dayValue.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

export const fromDay = function (
  value: Date | null | undefined,
  options: TransformerOptions = { isNullable: false, isUndefinable: false }
): string | null | undefined {
  if (
    options.hasOwnProperty("isNullable") &&
    options.isNullable &&
    value === null
  ) {
    return null;
  }
  if (
    options.hasOwnProperty("isUndefinable") &&
    options.isUndefinable &&
    value === undefined
  ) {
    return undefined;
  }
  if (!(value instanceof Date)) {
    throw new Error(`Expected an Date instance. Recieved: ${value}`);
  }

  const year: string = value.getUTCFullYear().toString();
  const month: string = (value.getUTCMonth() + 1).toString().padStart(2, "0");
  const day: string = value.getUTCDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const toTime = function (
  value: string | Date | null | undefined,
  options: TransformerOptions = { isNullable: false, isUndefinable: false }
): Date | null | undefined {
  if (
    options.hasOwnProperty("isNullable") &&
    options.isNullable &&
    value === null
  ) {
    return null;
  }
  if (
    options.hasOwnProperty("isUndefinable") &&
    options.isUndefinable &&
    value === undefined
  ) {
    return undefined;
  }
  if (value instanceof Date) {
    return value;
  }

  const isTimePattern: RegExp = /\d{2}:\d{2}:\d{2}\.\d{3,6}/;
  if (typeof value !== "string" || !isTimePattern.test(value)) {
    throw new Error(`Expected a time value. Received: ${value}`);
  }

  const timeValue: string = value.match(isTimePattern)?.[0]!;

  const [hours, minutes, seconds] = timeValue.split(":").map(Number);
  const milliseconds: number = (seconds - Math.floor(seconds)) * 1000;
  const now = new Date();
  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCFullYear(),
      now.getUTCDay(),
      hours,
      minutes,
      Math.floor(seconds),
      milliseconds
    )
  );
};

export const fromTime = function (
  value: Date | null | undefined,
  options: TransformerOptions = { isNullable: false, isUndefinable: false }
): string | null | undefined {
  if (
    options.hasOwnProperty("isNullable") &&
    options.isNullable &&
    value === null
  ) {
    return null;
  }
  if (
    options.hasOwnProperty("isUndefinable") &&
    options.isUndefinable &&
    value === undefined
  ) {
    return undefined;
  }
  if (!(value instanceof Date)) {
    throw new Error(`Expected an Date instance. Recieved: ${value}`);
  }

  const hours: string = value.getUTCHours().toString().padStart(2, "0");
  const minutes: string = value.getUTCMinutes().toString().padStart(2, "0");
  const seconds: string = value.getUTCSeconds().toString().padStart(2, "0");
  const milliseconds: string = (value.getUTCMilliseconds() / 1000).toPrecision(
    6
  );
  return `${hours}:${minutes}:${seconds}.${milliseconds.slice(
    2,
    milliseconds.length
  )}`;
};

export const toDatetime = function (
  value: string | Date | null | undefined,
  options: TransformerOptions = { isNullable: false, isUndefinable: false }
): Date | null | undefined {
  if (
    options.hasOwnProperty("isNullable") &&
    options.isNullable &&
    value === null
  ) {
    return null;
  }
  if (
    options.hasOwnProperty("isUndefinable") &&
    options.isUndefinable &&
    value === undefined
  ) {
    return undefined;
  }
  if (value instanceof Date) {
    return value;
  }

  const isDatetimePattern: RegExp =
    /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{6}/;
  if (typeof value !== "string" || !isDatetimePattern.test(value)) {
    throw new Error(`Expected a day value. Received: ${value}`);
  }
  const datetimeValue: string = value.match(isDatetimePattern)?.[0]!;

  const splittedDatetime: string[] = datetimeValue.split(" ");
  const [year, month, day] = splittedDatetime[0].split("-").map(Number);
  const [hours, minutes, seconds] = splittedDatetime[1].split(":").map(Number);
  const milliseconds: number = (seconds - Math.floor(seconds)) * 1000;
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
};

export const fromDatetime = function (
  value: Date | null | undefined,
  options: TransformerOptions = { isNullable: false, isUndefinable: false }
): string | null | undefined {
  if (
    options.hasOwnProperty("isNullable") &&
    options.isNullable &&
    value === null
  ) {
    return null;
  }
  if (
    options.hasOwnProperty("isUndefinable") &&
    options.isUndefinable &&
    value === undefined
  ) {
    return undefined;
  }
  if (!(value instanceof Date)) {
    throw new Error(`Expected an Date instance. Recieved: ${value}`);
  }

  const year: string = value.getUTCFullYear().toString();
  const month: string = (value.getUTCMonth() + 1).toString().padStart(2, "0");
  const day: string = value.getUTCDate().toString().padStart(2, "0");
  const hours: string = value.getUTCHours().toString().padStart(2, "0");
  const minutes: string = value.getUTCMinutes().toString().padStart(2, "0");
  const seconds: string = value.getUTCSeconds().toString().padStart(2, "0");
  const milliseconds: string = (value.getUTCMilliseconds() / 1000).toPrecision(
    6
  );
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds.slice(
    2,
    milliseconds.length
  )}`;
};

export const toJSON = function (
  value: string | null | undefined,
  options: TransformerOptions = { isNullable: false, isUndefinable: false }
): any | null | undefined {
  if (
    options.hasOwnProperty("isNullable") &&
    options.isNullable &&
    value === null
  ) {
    return null;
  }
  if (
    options.hasOwnProperty("isUndefinable") &&
    options.isUndefinable &&
    value === undefined
  ) {
    return undefined;
  }
  if (typeof value !== "string") {
    throw new Error(`Expected an JSON instance. Recieved: ${value}`);
  }

  return JSON.parse(value);
};

export const fromJSON = function (
  value: any | null | undefined,
  options: TransformerOptions = { isNullable: false, isUndefinable: false }
): any | null | undefined {
  if (
    options.hasOwnProperty("isNullable") &&
    options.isNullable &&
    value === null
  ) {
    return null;
  }
  if (
    options.hasOwnProperty("isUndefinable") &&
    options.isUndefinable &&
    value === undefined
  ) {
    return undefined;
  }
  return JSON.stringify(value);
};
