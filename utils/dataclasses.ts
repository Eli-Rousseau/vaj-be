import { Type, Expose, plainToInstance, Transform, serialize } from "class-transformer";
import { parse } from "date-fns";
import "reflect-metadata";

const isISOString = (value: string): boolean => {
  const date: Date = new Date(value);
  return !Number.isNaN(date.valueOf()) && date.toISOString() === value;
};

class Datetime extends Date {
  private constructor(value: Date) {
    super(value);
  }

  static fromObject(value: any): Datetime {
    if (typeof value !== "string" || !isISOString(value)) {
      throw new Error(`Expected a datetime value. Received: ${value}`);
    }

    return new Datetime(value);
  }

  toObject() {
    return this.toISOString();
  }
}

const isTimeString = (value: string): boolean => {
  const date: Date = parse(value, "HH:mm:ss", new Date());
  return !Number.isNaN(date.valueOf()) && format(date, "HH:mm:ss") === value;
};

class TimeBase extends DataClassMixin(Date) {}

class Time extends TimeBase {
  private constructor(value: string) {
    const date = parse(value, "HH:mm:ss", new Date()).toISOString();
    super(date);
  }

  static fromObject(value: any): Time {
    if (typeof value !== "string" || !isTimeString(value)) {
      throw new Error(`Expected a time value. Received: ${value}`);
    }

    return new Time(value);
  }

  toObject(): string {
    return format(this, "HH:mm:ss");
  }
}

const isDayString = (value: string): boolean => {
  const date: Date = parse(value, "yyyy-MM-dd", new Date());
  return !Number.isNaN(date.valueOf()) && format(date, "yyyy-MM-dd") === value;
};

class DayBase extends DataClassMixin(Date) {}

class Day extends DayBase {
  private constructor(value: string) {
    const date = parse(value, "yyyy-MM-dd", new Date()).toISOString();
    super(date);
  }

  static fromObject(value: any): Day {
    if (typeof value !== "string" || !isDayString(value)) {
      throw new Error(`Expected a day value. Received: ${value}`);
    }

    return new Day(value);
  }

  toObject(): string {
    return format(this, "yyyy-MM-dd");
  }
}

class User {
  @Expose() reference?: number;
  @Expose() name!: string;
  @Expose()
  @Transform(({ value }) => Integer(value), { toClassOnly: true })
  age!: number;
  @Type(() => Date) @Expose() birthday!: Date;
  @Expose() email!: string;
  @Expose() phone!: string | null;
  @Type(() => Object) @Expose() picture!: Object;
}

const object = {
  reference: 123,
  name: "Eli",
  age: 24.8,
  birthday: parse("2000-07-15", "yyyy-mm-dd", new Date()),
  email: "eli@mail.com",
  phone: null,
  picture: {
    bucket: "mybucket",
    key: "img.png",
  },
  heightInCm: 180,
};

const deserObject = plainToInstance(User, object, {
  excludeExtraneousValues: true,
});
console.log(deserObject);
