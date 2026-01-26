import { Transform, Expose, Type, plainToInstance, instanceToPlain } from "class-transformer";

import * as transformers from "./transformers";

abstract class TransformerClass {
  static fromPlain<T extends TransformerClass>(
    this: new (...args: any[]) => T,
    plain: unknown
  ): T {
    return plainToInstance(this, plain as object);
  }

  toPlain(): object {
    return instanceToPlain(this);
  }
}
export class ShopSystemPermissionEnum extends TransformerClass {
  @Expose()
  systemPermission!: string;
}

export class ShopUser extends TransformerClass {
  @Expose()
  reference!: string;

  @Expose()
  name!: string;

  @Expose()
  birthday?: string | null = null;

  @Expose()
  email!: string;

  @Expose()
  phoneNumber?: string | null = null;

  @Expose()
  password?: string | null = null;

  @Expose()
  salt?: string | null = null;

  @Expose()
  systemAuthentication?: string | null = null;

  @Expose()
  systemRole?: string | null = null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Expose()
  createdAt!: string;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Expose()
  updatedAt!: string;

  @Type(() => ShopAddress)
  userBillingAddress?: ShopAddress | null = null;

  @Type(() => ShopAddress)
  userBillingAddressArray?: ShopAddress[] | null = null;

  @Type(() => ShopUserCompositeType)
  userGetCompositeType?: ShopUserCompositeType | null = null;

  @Type(() => ShopUserCompositeType)
  userGetCompositeTypeArray?: ShopUserCompositeType[] | null = null;


  userReferenceType?: string | null = null;


  userReferenceTypeArray?: string[] | null = null;

  @Type(() => ShopAddress)
  userShippingAddress?: ShopAddress | null = null;
}

export class ShopCurrencyEnum extends TransformerClass {
  @Expose()
  currency!: string;
}

export class ShopPaymentMethodEnum extends TransformerClass {
  @Expose()
  paymentMethod!: string;
}

export class ShopOrderStatusEnum extends TransformerClass {
  @Expose()
  orderStatus!: string;
}

export class ShopOrderTypeEnum extends TransformerClass {
  @Expose()
  orderType!: string;
}

export class ShopDiscountCoupon extends TransformerClass {
  @Expose()
  reference!: string;

  @Expose()
  code!: string;

  @Expose()
  description?: string | null = null;

  @Expose()
  discountType!: string;

  @Expose()
  discountValue!: number;

  @Expose()
  maxUses?: number | null = null;

  @Expose()
  minOrderValue?: number | null = null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Expose()
  validFrom!: string;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Expose()
  validUntil!: string;

  @Expose()
  isAactive!: boolean;

  @Expose()
  userLimit?: number | null = null;

  @Expose()
  isStackable!: boolean;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Expose()
  createdAt!: string;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Expose()
  updatedAt!: string;
}

export class ShopOrder extends TransformerClass {
  @Expose()
  reference!: string;

  @Type(() => ShopUser)
  @Expose()
  userByReference?: ShopUser | null = null;

  @Expose()
  user!: string;

  @Expose()
  totalPrice!: number;

  @Expose()
  currency?: string | null = null;

  @Expose()
  paymentMethod?: string | null = null;

  @Expose()
  status?: string | null = null;

  @Expose()
  type?: string | null = null;

  @Transform(({ value }) => transformers.toDatetime(value, { isNullable: true }), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value, { isNullable: true }), { toPlainOnly: true })
  @Expose()
  rentalStartDate?: string | null = null;

  @Transform(({ value }) => transformers.toDatetime(value, { isNullable: true }), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value, { isNullable: true }), { toPlainOnly: true })
  @Expose()
  rentalEndDate?: string | null = null;

  @Type(() => ShopDiscountCoupon)
  @Expose()
  discountCouponByReference?: ShopDiscountCoupon | null = null;

  @Expose()
  discountCoupon!: string;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Expose()
  createdAt!: string;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Expose()
  updatedAt!: string;

  @Type(() => ShopUser)
  @Expose()
  ShopUsers?: ShopUser[] | null = null;

  @Type(() => ShopDiscountCoupon)
  @Expose()
  ShopDiscountCoupons?: ShopDiscountCoupon[] | null = null;
}

