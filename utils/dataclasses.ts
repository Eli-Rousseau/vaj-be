import { parse, format } from "date-fns";

type Constructor<T = {}> = new (...args: any[]) => T;

function DataClassMixin<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    static fromObject(value: any): any {
      throw new Error("fromObject not implemented");
    }
    toObject(): any {
      throw new Error("toObject not implemented");
    }
  };
}

class IntegerBase extends DataClassMixin(Number) {}

class Integer extends IntegerBase {
  private constructor(value: number) {
    super(value);
  }

  static fromObject(value: any): Integer {
    const parsedValue: any =
      typeof value === "string" ? parseFloat(value) : value;

    if (typeof parsedValue !== "number" || isNaN(parsedValue)) {
      throw new Error(
        `Expected a number or numeric string. Received: ${value}`
      );
    }

    return new Integer(parsedValue);
  }

  toObject(): number {
    return Math.round(this.valueOf());
  }
}

class FloatBase extends DataClassMixin(Number) {}

class Float extends FloatBase {
  private constructor(value: number) {
    super(value);
  }

  static fromObject(value: any): Float {
    const parsedValue: any =
      typeof value === "string" ? parseFloat(value) : value;

    if (typeof parsedValue !== "number" || isNaN(parsedValue)) {
      throw new Error(`Expected a number or numeric value. Received: ${value}`);
    }

    return new Float(parsedValue);
  }

  toObject(): number {
    return parseFloat(this.valueOf().toString());
  }
}

class BoolBase extends DataClassMixin(Boolean) {}

class Bool extends BoolBase {
  private constructor(value: boolean) {
    super(value);
  }

  static fromObject(value: any): Bool {
    const parsedValue: any =
      value === "true"
        ? true
        : value === "false"
        ? false
        : value
        ? true
        : false;

    if (typeof parsedValue !== "boolean") {
      throw new Error(`Expected a truthy or falsy value. Received: ${value}`);
    }

    return new Bool(parsedValue);
  }

  toObject(): boolean {
    return this.valueOf();
  }
}

class StringyBase extends DataClassMixin(String) {}

class Stringy extends StringyBase {
  private constructor(value: string) {
    super(value);
  }

  static fromObject(value: any): Stringy {
    const parsedValue: any = value.toString();

    if (typeof parsedValue !== "string") {
      throw new Error(`Expected a string value. Received: ${value}`);
    }

    return new Stringy(parsedValue);
  }

  toObject(): string {
    return this.valueOf();
  }
}

class JSONBase extends DataClassMixin(String) {}

class JSONStringy extends JSONBase {
  private constructor(value: Object) {
    const stringy: string = JSON.stringify(value);
    super(stringy);
  }

  static fromObject(value: any) {
    if (!(value instanceof Object)) {
      throw new Error(`Expected an Object instance. Received ${value}`);
    }

    return new JSONStringy(value);
  }

  toObject(): string {
    return this.toString();
  }
}

const isISOString = (value: string): boolean => {
  const date: Date = new Date(value);
  return !Number.isNaN(date.valueOf()) && date.toISOString() === value;
};

class DatetimeBase extends DataClassMixin(Date) {}

class Datetime extends DatetimeBase {
  private constructor(value: string) {
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

class DataObjectBase extends DataClassMixin(Object) {}

class DataObject extends DataObjectBase {
  private constructor(value: any) {
    super();
  }

  static fromObject(value: any): DataObject {
    if (!(value instanceof Object)) {
      throw new Error(`Expected an Object instance. Received ${value}`);
    }

    return new DataObject(value);
  }
}

// type ClassProperties<C> = {
//   [Key in keyof C as C[Key] extends Function ? never : Key]: C[Key]
// }

// Type, null/undefined, to_sql

abstract class OptionalBase<T> {
  protected _value: T | null | undefined;

  constructor(value: T | null | undefined) {
    this._value = value;
  }

  isPresent(): boolean {
    return this._value !== null && this._value !== undefined;
  }

  getOrElse(defaultValue: T): T {
    return this.isPresent() ? this._value as T : defaultValue;
  }

  unwrap(): T {
    if (!this.isPresent()) {
      throw new Error("Tried to unwrap a value that is null or undefined.");
    }
    return this._value as T;
  }
}

class Nullable<T> {
  private _value: T | null;

  constructor(value: T | null = null) {
    this._value = value;
  }

  get value(): T | null {
    return this._value;
  }

  set value(val: T | null) {
    this._value = val;
  }

  isNull(): boolean {
    return this._value === null;
  }

  unwrap(): T {
    if (this._value === null) {
      throw new Error("Nullable value is null");
    }
    return this._value;
  }
}

import "reflect-metadata";

const propertyTypes = new Map<string, any>();

function Sequelable(expectedType: Function) {
  return function (target: any, propertyKey: string): void {
    let value: any;

    Object.defineProperty(target, propertyKey, {
      get: () => value,
      set: (newValue: any) => {
        if (!(newValue instanceof expectedType)) {
          throw new Error(
            `Invalid assignment to '${propertyKey}'. Expected instance of ${expectedType.name}, received ${typeof newValue}`
          );
        }
        value = newValue;
      },
      enumerable: true,
      configurable: true,
    });
  };
}


class User {
  @Sequelable(String)
  reference!: String

  @Sequelable(String)
  name!: String;

  @Sequelable(Number)
  age!: Number;

  @Sequelable(Date)
  birthday!: Date;
  
  @Sequelable(Date)
  created_at?: Date;
}



export { Integer, Float, Stringy, JSONStringy, Datetime, Day, Time };
