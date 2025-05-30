// import {
//   Expose,
//   plainToInstance,
//   Transform,
//   instanceToPlain,
// } from "class-transformer";
// import "reflect-metadata";

export const toInteger = function (value: number): number {
  if (typeof value != "number") {
    throw new Error(`Expected a numeric value. Received: ${value}`);
  }

  return Math.round(value);
};

export const fromInteger = function (value: number): number {
  if (typeof value != "number") {
    throw new Error(`Expected a numeric value. Received: ${value}`);
  }

  return Math.round(value);
};

const isDayString = function (value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
};

export const toDay = function (value: string): Date {
  if (typeof value != "string" || !isDayString(value)) {
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
  if (typeof value != "string" || !isValidTime(value)) {
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
  if (typeof value != "string" || !isValidDatetime(value)) {
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

// class User {
//   @Expose()
//   reference?: number;

//   @Expose()
//   name!: string;

//   @Transform(({ value }) => toInteger(value), { toClassOnly: true })
//   @Expose()
//   age!: number;

//   @Transform(({ value }) => toDay(value), { toClassOnly: true })
//   @Transform(({ value }) => fromDay(value), { toPlainOnly: true })
//   @Expose()
//   birthday!: Date;

//   @Expose()
//   email!: string;

//   @Expose()
//   phone!: string | null;

//   @Expose()
//   picture!: Object;

//   @Transform(({ value }) => toDatetime(value), { toClassOnly: true })
//   @Transform(({ value }) => fromDatetime(value), { toPlainOnly: true })
//   @Expose()
//   created_at!: Date;

//   @Transform(({ value }) => toTime(value), { toClassOnly: true })
//   @Transform(({ value }) => fromTime(value), { toPlainOnly: true })
//   @Expose()
//   time!: Date;
// }

// const plain = {
//   // reference: 123,
//   name: "Eli",
//   age: 24.8,
//   birthday: "2000-07-15",
//   email: "eli@mail.com",
//   phone: null,
//   picture: {
//     bucket: "mybucket",
//     key: "img.png",
//   },
//   heightInCm: 180,
//   created_at: "2025-05-14 21:00:52.802644",
//   time: "11:19:09.805434",
// };

// console.log("plain object: ", plain);

// const instance = plainToInstance(User, plain, {
//   excludeExtraneousValues: true,
// });
// console.log("instance object: ", instance);

// const replain = instanceToPlain(instance);
// console.log("replained object: ", replain);
