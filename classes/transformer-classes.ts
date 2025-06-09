import { Transform, Expose } from "class-transformer";
import "reflect-metadata"

import { toInteger, fromInteger, toDay, fromDay, toTime, fromTime, toDatetime, fromDatetime, toJSON, fromJSON } from "../utils/class-transformers";

export class Address {
  @Expose()
  box!: string | null;

  @Expose()
  city!: string;

  @Expose()
  country!: string;

  @Transform(({ value }) => toDatetime(value, { isUndefinable: true }), { toClassOnly: true })
  @Transform(({ value }) => fromDatetime(value, { isUndefinable: true }), { toPlainOnly: true })
  @Expose()
  created_at?: string;

  @Transform(({ value }) => toInteger(value, { isUndefinable: true }), { toClassOnly: true })
  @Transform(({ value }) => fromInteger(value, { isUndefinable: true }), { toPlainOnly: true })
  @Expose()
  reference?: number;

  @Expose()
  street!: string;

  @Expose()
  street_number!: string;

  @Transform(({ value }) => toDatetime(value, { isUndefinable: true }), { toClassOnly: true })
  @Transform(({ value }) => fromDatetime(value, { isUndefinable: true }), { toPlainOnly: true })
  @Expose()
  updated_at?: string;

  @Transform(({ value }) => toInteger(value), { toClassOnly: true })
  @Transform(({ value }) => fromInteger(value), { toPlainOnly: true })
  @Expose()
  user!: number;

  @Expose()
  zip_code!: string;
}

export class Article {
  @Expose()
  brand!: string;

  @Transform(({ value }) => toInteger(value), { toClassOnly: true })
  @Transform(({ value }) => fromInteger(value), { toPlainOnly: true })
  @Expose()
  category!: number;

  @Expose()
  color!: string | null;

  @Expose()
  condition!: string;

  @Transform(({ value }) => toDatetime(value, { isUndefinable: true }), { toClassOnly: true })
  @Transform(({ value }) => fromDatetime(value, { isUndefinable: true }), { toPlainOnly: true })
  @Expose()
  created_at?: string;

  @Expose()
  currency!: string | null;

  @Expose()
  depth!: number;

  @Expose()
  description!: string | null;

  @Expose()
  discount!: number | null;

  @Expose()
  for_rent!: boolean;

  @Expose()
  for_sale!: boolean;

  @Expose()
  gender!: string | null;

  @Expose()
  height!: number;

  @Expose()
  material!: string | null;

  @Transform(({ value }) => toJSON(value, { isNullable: true }), { toClassOnly: true })
  @Transform(({ value }) => fromJSON(value, { isNullable: true }), { toPlainOnly: true })
  @Expose()
  media!: any | null;

  @Expose()
  price!: number;

  @Transform(({ value }) => toInteger(value, { isNullable: true }), { toClassOnly: true })
  @Transform(({ value }) => fromInteger(value, { isNullable: true }), { toPlainOnly: true })
  @Expose()
  quantity!: number | null;

  @Transform(({ value }) => toInteger(value, { isUndefinable: true }), { toClassOnly: true })
  @Transform(({ value }) => fromInteger(value, { isUndefinable: true }), { toPlainOnly: true })
  @Expose()
  reference?: number;

  @Transform(({ value }) => toDatetime(value, { isNullable: true }), { toClassOnly: true })
  @Transform(({ value }) => fromDatetime(value, { isNullable: true }), { toPlainOnly: true })
  @Expose()
  release!: string | null;

  @Expose()
  rental_price!: number | null;

  @Expose()
  season!: string | null;

  @Expose()
  size!: string;

  @Expose()
  status!: string;

  @Transform(({ value }) => toJSON(value, { isNullable: true }), { toClassOnly: true })
  @Transform(({ value }) => fromJSON(value, { isNullable: true }), { toPlainOnly: true })
  @Expose()
  thumbnail!: any | null;

  @Expose()
  title!: string;

  @Transform(({ value }) => toDatetime(value, { isUndefinable: true }), { toClassOnly: true })
  @Transform(({ value }) => fromDatetime(value, { isUndefinable: true }), { toPlainOnly: true })
  @Expose()
  updated_at?: string;

  @Expose()
  weight!: number;

  @Expose()
  width!: number;
}

export class Category {
  @Transform(({ value }) => toDatetime(value, { isUndefinable: true }), { toClassOnly: true })
  @Transform(({ value }) => fromDatetime(value, { isUndefinable: true }), { toPlainOnly: true })
  @Expose()
  created_at?: string;

  @Expose()
  parent!: string;

  @Transform(({ value }) => toInteger(value, { isUndefinable: true }), { toClassOnly: true })
  @Transform(({ value }) => fromInteger(value, { isUndefinable: true }), { toPlainOnly: true })
  @Expose()
  reference?: number;

  @Expose()
  sub!: string;

  @Transform(({ value }) => toDatetime(value, { isUndefinable: true }), { toClassOnly: true })
  @Transform(({ value }) => fromDatetime(value, { isUndefinable: true }), { toPlainOnly: true })
  @Expose()
  updated_at?: string;
}

export class User {
  @Expose()
  authentication!: string;

  @Transform(({ value }) => toInteger(value, { isNullable: true }), { toClassOnly: true })
  @Transform(({ value }) => fromInteger(value, { isNullable: true }), { toPlainOnly: true })
  @Expose()
  billing_address!: number | null;

  @Transform(({ value }) => toDay(value, { isNullable: true }), { toClassOnly: true })
  @Transform(({ value }) => fromDay(value, { isNullable: true }), { toPlainOnly: true })
  @Expose()
  birthday!: string | null;

  @Transform(({ value }) => toDatetime(value, { isUndefinable: true }), { toClassOnly: true })
  @Transform(({ value }) => fromDatetime(value, { isUndefinable: true }), { toPlainOnly: true })
  @Expose()
  created_at?: string;

  @Expose()
  email!: string;

  @Expose()
  name!: string;

  @Expose()
  password!: string | null;

  @Expose()
  phone_number!: string | null;

  @Transform(({ value }) => toInteger(value, { isUndefinable: true }), { toClassOnly: true })
  @Transform(({ value }) => fromInteger(value, { isUndefinable: true }), { toPlainOnly: true })
  @Expose()
  reference?: number;

  @Expose()
  role!: string;

  @Expose()
  salt!: string | null;

  @Transform(({ value }) => toInteger(value, { isNullable: true }), { toClassOnly: true })
  @Transform(({ value }) => fromInteger(value, { isNullable: true }), { toPlainOnly: true })
  @Expose()
  shipping_address!: number | null;

  @Transform(({ value }) => toDatetime(value, { isUndefinable: true }), { toClassOnly: true })
  @Transform(({ value }) => fromDatetime(value, { isUndefinable: true }), { toPlainOnly: true })
  @Expose()
  updated_at?: string;
}

