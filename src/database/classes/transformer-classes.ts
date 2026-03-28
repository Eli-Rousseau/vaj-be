import "reflect-metadata";
import { Transform, Expose, Type } from "class-transformer";

import * as transformers from "./transformers";
import { TransformerClass, Default, Annotate } from "./transformers";

export class ShopDiscountCoupon extends TransformerClass {
  @Annotate("Mutable")
  @Default()
  @Expose()
  reference!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  sequentialId!: number | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  code!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  description!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  discountType!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  discountValue!: number | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  maxUses!: number | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  minOrderValue!: number | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Annotate("Mutable")
  @Default()
  @Expose()
  validFrom!: string | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Annotate("Mutable")
  @Default()
  @Expose()
  validUntil!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  isAactive!: boolean | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  userLimit!: number | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  isStackable!: boolean | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Annotate("Mutable")
  @Default()
  @Expose()
  createdAt!: string | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Annotate("Mutable")
  @Default()
  @Expose()
  updatedAt!: string | null;
}

export class ShopUser extends TransformerClass {
  @Annotate("Mutable")
  @Default()
  @Expose()
  reference!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  sequentialId!: number | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  name!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  birthday!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  email!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  phoneNumber!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  password!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  salt!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  refreshToken!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  systemAuthentication!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  systemRole!: string | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Annotate("Mutable")
  @Default()
  @Expose()
  createdAt!: string | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Annotate("Mutable")
  @Default()
  @Expose()
  updatedAt!: string | null;

  @Type(() => ShopAddress)
  @Default()
  @Expose()
  userBillingAddress!: ShopAddress | null;

  @Type(() => ShopAddress)
  @Default()
  @Expose()
  userBillingAddressArray!: ShopAddress[] | null;

  @Type(() => ShopUserCompositeType)
  @Default()
  @Expose()
  userGetCompositeType!: ShopUserCompositeType | null;

  @Type(() => ShopUserCompositeType)
  @Default()
  @Expose()
  userGetCompositeTypeArray!: ShopUserCompositeType[] | null;

  @Default()
  @Expose()
  userReferenceType!: string | null;

  @Default()
  @Expose()
  userReferenceTypeArray!: string[] | null;

  @Type(() => ShopAddress)
  @Default()
  @Expose()
  userShippingAddress!: ShopAddress | null;
}

export class ShopPaymentMethodEnum extends TransformerClass {
  @Annotate("Mutable")
  @Default()
  @Expose()
  paymentMethod!: string | null;
}

export class ShopOrderStatusEnum extends TransformerClass {
  @Annotate("Mutable")
  @Default()
  @Expose()
  orderStatus!: string | null;
}

export class ShopOrderTypeEnum extends TransformerClass {
  @Annotate("Mutable")
  @Default()
  @Expose()
  orderType!: string | null;
}

export class ShopOrder extends TransformerClass {
  @Annotate("Mutable")
  @Default()
  @Expose()
  reference!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  sequentialId!: number | null;

  @Type(() => ShopUser)
  @Annotate("Mutable")
  @Default()
  @Expose()
  userByReference!: ShopUser | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  user!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  totalPrice!: number | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  paymentMethod!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  status!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  type!: string | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Annotate("Mutable")
  @Default()
  @Expose()
  rentalStartDate!: string | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Annotate("Mutable")
  @Default()
  @Expose()
  rentalEndDate!: string | null;

  @Type(() => ShopDiscountCoupon)
  @Annotate("Mutable")
  @Default()
  @Expose()
  discountCouponByReference!: ShopDiscountCoupon | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  discountCoupon!: string | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Annotate("Mutable")
  @Default()
  @Expose()
  createdAt!: string | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Annotate("Mutable")
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
  @Annotate("Mutable")
  @Default()
  @Expose()
  reference!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  sequentialId!: number | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  title!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  description!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  brand!: string | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Annotate("Mutable")
  @Default()
  @Expose()
  release!: string | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Annotate("Mutable")
  @Default()
  @Expose()
  createdAt!: string | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Annotate("Mutable")
  @Default()
  @Expose()
  updatedAt!: string | null;

  @Type(() => ShopArticleCategory)
  @Annotate("Mutable")
  @Default()
  @Expose()
  categoryByReference!: ShopArticleCategory | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  category!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  gender!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  size!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  color!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  material!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  condition!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  season!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  quantity!: number | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  price!: number | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  discount!: number | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  availability!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  forSale!: boolean | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  forRent!: boolean | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  rentalPrice!: number | null;

  @Type(() => ShopArticleCategory)
  @Default()
  @Expose()
  ShopArticleCategorys!: ShopArticleCategory[] | null;
}

export class ShopOrderArticle extends TransformerClass {
  @Annotate("Mutable")
  @Default()
  @Expose()
  reference!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  sequentialId!: number | null;

  @Type(() => ShopOrder)
  @Annotate("Mutable")
  @Default()
  @Expose()
  orderByReference!: ShopOrder | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  order!: string | null;

  @Type(() => ShopArticle)
  @Annotate("Mutable")
  @Default()
  @Expose()
  articleByReference!: ShopArticle | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  article!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  quantity!: number | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  articlePrice!: number | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  articleDiscount!: number | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  checkoutPrice!: number | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Annotate("Mutable")
  @Default()
  @Expose()
  createdAt!: string | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Annotate("Mutable")
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
  @Annotate("Mutable")
  @Default()
  @Expose()
  reference!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  sequentialId!: number | null;

