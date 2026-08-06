import { describe, it, expect } from "vitest";
import { mergeFilterToWhereClause } from "../../src/graphql/query-constructors";

describe("test mergeFilterToWhereClause utility function", () => {
  it("without filters", () => {
    const filters = {};
    const where = { name: { eq: "Eli" } };

    const result = mergeFilterToWhereClause(filters, where);
    const expected = { name: { eq: "Eli" } };

    expect(result).toEqual(expected);
  });

  it("without where", () => {
    const filters = { name: { eq: "Eli" } };
    const where = {};

    const result = mergeFilterToWhereClause(filters, where);
    const expected = { name: { eq: "Eli" } };

    expect(result).toEqual(expected);
  });

  it("without where and filters", () => {
    const filters = {};
    const where = {};

    const result = mergeFilterToWhereClause(filters, where);
    const expected = {};

    expect(result).toEqual(expected);
  });

  it("with one matching field", () => {
    const filters = { age: { lt: 20 } };
    const where = { age: { gt: 10 } };

    const result = mergeFilterToWhereClause(filters, where);
    const expected = { age: { gt: 10, lt: 20 } };

    expect(result).toEqual(expected);
  });

  it("with no matching field", () => {
    const filters = { age: { lt: 20 } };
    const where = { name: { eq: "Eli" } };

    const result = mergeFilterToWhereClause(filters, where);
    const expected = { name: { eq: "Eli" }, age: { lt: 20 } };

    expect(result).toEqual(expected);
  });

  it("with one matching field on where with relational structure", () => {
    const filters = { age: { lt: 20 } };
    const where = { or: [{ name: { eq: "Eli" } }, { age: { gt: 10 } }] };

    const result = mergeFilterToWhereClause(filters, where);
    const expected = {
      or: [{ name: { eq: "Eli" } }, { age: { gt: 10, lt: 20 } }],
    };

    expect(result).toEqual(expected);
  });

  it("with one matching field on where and filter with relational structure", () => {
    const filters = {
      or: [{ age: { lt: 20 } }, { updatedAt: { gt: "2026-01-01" } }],
    };
    const where = { or: [{ name: { eq: "Eli" } }, { age: { gt: 10 } }] };

    const result = mergeFilterToWhereClause(filters, where);
    const expected = {
      or: [
        { name: { eq: "Eli" } },
        { age: { gt: 10, lt: 20 } },
        { updatedAt: { gt: "2026-01-01" } },
      ],
    };

    expect(result).toEqual(expected);
  });

  it("with one matching field on where and filter with spreaded relational structure", () => {
    const filters = {
      or: [{ age: { lt: 20 } }, { updatedAt: { gt: "2026-01-01" } }],
    };
    const where = {
      or: [{ not: [{ name: { eq: "Eli" } }] }, { age: { gt: 10 } }],
    };

    const result = mergeFilterToWhereClause(filters, where);
    const expected = {
      or: [
        { not: [{ name: { eq: "Eli" } }] },
        { age: { gt: 10, lt: 20 } },
        { updatedAt: { gt: "2026-01-01" } },
      ],
    };

    expect(result).toEqual(expected);
  });
});
