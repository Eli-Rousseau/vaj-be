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
  state_or_province!: string | null;

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
  availability!: string;

  @Expose()
  brand!: string;

  @Expose()
  color!: string | null;

  @Expose()
  condition!: string;

  @Transform(({ value }) => toDatetime(value, { isUndefinable: true }), { toClassOnly: true })
  @Transform(({ value }) => fromDatetime(value, { isUndefinable: true }), { toPlainOnly: true })
  @Expose()
  created_at?: string;

  @Expose()
  currency?: string;

  @Expose()
  depth!: number;

  @Expose()
  description!: string | null;

  @Expose()
  discount?: number;

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
  parent_category!: string;

  @Expose()
  price!: number;

  @Transform(({ value }) => toInteger(value, { isUndefinable: true }), { toClassOnly: true })
  @Transform(({ value }) => fromInteger(value, { isUndefinable: true }), { toPlainOnly: true })
  @Expose()
  quantity?: number;

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
  sub_category!: string;

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

export class ArticleParentCategory {
  @Expose()
  reference!: string;
}

export class ArticleSubCategory {
  @Expose()
  reference!: string;
}

export class Availability {
  @Expose()
  reference!: string;
}

export class Brand {
  @Expose()
  reference!: string;
}

export class Color {
  @Expose()
  reference!: string;
}

export class Condition {
  @Expose()
  reference!: string;
}

export class Currency {
  @Expose()
  reference!: string;
}

export class DiscountCoupon {
  @Expose()
  code!: string;

  @Transform(({ value }) => toDatetime(value, { isUndefinable: true }), { toClassOnly: true })
  @Transform(({ value }) => fromDatetime(value, { isUndefinable: true }), { toPlainOnly: true })
  @Expose()
  created_at?: string;

  @Expose()
  description!: string | null;

  @Expose()
  discount_type!: string;

  @Expose()
  discount_value!: number;

  @Expose()
  is_active?: boolean;

  @Expose()
  is_stackable?: boolean;

  @Transform(({ value }) => toInteger(value, { isUndefinable: true }), { toClassOnly: true })
  @Transform(({ value }) => fromInteger(value, { isUndefinable: true }), { toPlainOnly: true })
  @Expose()
  max_uses?: number;

  @Expose()
  min_order_value!: number | null;

  @Transform(({ value }) => toInteger(value, { isUndefinable: true }), { toClassOnly: true })
  @Transform(({ value }) => fromInteger(value, { isUndefinable: true }), { toPlainOnly: true })
  @Expose()
  reference?: number;

  @Transform(({ value }) => toDatetime(value, { isUndefinable: true }), { toClassOnly: true })
  @Transform(({ value }) => fromDatetime(value, { isUndefinable: true }), { toPlainOnly: true })
  @Expose()
  updated_at?: string;

  @Transform(({ value }) => toInteger(value, { isNullable: true }), { toClassOnly: true })
  @Transform(({ value }) => fromInteger(value, { isNullable: true }), { toPlainOnly: true })
  @Expose()
  user_limit!: number | null;

  @Transform(({ value }) => toInteger(value, { isUndefinable: true }), { toClassOnly: true })
  @Transform(({ value }) => fromInteger(value, { isUndefinable: true }), { toPlainOnly: true })
  @Expose()
  uses?: number;

  @Transform(({ value }) => toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => fromDatetime(value), { toPlainOnly: true })
  @Expose()
  valid_from!: string;

  @Transform(({ value }) => toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => fromDatetime(value), { toPlainOnly: true })
  @Expose()
  valid_until!: string;
}

export class Gender {
  @Expose()
  reference!: string;
}

export class Material {
  @Expose()
  reference!: string;
}

export class Order {
  @Transform(({ value }) => toDatetime(value, { isUndefinable: true }), { toClassOnly: true })
  @Transform(({ value }) => fromDatetime(value, { isUndefinable: true }), { toPlainOnly: true })
  @Expose()
  created_at?: string;

  @Expose()
  currency!: string;

  @Transform(({ value }) => toInteger(value, { isNullable: true }), { toClassOnly: true })
  @Transform(({ value }) => fromInteger(value, { isNullable: true }), { toPlainOnly: true })
  @Expose()
  discount_coupon!: number | null;

  @Expose()
  payment_method!: string;

  @Transform(({ value }) => toInteger(value, { isUndefinable: true }), { toClassOnly: true })
  @Transform(({ value }) => fromInteger(value, { isUndefinable: true }), { toPlainOnly: true })
  @Expose()
  reference?: number;

  @Transform(({ value }) => toDatetime(value, { isNullable: true }), { toClassOnly: true })
  @Transform(({ value }) => fromDatetime(value, { isNullable: true }), { toPlainOnly: true })
  @Expose()
  rental_end_date!: string | null;