export class ShopArticle extends TransformerClass {
  @Expose()
  reference!: string;

  @Expose()
  title!: string;

  @Expose()
  description?: string | null = null;

  @Expose()
  brand?: string | null = null;

  @Transform(({ value }) => transformers.toDatetime(value, { isNullable: true }), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value, { isNullable: true }), { toPlainOnly: true })
  @Expose()
  release?: string | null = null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Expose()
  createdAt!: string;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Expose()
  updatedAt!: string;

  @Expose()
  parentCategory?: string | null = null;

  @Expose()
  subCategory?: string | null = null;

  @Expose()
  gender?: string | null = null;

  @Expose()
  size?: string | null = null;

  @Expose()
  color?: string | null = null;

  @Expose()
  material?: string | null = null;

  @Expose()
  condition?: string | null = null;

  @Expose()
  season?: string | null = null;

  @Expose()
  quantity!: number;

  @Expose()
  price!: number;

  @Expose()
  currency?: string | null = null;

  @Expose()
  discount!: number;

  @Expose()
  availability?: string | null = null;

  @Expose()
  forSale!: boolean;

  @Expose()
  forRent!: boolean;

  @Expose()
  rentalPrice?: number | null = null;
}

export class ShopOrderArticle extends TransformerClass {
  @Expose()
  reference!: string;

  @Type(() => ShopOrder)
  @Expose()
  orderByReference?: ShopOrder | null = null;

  @Expose()
  order!: string;

  @Type(() => ShopArticle)
  @Expose()
  articleByReference?: ShopArticle | null = null;

  @Expose()
  article!: string;

  @Expose()
  quantity!: number;

  @Expose()
  articlePrice!: number;

  @Expose()
  articleDiscount?: number | null = null;

  @Expose()
  checkoutPrice?: number | null = null;

  @Expose()
  currency?: string | null = null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Expose()
  createdAt!: string;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Expose()
  updatedAt!: string;

  @Type(() => ShopOrder)
  @Expose()
  ShopOrders?: ShopOrder[] | null = null;

  @Type(() => ShopArticle)
  @Expose()
  ShopArticles?: ShopArticle[] | null = null;
}

export class ShopArticleDiscountCoupon extends TransformerClass {
  @Expose()
  reference!: string;

  @Type(() => ShopArticle)
  @Expose()
  articleByReference?: ShopArticle | null = null;

  @Expose()
  article!: string;

  @Type(() => ShopDiscountCoupon)
  @Expose()
  discountCouponByReference?: ShopDiscountCoupon | null = null;

  @Expose()
  discountCoupon!: string;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Expose()
  createdAt!: string;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Expose()
  updatedAt!: string;

  @Type(() => ShopArticle)
  @Expose()
  ShopArticles?: ShopArticle[] | null = null;

  @Type(() => ShopDiscountCoupon)
  @Expose()
  ShopDiscountCoupons?: ShopDiscountCoupon[] | null = null;
}

export class ShopSystemAuthenticationEnum extends TransformerClass {
  @Expose()
  systemAuthentication!: string;
}

export class ShopAddress extends TransformerClass {
  @Expose()
  reference!: string;

  @Type(() => ShopUser)
  @Expose()
  userByReference?: ShopUser | null = null;

  @Expose()
  user!: string;

  @Expose()
  country!: string;

  @Expose()
  stateOrProvince?: string | null = null;

  @Expose()
  city!: string;

  @Expose()
  zipCode!: string;

  @Expose()
  street!: string;

  @Expose()
  streetNumber!: string;

