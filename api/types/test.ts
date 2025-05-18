interface PropertyMetaData {
  parseType: "string" | "number" | "boolean" | "date" | "any";
  SQLType: string;
  nullable: boolean;
  primary_key: boolean;
}

interface PropertiesMetaData {
  [propertyName: string]: PropertyMetaData;
}

type ParseTypes = {
  string: (value: unknown) => string;
  number: (value: unknown) => number;
  boolean: (value: unknown) => boolean;
  date: (value: unknown) => Date;
};

const parseTypeMap: ParseTypes = {
  string: (v) => {
    if (typeof v !== "string") throw new TypeError("Expected string");
    return v;
  },
  number: (v) => {
    if (typeof v !== "number") throw new TypeError("Expected number");
    return v;
  },
  boolean: (v) => {
    if (typeof v !== "boolean") throw new TypeError("Expected boolean");
    return v;
  },
  date: (v) => {
    const d = new Date(v as string | number);
    if (isNaN(d.getTime())) throw new TypeError("Invalid date");
    return d;
  },
};

class DataObject {
  private values: Record<string, any> = {};

  constructor(input: unknown, private metaData: PropertiesMetaData) {
    if (typeof input !== "object" || input === null) {
      throw new Error("Input must be a non-null object");
    }

    for (const [key, meta] of Object.entries(metaData)) {
      const value = (input as Record<string, any>)[key];

      if (value == null) {
        if (meta.nullable) {
          this.values[key] = null;
        } else {
          throw new Error(`Missing required field: ${key}`);
        }
      } else {
        try {
          const parsed = parseTypeMap[meta.parseType as keyof ParseTypes](value);
          this.values[key] = parsed;
        } catch (err) {
          throw new Error(`Field "${key}" error: ${(err as Error).message}`);
        }
      }
    }
  }

  toSQL(): { fields: string[]; values: any[] } {
    const fields: string[] = [];
    const values: any[] = [];

    for (const key of Object.keys(this.metaData)) {
      fields.push(key);
      const value = this.values[key];
      values.push(value instanceof Date ? value.toISOString() : value);
    }

    return { fields, values };
  }

  getData(): Record<string, any> {
    return this.values;
  }
}
