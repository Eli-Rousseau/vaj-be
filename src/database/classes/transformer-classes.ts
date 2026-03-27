import "reflect-metadata";
import { Transform, Expose, Type, plainToInstance, instanceToPlain } from "class-transformer";

import * as transformers from "./transformers";
import { Default } from "./transformers";

export class TransformerClass {
  static fromPlain<T extends TransformerClass>(
    this: new (...args: any[]) => T,
    plain: unknown
  ): T {
    return plainToInstance(this, plain as object, { excludeExtraneousValues: true });
  }

  toPlain(): object {
    return instanceToPlain(this);
  }
}

export class ShopDiscountCoupon extends TransformerClass {
  @Default()
  @Expose()
  reference!: string | null;

  @Default()
  @Expose()
  sequentialId!: number | null;

  @Default()
  @Expose()
  code!: string | null;

  @Default()
  @Expose()
  description!: string | null;

  @Default()
  @Expose()
  discountType!: string | null;

  @Default()
  @Expose()
  discountValue!: number | null;

  @Default()
  @Expose()
  maxUses!: number | null;

  @Default()
  @Expose()
  minOrderValue!: number | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Default()
  @Expose()
  validFrom!: string | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Default()
  @Expose()
  validUntil!: string | null;

  @Default()
  @Expose()
  isAactive!: boolean | null;

  @Default()
  @Expose()
  userLimit!: number | null;

  @Default()
  @Expose()
  isStackable!: boolean | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Default()
  @Expose()
  createdAt!: string | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Default()
  @Expose()
  updatedAt!: string | null;
}

export class ShopUser extends TransformerClass {
  @Default()
  @Expose()
  reference!: string | null;

  @Default()
  @Expose()
  sequentialId!: number | null;

  @Default()
  @Expose()
  name!: string | null;

  @Default()
  @Expose()
  birthday!: string | null;

  @Default()
  @Expose()
  email!: string | null;

  @Default()
  @Expose()
  phoneNumber!: string | null;

  @Default()
  @Expose()
  password!: string | null;

  @Default()
  @Expose()
  salt!: string | null;

  @Default()
  @Expose()
  refreshtoken!: string | null;

  @Default()
  @Expose()
  systemAuthentication!: string | null;

  @Default()
  @Expose()
  systemRole!: string | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Default()
  @Expose()
  createdAt!: string | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Default()
  @Expose()
  updatedAt!: string | null;

  // @Type(() => ShopAddress)
  // @Expose()
  // @Default()
  // userBillingAddress!: ShopAddress | null;

  // @Type(() => ShopAddress)
  // @Expose()
  // @Default()
  // userBillingAddressArray!: ShopAddress[] | null;

  // @Type(() => ShopUserCompositeType)
  // @Expose()
  // @Default()
  // userGetCompositeType!: ShopUserCompositeType | null;

  // @Type(() => ShopUserCompositeType)
  // @Expose()
  // @Default()
  // userGetCompositeTypeArray!: ShopUserCompositeType[] | null;

  // @Expose()
  // @Default()
  // userReferenceType!: string | null;

  // @Expose()
  // @Default()
  // userReferenceTypeArray!: string[] | null;

  // @Type(() => ShopAddress)
  // @Expose()
  // @Default()
  // userShippingAddress!: ShopAddress | null;
}

export class ShopPaymentMethodEnum extends TransformerClass {
  @Default()
  @Expose()
  paymentMethod!: string | null;
}

export class ShopOrderStatusEnum extends TransformerClass {
  @Default()
  @Expose()
  orderStatus!: string | null;
}

export class ShopOrderTypeEnum extends TransformerClass {
  @Default()
  @Expose()
  orderType!: string | null;
}

export class ShopOrder extends TransformerClass {
  @Default()
  @Expose()
  reference!: string | null;

  @Default()
  @Expose()
  sequentialId!: number | null;

  @Type(() => ShopUser)
  @Default()
  @Expose()
  userByReference!: ShopUser | null;

  @Default()
  @Expose()
  user!: string | null;

  @Default()
  @Expose()
  totalPrice!: number | null;

  @Default()
  @Expose()
  paymentMethod!: string | null;

  @Default()
  @Expose()
  status!: string | null;

  @Default()
  @Expose()
  type!: string | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Default()
  @Expose()
  rentalStartDate!: string | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Default()
  @Expose()
  rentalEndDate!: string | null;

  @Type(() => ShopDiscountCoupon)
  @Default()
  @Expose()
  discountCouponByReference!: ShopDiscountCoupon | null;

  @Default()
  @Expose()
  discountCoupon!: string | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Default()
  @Expose()
  createdAt!: string | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Default()
  @Expose()
  updatedAt!: string | null;

  @Type(() => ShopUser)
  @Default()
  @Expose()
  ShopUsers!: ShopUser[] | null;

  @Type(() => ShopDiscountCoupon)
  @Default()
  @Expose()
  ShopDiscountCoupons!: ShopDiscountCoupon[] | null;
}

