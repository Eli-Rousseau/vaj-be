"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.SystemRolePermission = exports.SystemRole = exports.SystemPermission = exports.SystemAuthentication = exports.Size = exports.Season = exports.PaymentMethod = exports.OrderType = exports.OrderStatus = exports.OrderArticle = exports.Order = exports.Material = exports.Gender = exports.DiscountCoupon = exports.Currency = exports.Condition = exports.Color = exports.Brand = exports.Availability = exports.ArticleSubCategory = exports.ArticleParentCategory = exports.Article = exports.Address = void 0;
const class_transformer_1 = require("class-transformer");
require("reflect-metadata");
const class_transformers_1 = require("../utils/class-transformers");
class Address {
}
exports.Address = Address;
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], Address.prototype, "box", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], Address.prototype, "city", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], Address.prototype, "country", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.toDatetime)(value, { isUndefinable: true }), { toClassOnly: true }),
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.fromDatetime)(value, { isUndefinable: true }), { toPlainOnly: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], Address.prototype, "created_at", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.toInteger)(value, { isUndefinable: true }), { toClassOnly: true }),
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.fromInteger)(value, { isUndefinable: true }), { toPlainOnly: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], Address.prototype, "reference", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], Address.prototype, "state_or_province", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], Address.prototype, "street", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], Address.prototype, "street_number", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.toDatetime)(value, { isUndefinable: true }), { toClassOnly: true }),
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.fromDatetime)(value, { isUndefinable: true }), { toPlainOnly: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], Address.prototype, "updated_at", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.toInteger)(value), { toClassOnly: true }),
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.fromInteger)(value), { toPlainOnly: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], Address.prototype, "user", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], Address.prototype, "zip_code", void 0);
class Article {
}
exports.Article = Article;
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], Article.prototype, "availability", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], Article.prototype, "brand", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], Article.prototype, "color", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], Article.prototype, "condition", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.toDatetime)(value, { isUndefinable: true }), { toClassOnly: true }),
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.fromDatetime)(value, { isUndefinable: true }), { toPlainOnly: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], Article.prototype, "created_at", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], Article.prototype, "currency", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], Article.prototype, "depth", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], Article.prototype, "description", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], Article.prototype, "discount", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean)
], Article.prototype, "for_rent", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean)
], Article.prototype, "for_sale", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], Article.prototype, "gender", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], Article.prototype, "height", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], Article.prototype, "material", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.toJSON)(value, { isNullable: true }), { toClassOnly: true }),
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.fromJSON)(value, { isNullable: true }), { toPlainOnly: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], Article.prototype, "media", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], Article.prototype, "parent_category", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], Article.prototype, "price", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.toInteger)(value, { isUndefinable: true }), { toClassOnly: true }),
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.fromInteger)(value, { isUndefinable: true }), { toPlainOnly: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], Article.prototype, "quantity", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.toInteger)(value, { isUndefinable: true }), { toClassOnly: true }),
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.fromInteger)(value, { isUndefinable: true }), { toPlainOnly: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], Article.prototype, "reference", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.toDatetime)(value, { isNullable: true }), { toClassOnly: true }),
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.fromDatetime)(value, { isNullable: true }), { toPlainOnly: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], Article.prototype, "release", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], Article.prototype, "rental_price", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], Article.prototype, "season", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], Article.prototype, "size", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], Article.prototype, "sub_category", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.toJSON)(value, { isNullable: true }), { toClassOnly: true }),
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.fromJSON)(value, { isNullable: true }), { toPlainOnly: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], Article.prototype, "thumbnail", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], Article.prototype, "title", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.toDatetime)(value, { isUndefinable: true }), { toClassOnly: true }),
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.fromDatetime)(value, { isUndefinable: true }), { toPlainOnly: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], Article.prototype, "updated_at", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], Article.prototype, "weight", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], Article.prototype, "width", void 0);
class ArticleParentCategory {
}
exports.ArticleParentCategory = ArticleParentCategory;
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], ArticleParentCategory.prototype, "reference", void 0);
class ArticleSubCategory {
}
exports.ArticleSubCategory = ArticleSubCategory;
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], ArticleSubCategory.prototype, "reference", void 0);
class Availability {
}
exports.Availability = Availability;
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], Availability.prototype, "reference", void 0);
class Brand {
}
exports.Brand = Brand;
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], Brand.prototype, "reference", void 0);
class Color {
}
exports.Color = Color;
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], Color.prototype, "reference", void 0);
class Condition {
}
exports.Condition = Condition;
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], Condition.prototype, "reference", void 0);
class Currency {
}
exports.Currency = Currency;
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], Currency.prototype, "reference", void 0);
class DiscountCoupon {
}
exports.DiscountCoupon = DiscountCoupon;
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], DiscountCoupon.prototype, "code", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.toDatetime)(value, { isUndefinable: true }), { toClassOnly: true }),
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.fromDatetime)(value, { isUndefinable: true }), { toPlainOnly: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], DiscountCoupon.prototype, "created_at", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], DiscountCoupon.prototype, "description", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], DiscountCoupon.prototype, "discount_type", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], DiscountCoupon.prototype, "discount_value", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean)
], DiscountCoupon.prototype, "is_active", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean)
], DiscountCoupon.prototype, "is_stackable", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.toInteger)(value, { isUndefinable: true }), { toClassOnly: true }),
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.fromInteger)(value, { isUndefinable: true }), { toPlainOnly: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], DiscountCoupon.prototype, "max_uses", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], DiscountCoupon.prototype, "min_order_value", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.toInteger)(value, { isUndefinable: true }), { toClassOnly: true }),
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.fromInteger)(value, { isUndefinable: true }), { toPlainOnly: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], DiscountCoupon.prototype, "reference", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.toDatetime)(value, { isUndefinable: true }), { toClassOnly: true }),
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.fromDatetime)(value, { isUndefinable: true }), { toPlainOnly: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], DiscountCoupon.prototype, "updated_at", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.toInteger)(value, { isNullable: true }), { toClassOnly: true }),
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.fromInteger)(value, { isNullable: true }), { toPlainOnly: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], DiscountCoupon.prototype, "user_limit", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.toInteger)(value, { isUndefinable: true }), { toClassOnly: true }),
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.fromInteger)(value, { isUndefinable: true }), { toPlainOnly: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], DiscountCoupon.prototype, "uses", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.toDatetime)(value), { toClassOnly: true }),
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.fromDatetime)(value), { toPlainOnly: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], DiscountCoupon.prototype, "valid_from", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.toDatetime)(value), { toClassOnly: true }),
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.fromDatetime)(value), { toPlainOnly: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], DiscountCoupon.prototype, "valid_until", void 0);
class Gender {
}
exports.Gender = Gender;
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], Gender.prototype, "reference", void 0);
class Material {
}
exports.Material = Material;
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], Material.prototype, "reference", void 0);
class Order {
}
exports.Order = Order;
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.toDatetime)(value, { isUndefinable: true }), { toClassOnly: true }),
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.fromDatetime)(value, { isUndefinable: true }), { toPlainOnly: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], Order.prototype, "created_at", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], Order.prototype, "currency", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.toInteger)(value, { isNullable: true }), { toClassOnly: true }),
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.fromInteger)(value, { isNullable: true }), { toPlainOnly: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], Order.prototype, "discount_coupon", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], Order.prototype, "payment_method", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.toInteger)(value, { isUndefinable: true }), { toClassOnly: true }),
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.fromInteger)(value, { isUndefinable: true }), { toPlainOnly: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], Order.prototype, "reference", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.toDatetime)(value, { isNullable: true }), { toClassOnly: true }),
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.fromDatetime)(value, { isNullable: true }), { toPlainOnly: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], Order.prototype, "rental_end_date", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.toDatetime)(value, { isNullable: true }), { toClassOnly: true }),
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.fromDatetime)(value, { isNullable: true }), { toPlainOnly: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], Order.prototype, "rental_start_date", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], Order.prototype, "status", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], Order.prototype, "total_price", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], Order.prototype, "type", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.toDatetime)(value, { isUndefinable: true }), { toClassOnly: true }),
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.fromDatetime)(value, { isUndefinable: true }), { toPlainOnly: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], Order.prototype, "updated_at", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.toInteger)(value), { toClassOnly: true }),
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.fromInteger)(value), { toPlainOnly: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], Order.prototype, "user", void 0);
class OrderArticle {
}
exports.OrderArticle = OrderArticle;
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.toInteger)(value), { toClassOnly: true }),
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.fromInteger)(value), { toPlainOnly: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], OrderArticle.prototype, "article", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.toDatetime)(value, { isUndefinable: true }), { toClassOnly: true }),
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.fromDatetime)(value, { isUndefinable: true }), { toPlainOnly: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], OrderArticle.prototype, "created_at", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], OrderArticle.prototype, "discount_applied", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.toInteger)(value), { toClassOnly: true }),
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.fromInteger)(value), { toPlainOnly: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], OrderArticle.prototype, "order", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.toInteger)(value, { isUndefinable: true }), { toClassOnly: true }),
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.fromInteger)(value, { isUndefinable: true }), { toPlainOnly: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], OrderArticle.prototype, "quantity", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.toInteger)(value, { isUndefinable: true }), { toClassOnly: true }),
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.fromInteger)(value, { isUndefinable: true }), { toPlainOnly: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], OrderArticle.prototype, "reference", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], OrderArticle.prototype, "rental_price", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], OrderArticle.prototype, "sale_price", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.toDatetime)(value, { isUndefinable: true }), { toClassOnly: true }),
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.fromDatetime)(value, { isUndefinable: true }), { toPlainOnly: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], OrderArticle.prototype, "updated_at", void 0);
class OrderStatus {
}
exports.OrderStatus = OrderStatus;
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], OrderStatus.prototype, "reference", void 0);
class OrderType {
}
exports.OrderType = OrderType;
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], OrderType.prototype, "reference", void 0);
class PaymentMethod {
}
exports.PaymentMethod = PaymentMethod;
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], PaymentMethod.prototype, "reference", void 0);
class Season {
}
exports.Season = Season;
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], Season.prototype, "reference", void 0);
class Size {
}
exports.Size = Size;
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], Size.prototype, "reference", void 0);
class SystemAuthentication {
}
exports.SystemAuthentication = SystemAuthentication;
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], SystemAuthentication.prototype, "reference", void 0);
class SystemPermission {
}
exports.SystemPermission = SystemPermission;
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], SystemPermission.prototype, "reference", void 0);
class SystemRole {
}
exports.SystemRole = SystemRole;
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], SystemRole.prototype, "reference", void 0);
class SystemRolePermission {
}
exports.SystemRolePermission = SystemRolePermission;
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.toDatetime)(value, { isUndefinable: true }), { toClassOnly: true }),
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.fromDatetime)(value, { isUndefinable: true }), { toPlainOnly: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], SystemRolePermission.prototype, "created_at", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.toInteger)(value, { isUndefinable: true }), { toClassOnly: true }),
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.fromInteger)(value, { isUndefinable: true }), { toPlainOnly: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], SystemRolePermission.prototype, "reference", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], SystemRolePermission.prototype, "system_permission", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], SystemRolePermission.prototype, "system_role", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.toDatetime)(value, { isUndefinable: true }), { toClassOnly: true }),
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.fromDatetime)(value, { isUndefinable: true }), { toPlainOnly: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], SystemRolePermission.prototype, "updated_at", void 0);
class User {
}
exports.User = User;
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.toInteger)(value, { isNullable: true }), { toClassOnly: true }),
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.fromInteger)(value, { isNullable: true }), { toPlainOnly: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], User.prototype, "billing_address", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], User.prototype, "birthday", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.toDatetime)(value, { isUndefinable: true }), { toClassOnly: true }),
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.fromDatetime)(value, { isUndefinable: true }), { toPlainOnly: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], User.prototype, "created_at", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], User.prototype, "password", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], User.prototype, "phone_number", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.toInteger)(value, { isUndefinable: true }), { toClassOnly: true }),
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.fromInteger)(value, { isUndefinable: true }), { toPlainOnly: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], User.prototype, "reference", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], User.prototype, "salt", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.toInteger)(value, { isNullable: true }), { toClassOnly: true }),
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.fromInteger)(value, { isNullable: true }), { toPlainOnly: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], User.prototype, "shipping_address", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], User.prototype, "system_authentication", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], User.prototype, "system_role", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.toDatetime)(value, { isUndefinable: true }), { toClassOnly: true }),
    (0, class_transformer_1.Transform)(({ value }) => (0, class_transformers_1.fromDatetime)(value, { isUndefinable: true }), { toPlainOnly: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], User.prototype, "updated_at", void 0);
//# sourceMappingURL=transformer-classes.js.map