  @Type(() => ShopArticle)
  @Annotate("Mutable")
  @Default()
  @Expose()
  articleByReference!: ShopArticle | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  article!: string | null;

  @Type(() => ShopDiscountCoupon)
  @Annotate("Mutable")
  @Default()
  @Expose()
  discountCouponByReference!: ShopDiscountCoupon | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  discountCoupon!: string | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Annotate("Mutable")
  @Default()
  @Expose()
  createdAt!: string | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Annotate("Mutable")
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
  @Annotate("Mutable")
  @Default()
  @Expose()
  systemAuthentication!: string | null;
}

export class ShopAddress extends TransformerClass {
  @Annotate("Mutable")
  @Default()
  @Expose()
  reference!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  sequentialId!: number | null;

  @Type(() => ShopUser)
  @Annotate("Mutable")
  @Default()
  @Expose()
  userByReference!: ShopUser | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  user!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  country!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  stateOrProvince!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  city!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  zipCode!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  street!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  streetNumber!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  box!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  shipping!: boolean | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  billing!: boolean | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Annotate("Mutable")
  @Default()
  @Expose()
  createdAt!: string | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Annotate("Mutable")
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
  @Annotate("Mutable")
  @Default()
  @Expose()
  systemRole!: string | null;
}

export class ShopFile extends TransformerClass {
  @Annotate("Mutable")
  @Default()
  @Expose()
  reference!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  sequentialId!: number | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  key!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  name!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  bucket!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  contentType!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  isPublic!: boolean | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  publicUrl!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  id!: string | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Annotate("Mutable")
  @Default()
  @Expose()
  createdAt!: string | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Annotate("Mutable")
  @Default()
  @Expose()
  updatedAt!: string | null;
}

export class ShopArticleCategory extends TransformerClass {
  @Annotate("Mutable")
  @Default()
  @Expose()
  reference!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  sequentialId!: number | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  c1!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  c2!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  c3!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  c4!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  c5!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  c6!: string | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Annotate("Mutable")
  @Default()
  @Expose()
  createdAt!: string | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Annotate("Mutable")
  @Default()
  @Expose()
  updatedAt!: string | null;
}

export class ShopArticleBrandEnum extends TransformerClass {
  @Annotate("Mutable")
  @Default()
  @Expose()
  articleBrand!: string | null;
}

export class ShopArticleGenderEnum extends TransformerClass {
  @Annotate("Mutable")
  @Default()
  @Expose()
  articleGender!: string | null;
}

export class ShopArticleSizeEnum extends TransformerClass {
  @Annotate("Mutable")
  @Default()
  @Expose()
  articleSize!: string | null;
}

export class ShopArticleColorEnum extends TransformerClass {
  @Annotate("Mutable")
  @Default()
  @Expose()
  articleColor!: string | null;
}

export class ShopArticleMaterialEnum extends TransformerClass {
  @Annotate("Mutable")
  @Default()
  @Expose()
  articleMaterial!: string | null;
}

export class ShopArticleConditionEnum extends TransformerClass {
  @Annotate("Mutable")
  @Default()
  @Expose()
  articleCondition!: string | null;
}

export class ShopArticleSeasonEnum extends TransformerClass {
  @Annotate("Mutable")
  @Default()
  @Expose()
  articleSeason!: string | null;
}

export class ShopArticleAvailabilityEnum extends TransformerClass {
  @Annotate("Mutable")
  @Default()
  @Expose()
  articleAvailability!: string | null;
}

export class ShopFavorite extends TransformerClass {
  @Annotate("Mutable")
  @Default()
  @Expose()
  reference!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  sequentialId!: number | null;

  @Type(() => ShopUser)
  @Annotate("Mutable")
  @Default()
  @Expose()
  userByReference!: ShopUser | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  user!: string | null;

  @Type(() => ShopArticle)
  @Annotate("Mutable")
  @Default()
  @Expose()
  articleByReference!: ShopArticle | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  article!: string | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Annotate("Mutable")
  @Default()
  @Expose()
  createdAt!: string | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Annotate("Mutable")
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
  @Annotate("Mutable")
  @Default()
  @Expose()
  systemPermission!: string | null;
}

export class ShopSystemRolePermission extends TransformerClass {
  @Annotate("Mutable")
  @Default()
  @Expose()
  reference!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  sequentialId!: number | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  systemRole!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  systemPermission!: string | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Annotate("Mutable")
  @Default()
  @Expose()
  createdAt!: string | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Annotate("Mutable")
  @Default()
  @Expose()
  updatedAt!: string | null;
}

export class ShopArticleImage extends TransformerClass {
  @Annotate("Mutable")
  @Default()
  @Expose()
  reference!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  sequentialId!: number | null;

  @Type(() => ShopArticle)
  @Annotate("Mutable")
  @Default()
  @Expose()
  articleByReference!: ShopArticle | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  article!: string | null;

  @Type(() => ShopFile)
  @Annotate("Mutable")
  @Default()
  @Expose()
  fileByReference!: ShopFile | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  file!: string | null;

  @Annotate("Mutable")
  @Default()
  @Expose()
  isCover!: boolean | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Annotate("Mutable")
  @Default()
  @Expose()
  createdAt!: string | null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Annotate("Mutable")
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