export class ShopArticle extends TransformerClass {
  @Default()
  @Expose()
  reference!: string | null;

  @Default()
  @Expose()
  sequentialId!: number | null;

  @Default()
  @Expose()
  title!: string | null;

  @Default()
  @Expose()
  description!: string | null;

  @Default()
  @Expose()
  brand!: string | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Default()
  @Expose()
  release!: string | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Default()
  @Expose()
  createdAt!: string | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Default()
  @Expose()
  updatedAt!: string | null;

  @Type(() => ShopArticleCategory)
  @Default()
  @Expose()
  categoryByReference!: ShopArticleCategory | null;

  @Default()
  @Expose()
  category!: string | null;

  @Default()
  @Expose()
  gender!: string | null;

  @Default()
  @Expose()
  size!: string | null;

  @Default()
  @Expose()
  color!: string | null;

  @Default()
  @Expose()
  material!: string | null;

  @Default()
  @Expose()
  condition!: string | null;

  @Default()
  @Expose()
  season!: string | null;

  @Default()
  @Expose()
  quantity!: number | null;

  @Default()
  @Expose()
  price!: number | null;

  @Default()
  @Expose()
  discount!: number | null;

  @Default()
  @Expose()
  availability!: string | null;

  @Default()
  @Expose()
  forSale!: boolean | null;

  @Default()
  @Expose()
  forRent!: boolean | null;

  @Default()
  @Expose()
  rentalPrice!: number | null;

  @Type(() => ShopArticleCategory)
  @Default()
  @Expose()
  ShopArticleCategorys!: ShopArticleCategory[] | null;
}

export class ShopOrderArticle extends TransformerClass {
  @Default()
  @Expose()
  reference!: string | null;

  @Default()
  @Expose()
  sequentialId!: number | null;

  @Type(() => ShopOrder)
  @Default()
  @Expose()
  orderByReference!: ShopOrder | null;

  @Default()
  @Expose()
  order!: string | null;

  @Type(() => ShopArticle)
  @Default()
  @Expose()
  articleByReference!: ShopArticle | null;

  @Default()
  @Expose()
  article!: string | null;

  @Default()
  @Expose()
  quantity!: number | null;

  @Default()
  @Expose()
  articlePrice!: number | null;

  @Default()
  @Expose()
  articleDiscount!: number | null;

  @Default()
  @Expose()
  checkoutPrice!: number | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Default()
  @Expose()
  createdAt!: string | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Default()
  @Expose()
  updatedAt!: string | null;

  @Type(() => ShopOrder)
  @Default()
  @Expose()
  ShopOrders!: ShopOrder[] | null;

  @Type(() => ShopArticle)
  @Default()
  @Expose()
  ShopArticles!: ShopArticle[] | null;
}

export class ShopArticleDiscountCoupon extends TransformerClass {
  @Default()
  @Expose()
  reference!: string | null;

  @Default()
  @Expose()
  sequentialId!: number | null;

  @Type(() => ShopArticle)
  @Default()
  @Expose()
  articleByReference!: ShopArticle | null;

  @Default()
  @Expose()
  article!: string | null;

  @Type(() => ShopDiscountCoupon)
  @Default()
  @Expose()
  discountCouponByReference!: ShopDiscountCoupon | null;

  @Default()
  @Expose()
  discountCoupon!: string | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Default()
  @Expose()
  createdAt!: string | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Default()
  @Expose()
  updatedAt!: string | null;

  @Type(() => ShopArticle)
  @Default()
  @Expose()
  ShopArticles!: ShopArticle[] | null;

  @Type(() => ShopDiscountCoupon)
  @Default()
  @Expose()
  ShopDiscountCoupons!: ShopDiscountCoupon[] | null;
}

export class ShopSystemAuthenticationEnum extends TransformerClass {
  @Default()
  @Expose()
  systemAuthentication!: string | null;
}

export class ShopAddress extends TransformerClass {
  @Default()
  @Expose()
  reference!: string | null;

  @Default()
  @Expose()
  sequentialId!: number | null;

  @Type(() => ShopUser)
  @Default()
  @Expose()
  userByReference!: ShopUser | null;

  @Default()
  @Expose()
  user!: string | null;

  @Default()
  @Expose()
  country!: string | null;

  @Default()
  @Expose()
  stateOrProvince!: string | null;

  @Default()
  @Expose()
  city!: string | null;

  @Default()
  @Expose()
  zipCode!: string | null;

  @Default()
  @Expose()
  street!: string | null;

  @Default()
  @Expose()
  streetNumber!: string | null;

  @Default()
  @Expose()
  box!: string | null;

  @Default()
  @Expose()
  shipping!: boolean | null;

  @Default()
  @Expose()
  billing!: boolean | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Default()
  @Expose()
  createdAt!: string | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Default()
  @Expose()
  updatedAt!: string | null;

  @Type(() => ShopUser)
  @Default()
  @Expose()
  ShopUsers!: ShopUser[] | null;
}

export class ShopUserCompositeType extends TransformerClass {
  @Default()
  @Expose()
  reference!: string | null;

