export type ColumnInfo = {
    name: string;
    dataType: string;
    hasDefault: boolean;
    isNullable: boolean;
    isPrimaryKey: boolean;
    foreignKey: string | null;
    handleAutomaticUpdate: boolean;
};

export type ComputedFieldReturnType = "TABLE" | "REFERENCE" | "COMPOSITE";

type ComputedFieldCardinalityType = "SINGLE" | "ARRAY";

export type ComputedFieldInfo = {
    name: string;
    arg: { name: string, type: string };
    returnType: string;
    returnCardinality: ComputedFieldCardinalityType;
    returnTypeKind: ComputedFieldReturnType;
};

export type TableInfo = {
    name: string;
    isEnum: boolean;
    columns: ColumnInfo[];
    computedFields: ComputedFieldInfo[];
};

export type CompositeTypeColumnInfo = {
    name: string;
    dataType: string;
    hasDefault: boolean;
    isNullable: boolean;
};

export type CompositeTypeInfo = {
    name: string;
    columns: CompositeTypeColumnInfo[];
}

export type SchemaInfo = {
    name: string;
    tables: TableInfo[];
    compsiteTypes: CompositeTypeInfo[];
};

export type DataBaseInfo = {
    schemas: SchemaInfo[];
}