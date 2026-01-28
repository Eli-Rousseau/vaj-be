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
  systemPermission: string | null = null;
}

export class ShopUser extends TransformerClass {
  @Expose()
  reference: string | null = null;

  @Expose()
  name: string | null = null;

  @Expose()
  birthday?: string | null = null;

  @Expose()
  email: string | null = null;

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
  createdAt: string | null = null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Expose()
  updatedAt: string | null = null;

  @Type(() => ShopAddress)
  @Expose()
  userBillingAddress?: ShopAddress | null = null;

  @Type(() => ShopAddress)
  @Expose()
  userBillingAddressArray?: ShopAddress[] | null = null;

  @Type(() => ShopUserCompositeType)
  @Expose()
  userGetCompositeType?: ShopUserCompositeType | null = null;

  @Type(() => ShopUserCompositeType)
  @Expose()
  userGetCompositeTypeArray?: ShopUserCompositeType[] | null = null;

  @Expose()
  userReferenceType?: string | null = null;

  @Expose()
  userReferenceTypeArray?: string[] | null = null;

  @Type(() => ShopAddress)
  @Expose()
  userShippingAddress?: ShopAddress | null = null;
}

export class ShopCurrencyEnum extends TransformerClass {
  @Expose()
  currency: string | null = null;
}

export class ShopPaymentMethodEnum extends TransformerClass {
  @Expose()
  paymentMethod: string | null = null;
}

export class ShopOrderStatusEnum extends TransformerClass {
  @Expose()
  orderStatus: string | null = null;
}

export class ShopOrderTypeEnum extends TransformerClass {
  @Expose()
  orderType: string | null = null;
}

export class ShopDiscountCoupon extends TransformerClass {
  @Expose()
  reference: string | null = null;

  @Expose()
  code: string | null = null;

  @Expose()
  description?: string | null = null;

  @Expose()
  discountType: string | null = null;

  @Expose()
  discountValue: number | null = null;

  @Expose()
  maxUses?: number | null = null;

  @Expose()
  minOrderValue?: number | null = null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Expose()
  validFrom: string | null = null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Expose()
  validUntil: string | null = null;

  @Expose()
  isAactive: boolean | null = null;

  @Expose()
  userLimit?: number | null = null;

  @Expose()
  isStackable: boolean | null = null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Expose()
  createdAt: string | null = null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Expose()
  updatedAt: string | null = null;
}

export class ShopOrder extends TransformerClass {
  @Expose()
  reference: string | null = null;

  @Type(() => ShopUser)
  @Expose()
  userByReference?: ShopUser | null = null;

  @Expose()
  user: string | null = null;

  @Expose()
  totalPrice: number | null = null;

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
  discountCoupon: string | null = null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Expose()
  createdAt: string | null = null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Expose()
  updatedAt: string | null = null;

  @Type(() => ShopUser)
  @Expose()
  ShopUsers?: ShopUser[] | null = null;

  @Type(() => ShopDiscountCoupon)
  @Expose()
  ShopDiscountCoupons?: ShopDiscountCoupon[] | null = null;
}

export class ShopArticle extends TransformerClass {
  @Expose()
  reference: string | null = null;

  @Expose()
  title: string | null = null;

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
  createdAt: string | null = null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Expose()
  updatedAt: string | null = null;

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
  quantity: number | null = null;

  @Expose()
  price: number | null = null;

  @Expose()
  currency?: string | null = null;

  @Expose()
  discount: number | null = null;

  @Expose()
  availability?: string | null = null;

  @Expose()
  forSale: boolean | null = null;

  @Expose()
  forRent: boolean | null = null;

  @Expose()
  rentalPrice?: number | null = null;
}

export class ShopOrderArticle extends TransformerClass {
  @Expose()
  reference: string | null = null;

  @Type(() => ShopOrder)
  @Expose()
  orderByReference?: ShopOrder | null = null;

  @Expose()
  order: string | null = null;

  @Type(() => ShopArticle)
  @Expose()
  articleByReference?: ShopArticle | null = null;

  @Expose()
  article: string | null = null;

  @Expose()
  quantity: number | null = null;

  @Expose()
  articlePrice: number | null = null;

  @Expose()
  articleDiscount?: number | null = null;

  @Expose()
  checkoutPrice?: number | null = null;

  @Expose()
  currency?: string | null = null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Expose()
  createdAt: string | null = null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Expose()
  updatedAt: string | null = null;

  @Type(() => ShopOrder)
  @Expose()
  ShopOrders?: ShopOrder[] | null = null;

  @Type(() => ShopArticle)
  @Expose()
  ShopArticles?: ShopArticle[] | null = null;
}

export class ShopArticleDiscountCoupon extends TransformerClass {
  @Expose()
  reference: string | null = null;

  @Type(() => ShopArticle)
  @Expose()
  articleByReference?: ShopArticle | null = null;

  @Expose()
  article: string | null = null;

  @Type(() => ShopDiscountCoupon)
  @Expose()
  discountCouponByReference?: ShopDiscountCoupon | null = null;