  @Default()
  @Expose()
  country!: string | null;

  @Default()
  @Expose()
  city!: string | null;
}

export class ShopSystemRoleEnum extends TransformerClass {
  @Default()
  @Expose()
  systemRole!: string | null;
}

export class ShopFile extends TransformerClass {
  @Default()
  @Expose()
  reference!: string | null;

  @Default()
  @Expose()
  sequentialId!: number | null;

  @Default()
  @Expose()
  key!: string | null;

  @Default()
  @Expose()
  name!: string | null;

  @Default()
  @Expose()
  bucket!: string | null;

  @Default()
  @Expose()
  contentType!: string | null;

  @Default()
  @Expose()
  isPublic!: boolean | null;

  @Default()
  @Expose()
  publicUrl!: string | null;

  @Default()
  @Expose()
  id!: string | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Default()
  @Expose()
  createdAt!: string | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Default()
  @Expose()
  updatedAt!: string | null;
}

export class ShopArticleCategory extends TransformerClass {
  @Default()
  @Expose()
  reference!: string | null;

  @Default()
  @Expose()
  sequentialId!: number | null;

  @Default()
  @Expose()
  c1!: string | null;

  @Default()
  @Expose()
  c2!: string | null;

  @Default()
  @Expose()
  c3!: string | null;

  @Default()
  @Expose()
  c4!: string | null;

  @Default()
  @Expose()
  c5!: string | null;

  @Default()
  @Expose()
  c6!: string | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Default()
  @Expose()
  createdAt!: string | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Default()
  @Expose()
  updatedAt!: string | null;
}

export class ShopArticleBrandEnum extends TransformerClass {
  @Default()
  @Expose()
  articleBrand!: string | null;
}

export class ShopArticleGenderEnum extends TransformerClass {
  @Default()
  @Expose()
  articleGender!: string | null;
}

export class ShopArticleSizeEnum extends TransformerClass {
  @Default()
  @Expose()
  articleSize!: string | null;
}

export class ShopArticleColorEnum extends TransformerClass {
  @Default()
  @Expose()
  articleColor!: string | null;
}

export class ShopArticleMaterialEnum extends TransformerClass {
  @Default()
  @Expose()
  articleMaterial!: string | null;
}

export class ShopArticleConditionEnum extends TransformerClass {
  @Default()
  @Expose()
  articleCondition!: string | null;
}

export class ShopArticleSeasonEnum extends TransformerClass {
  @Default()
  @Expose()
  articleSeason!: string | null;
}

export class ShopArticleAvailabilityEnum extends TransformerClass {
  @Default()
  @Expose()
  articleAvailability!: string | null;
}

export class ShopFavorite extends TransformerClass {
  @Default()
  @Expose()
  reference!: string | null;

  @Default()
  @Expose()
  sequentialId!: number | null;

  @Type(() => ShopUser)
  @Default()
  @Expose()
  userByReference!: ShopUser | null;

  @Default()
  @Expose()
  user!: string | null;

  @Type(() => ShopArticle)
  @Default()
  @Expose()
  articleByReference!: ShopArticle | null;

  @Default()
  @Expose()
  article!: string | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Default()
  @Expose()
  createdAt!: string | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Default()
  @Expose()
  updatedAt!: string | null;

  @Type(() => ShopUser)
  @Default()
  @Expose()
  ShopUsers!: ShopUser[] | null;

  @Type(() => ShopArticle)
  @Default()
  @Expose()
  ShopArticles!: ShopArticle[] | null;
}

export class ShopSystemPermissionEnum extends TransformerClass {
  @Default()
  @Expose()
  systemPermission!: string | null;
}

export class ShopSystemRolePermission extends TransformerClass {
  @Default()
  @Expose()
  reference!: string | null;

  @Default()
  @Expose()
  sequentialId!: number | null;

  @Default()
  @Expose()
  systemRole!: string | null;

  @Default()
  @Expose()
  systemPermission!: string | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Default()
  @Expose()
  createdAt!: string | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Default()
  @Expose()
  updatedAt!: string | null;
}

export class ShopArticleImage extends TransformerClass {
  @Default()
  @Expose()
  reference!: string | null;

  @Default()
  @Expose()
  sequentialId!: number | null;

  @Type(() => ShopArticle)
  @Default()
  @Expose()
  articleByReference!: ShopArticle | null;

  @Default()
  @Expose()
  article!: string | null;

  @Type(() => ShopFile)
  @Default()
  @Expose()
  fileByReference!: ShopFile | null;

  @Default()
  @Expose()
  file!: string | null;

  @Default()
  @Expose()
  isCover!: boolean | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Default()
  @Expose()
  createdAt!: string | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Default()
  @Expose()
  updatedAt!: string | null;

  @Type(() => ShopArticle)
  @Default()
  @Expose()
  ShopArticles!: ShopArticle[] | null;

  @Type(() => ShopFile)
  @Default()
  @Expose()
  ShopFiles!: ShopFile[] | null;
}

