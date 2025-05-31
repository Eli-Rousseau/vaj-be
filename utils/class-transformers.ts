export const toInteger = function (value: number): number {
  if (typeof value !== "number") {
    throw new Error(`Expected a numeric value. Received: ${value}`);
  }

  return Math.round(value);
};

export const fromInteger = function (value: number): number {
  if (typeof value !== "number") {
    throw new Error(`Expected a numeric value. Received: ${value}`);
  }

  return Math.round(value);
};

const isDayString = function (value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
};

export const toDay = function (value: string): Date {
  if (typeof value !== "string" || !isDayString(value)) {
    throw new Error(`Expected a day value. Received: ${value}`);
  }

  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

export const fromDay = function (value: Date): string {
  if (!(value instanceof Date)) {
    throw new Error(`Expected an Date instance. Recieved: ${value}`);
  }

  const year: string = value.getUTCFullYear().toString();
  const month: string = (value.getUTCMonth() + 1).toString().padStart(2, "0");
  const day: string = value.getUTCDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const isValidTime = function (value: string): boolean {
  return /^\d{2}:\d{2}:\d{2}\.\d{6}$/.test(value);
};

export const toTime = function (value: string) {
  if (typeof value !== "string" || !isValidTime(value)) {
    throw new Error(`Expected a time value. Received: ${value}`);
  }

  const [hours, minutes, seconds] = value.split(":").map(Number);
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

export const fromTime = function (value: Date) {
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

const isValidDatetime = function (value: string): boolean {
  return /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{6}$/.test(value);
};

export const toDatetime = function (value: string) {
  if (typeof value !== "string" || !isValidDatetime(value)) {
    throw new Error(`Expected a day value. Received: ${value}`);
  }

  const splittedDatetime: string[] = value.split(" ");
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

export const fromDatetime = function (value: Date) {
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

export const toJSON = function (value: string) {
  if (typeof value !== "string") {
    throw new Error(`Expected an JSON instance. Recieved: ${value}`);
  }

  return JSON.parse(value);
};

export const fromJSON = function (value: any) {
  return JSON.stringify(value);
};