  @Expose()
  discountCoupon: string | null = null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Expose()
  createdAt: string | null = null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Expose()
  updatedAt: string | null = null;

  @Type(() => ShopArticle)
  @Expose()
  ShopArticles?: ShopArticle[] | null = null;

  @Type(() => ShopDiscountCoupon)
  @Expose()
  ShopDiscountCoupons?: ShopDiscountCoupon[] | null = null;
}

export class ShopSystemAuthenticationEnum extends TransformerClass {
  @Expose()
  systemAuthentication: string | null = null;
}

export class ShopAddress extends TransformerClass {
  @Expose()
  reference: string | null = null;

  @Type(() => ShopUser)
  @Expose()
  userByReference?: ShopUser | null = null;

  @Expose()
  user: string | null = null;

  @Expose()
  country: string | null = null;

  @Expose()
  stateOrProvince?: string | null = null;

  @Expose()
  city: string | null = null;

  @Expose()
  zipCode: string | null = null;

  @Expose()
  street: string | null = null;

  @Expose()
  streetNumber: string | null = null;

  @Expose()
  box?: string | null = null;

  @Expose()
  shipping?: boolean | null = null;

  @Expose()
  billing?: boolean | null = null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Expose()
  createdAt: string | null = null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Expose()
  updatedAt: string | null = null;

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
  systemRole: string | null = null;
}

export class ShopArticleBrandEnum extends TransformerClass {
  @Expose()
  articleBrand: string | null = null;
}

export class ShopFavorite extends TransformerClass {
  @Expose()
  reference: string | null = null;

  @Type(() => ShopUser)
  @Expose()
  userByReference?: ShopUser | null = null;

  @Expose()
  user: string | null = null;

  @Type(() => ShopArticle)
  @Expose()
  articleByReference?: ShopArticle | null = null;

  @Expose()
  article: string | null = null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Expose()
  createdAt: string | null = null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Expose()
  updatedAt: string | null = null;

  @Type(() => ShopUser)
  @Expose()
  ShopUsers?: ShopUser[] | null = null;

  @Type(() => ShopArticle)
  @Expose()
  ShopArticles?: ShopArticle[] | null = null;
}

export class ShopArticleParentCategoryEnum extends TransformerClass {
  @Expose()
  articleParentCategory: string | null = null;
}

export class ShopArticleSubCategoryEnum extends TransformerClass {
  @Expose()
  articleSubCategory: string | null = null;
}

export class ShopArticleGenderEnum extends TransformerClass {
  @Expose()
  articleGender: string | null = null;
}

export class ShopArticleSizeEnum extends TransformerClass {
  @Expose()
  articleSize: string | null = null;
}

export class ShopArticleColorEnum extends TransformerClass {
  @Expose()
  articleColor: string | null = null;
}

export class ShopArticleMaterialEnum extends TransformerClass {
  @Expose()
  articleMaterial: string | null = null;
}

export class ShopArticleConditionEnum extends TransformerClass {
  @Expose()
  articleCondition: string | null = null;
}

export class ShopArticleSeasonEnum extends TransformerClass {
  @Expose()
  articleSeason: string | null = null;
}

export class ShopArticleAvailabilityEnum extends TransformerClass {
  @Expose()
  articleAvailability: string | null = null;
}

export class ShopSystemRolePermission extends TransformerClass {
  @Expose()
  reference: string | null = null;

  @Expose()
  systemRole?: string | null = null;

  @Expose()
  systemPermission?: string | null = null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Expose()
  createdAt: string | null = null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Expose()
  updatedAt: string | null = null;
}

export class ShopFile extends TransformerClass {
  @Expose()
  reference: string | null = null;

  @Expose()
  key: string | null = null;

  @Expose()
  name: string | null = null;

  @Expose()
  bucket: string | null = null;

  @Expose()
  contentType: string | null = null;

  @Expose()
  isPublic?: boolean | null = null;

  @Expose()
  publicUrl?: string | null = null;

  @Expose()
  id: string | null = null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Expose()
  createdAt: string | null = null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Expose()
  updatedAt: string | null = null;
}

export class ShopArticleImage extends TransformerClass {
  @Expose()
  reference: string | null = null;

  @Type(() => ShopArticle)
  @Expose()
  articleByReference: ShopArticle | null = null;

  @Expose()
  article: string | null = null;

  @Type(() => ShopFile)
  @Expose()
  fileByReference: ShopFile | null = null;

  @Expose()
  file: string | null = null;

  @Expose()
  isCover: boolean | null = null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Expose()
  createdAt: string | null = null;

  @Transform(({ value }) => transformers.toDatetime(value), { toClassOnly: true })
  @Transform(({ value }) => transformers.fromDatetime(value), { toPlainOnly: true })
  @Expose()
  updatedAt: string | null = null;

  @Type(() => ShopArticle)
  @Expose()
  ShopArticles?: ShopArticle[] | null = null;

  @Type(() => ShopFile)
  @Expose()
  ShopFiles?: ShopFile[] | null = null;
}