  @Transform(({ value }) => toDatetime(value, { isNullable: true }), { toClassOnly: true })
  @Transform(({ value }) => fromDatetime(value, { isNullable: true }), { toPlainOnly: true })
  @Expose()
  rental_start_date!: string | null;

  @Expose()
  status!: string;

  @Expose()
  total_price!: number;

  @Expose()
  type!: string;

  @Transform(({ value }) => toDatetime(value, { isUndefinable: true }), { toClassOnly: true })
  @Transform(({ value }) => fromDatetime(value, { isUndefinable: true }), { toPlainOnly: true })
  @Expose()
  updated_at?: string;

  @Transform(({ value }) => toInteger(value), { toClassOnly: true })
  @Transform(({ value }) => fromInteger(value), { toPlainOnly: true })
  @Expose()
  user!: number;
}

export class OrderArticle {
  @Transform(({ value }) => toInteger(value), { toClassOnly: true })
  @Transform(({ value }) => fromInteger(value), { toPlainOnly: true })
  @Expose()
  article!: number;

  @Transform(({ value }) => toDatetime(value, { isUndefinable: true }), { toClassOnly: true })
  @Transform(({ value }) => fromDatetime(value, { isUndefinable: true }), { toPlainOnly: true })
  @Expose()
  created_at?: string;

  @Expose()
  discount_applied?: number;

  @Transform(({ value }) => toInteger(value), { toClassOnly: true })
  @Transform(({ value }) => fromInteger(value), { toPlainOnly: true })
  @Expose()
  order!: number;

  @Transform(({ value }) => toInteger(value, { isUndefinable: true }), { toClassOnly: true })
  @Transform(({ value }) => fromInteger(value, { isUndefinable: true }), { toPlainOnly: true })
  @Expose()
  quantity?: number;

  @Transform(({ value }) => toInteger(value, { isUndefinable: true }), { toClassOnly: true })
  @Transform(({ value }) => fromInteger(value, { isUndefinable: true }), { toPlainOnly: true })
  @Expose()
  reference?: number;

  @Expose()
  rental_price!: number | null;

  @Expose()
  sale_price!: number;

  @Transform(({ value }) => toDatetime(value, { isUndefinable: true }), { toClassOnly: true })
  @Transform(({ value }) => fromDatetime(value, { isUndefinable: true }), { toPlainOnly: true })
  @Expose()
  updated_at?: string;
}

export class OrderStatus {
  @Expose()
  reference!: string;
}

export class OrderType {
  @Expose()
  reference!: string;
}

export class PaymentMethod {
  @Expose()
  reference!: string;
}

export class Season {
  @Expose()
  reference!: string;
}

export class Size {
  @Expose()
  reference!: string;
}

export class SystemAuthentication {
  @Expose()
  reference!: string;
}

export class SystemPermission {
  @Expose()
  reference!: string;
}

export class SystemRole {
  @Expose()
  reference!: string;
}

export class SystemRolePermission {
  @Transform(({ value }) => toDatetime(value, { isUndefinable: true }), { toClassOnly: true })
  @Transform(({ value }) => fromDatetime(value, { isUndefinable: true }), { toPlainOnly: true })
  @Expose()
  created_at?: string;

  @Transform(({ value }) => toInteger(value, { isUndefinable: true }), { toClassOnly: true })
  @Transform(({ value }) => fromInteger(value, { isUndefinable: true }), { toPlainOnly: true })
  @Expose()
  reference?: number;

  @Expose()
  system_permission!: string;

  @Expose()
  system_role!: string;

  @Transform(({ value }) => toDatetime(value, { isUndefinable: true }), { toClassOnly: true })
  @Transform(({ value }) => fromDatetime(value, { isUndefinable: true }), { toPlainOnly: true })
  @Expose()
  updated_at?: string;
}

export class User {
  @Transform(({ value }) => toInteger(value, { isNullable: true }), { toClassOnly: true })
  @Transform(({ value }) => fromInteger(value, { isNullable: true }), { toPlainOnly: true })
  @Expose()
  billing_address!: number | null;

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
  salt!: string | null;

  @Transform(({ value }) => toInteger(value, { isNullable: true }), { toClassOnly: true })
  @Transform(({ value }) => fromInteger(value, { isNullable: true }), { toPlainOnly: true })
  @Expose()
  shipping_address!: number | null;

  @Expose()
  system_authentication!: string;

  @Expose()
  system_role!: string;

  @Transform(({ value }) => toDatetime(value, { isUndefinable: true }), { toClassOnly: true })
  @Transform(({ value }) => fromDatetime(value, { isUndefinable: true }), { toPlainOnly: true })
  @Expose()
  updated_at?: string;
}