  @Expose()
  box?: string | null = null;

  @Expose()
  shipping?: boolean | null = null;

  @Expose()
  billing?: boolean | null = null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Expose()
  createdAt!: string;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Expose()
  updatedAt!: string;

  @Type(() => ShopUser)
  @Expose()
  ShopUsers?: ShopUser[] | null = null;
}

export class ShopUserCompositeType extends TransformerClass {
  @Expose()
  reference?: string | null = null;

  @Expose()
  country?: string | null = null;

  @Expose()
  city?: string | null = null;
}

export class ShopSystemRoleEnum extends TransformerClass {
  @Expose()
  systemRole!: string;
}

export class ShopArticleBrandEnum extends TransformerClass {
  @Expose()
  articleBrand!: string;
}

export class ShopFavorite extends TransformerClass {
  @Expose()
  reference!: string;

  @Type(() => ShopUser)
  @Expose()
  userByReference?: ShopUser | null = null;

  @Expose()
  user!: string;

  @Type(() => ShopArticle)
  @Expose()
  articleByReference?: ShopArticle | null = null;

  @Expose()
  article!: string;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Expose()
  createdAt!: string;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Expose()
  updatedAt!: string;

  @Type(() => ShopUser)
  @Expose()
  ShopUsers?: ShopUser[] | null = null;

  @Type(() => ShopArticle)
  @Expose()
  ShopArticles?: ShopArticle[] | null = null;
}

export class ShopArticleParentCategoryEnum extends TransformerClass {
  @Expose()
  articleParentCategory!: string;
}

export class ShopArticleSubCategoryEnum extends TransformerClass {
  @Expose()
  articleSubCategory!: string;
}

export class ShopArticleGenderEnum extends TransformerClass {
  @Expose()
  articleGender!: string;
}

export class ShopArticleSizeEnum extends TransformerClass {
  @Expose()
  articleSize!: string;
}

export class ShopArticleColorEnum extends TransformerClass {
  @Expose()
  articleColor!: string;
}

export class ShopArticleMaterialEnum extends TransformerClass {
  @Expose()
  articleMaterial!: string;
}

export class ShopArticleConditionEnum extends TransformerClass {
  @Expose()
  articleCondition!: string;
}

export class ShopArticleSeasonEnum extends TransformerClass {
  @Expose()
  articleSeason!: string;
}

export class ShopArticleAvailabilityEnum extends TransformerClass {
  @Expose()
  articleAvailability!: string;
}

export class ShopSystemRolePermission extends TransformerClass {
  @Expose()
  reference!: string;

  @Expose()
  systemRole?: string | null = null;

  @Expose()
  systemPermission?: string | null = null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Expose()
  createdAt!: string;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Expose()
  updatedAt!: string;
}

export class ShopFile extends TransformerClass {
  @Expose()
  reference!: string;

  @Expose()
  key!: string;

  @Expose()
  name!: string;

  @Expose()
  bucket!: string;

  @Expose()
  contentType!: string;

  @Expose()
  isPublic?: boolean | null = null;

  @Expose()
  publicUrl?: string | null = null;

  @Expose()
  id!: string;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Expose()
  createdAt!: string;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Expose()
  updatedAt!: string;
}

export class ShopArticleImage extends TransformerClass {
  @Expose()
  reference!: string;

  @Type(() => ShopArticle)
  @Expose()
  articleByReference!: ShopArticle;

  @Expose()
  article!: string;

  @Type(() => ShopFile)
  @Expose()
  fileByReference!: ShopFile;

  @Expose()
  file!: string;

  @Expose()
  isCover!: boolean;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Expose()
  createdAt!: string;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Expose()
  updatedAt!: string;

  @Type(() => ShopArticle)
  @Expose()
  ShopArticles?: ShopArticle[] | null = null;

  @Type(() => ShopFile)
  @Expose()
  ShopFiles?: ShopFile[] | null = null;
}

