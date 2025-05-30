import {
  Expose,
  plainToInstance,
  Transform,
  instanceToPlain,
} from "class-transformer";
import "reflect-metadata";

// const isISOString = (value: string): boolean => {
//   const date: Date = new Date(value);
//   return !Number.isNaN(date.valueOf()) && date.toISOString() === value;
// };

// class Datetime extends Date {
//   private constructor(value: Date) {
//     super(value);
//   }

//   static fromObject(value: any): Datetime {
//     if (typeof value !== "string" || !isISOString(value)) {
//       throw new Error(`Expected a datetime value. Received: ${value}`);
//     }

//     return new Datetime(value);
//   }

//   toObject() {
//     return this.toISOString();
//   }
// }

// const isTimeString = (value: string): boolean => {
//   const date: Date = parse(value, "HH:mm:ss", new Date());
//   return !Number.isNaN(date.valueOf()) && format(date, "HH:mm:ss") === value;
// };

// class TimeBase extends DataClassMixin(Date) {}

// class Time extends TimeBase {
//   private constructor(value: string) {
//     const date = parse(value, "HH:mm:ss", new Date()).toISOString();
//     super(date);
//   }

//   static fromObject(value: any): Time {
//     if (typeof value !== "string" || !isTimeString(value)) {
//       throw new Error(`Expected a time value. Received: ${value}`);
//     }

//     return new Time(value);
//   }

//   toObject(): string {
//     return format(this, "HH:mm:ss");
//   }
// }

// const isDayString = (value: string): boolean => {
//   const date: Date = parse(value, "yyyy-MM-dd", new Date());
//   return !Number.isNaN(date.valueOf()) && format(date, "yyyy-MM-dd") === value;
// };

export const toInteger = function (value: number) {
  if (typeof value != "number") {
    throw new Error(`Expected a numeric value. Received: ${value}`);
  }

  return Math.round(value);
};

export const fromInteger = function (value: number) {
  if (typeof value != "number") {
    throw new Error(`Expected a numeric value. Received: ${value}`);
  }

  return Math.round(value);
};

const isDayString = (value: string): boolean => {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
};

export const toDay = function (value: string) {
  if (!isDayString(value)) {
    throw new Error(`Expected a day value. Received: ${value}`);
  }

  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

export const fromDay = function (value: Date) {
  if (!(value instanceof Date)) {
    throw new Error(`Expected an Date instance. Recieved: ${value}`);
  }

  const year = value.getFullYear();
  const month = (value.getMonth() + 1).toString().padStart(2, "0");
  const day = value.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

class User {
  @Expose()
  reference?: number;

  @Expose()
  name!: string;

  @Transform(({ value }) => toInteger(value), { toClassOnly: true })
  @Expose()
  age!: number;

  @Transform(({ value }) => toDay(value), { toClassOnly: true })
  @Transform(({ value }) => fromDay(value), { toPlainOnly: true })
  @Expose()
  birthday!: Date;

  @Expose()
  email!: string;

  @Expose()
  phone!: string | null;

  @Expose()
  picture!: Object;
}

const plain = {
  // reference: 123,
  name: "Eli",
  age: 24.8,
  birthday: "2000-07-15",
  email: "eli@mail.com",
  phone: null,
  picture: {
    bucket: "mybucket",
    key: "img.png",
  },
  heightInCm: 180,
};

console.log("plain object: ", plain);

const instance = plainToInstance(User, plain, {
  excludeExtraneousValues: true,
});
console.log("instance object: ", instance);

const replain = instanceToPlain(instance);
console.log("replained object: ", replain);
