DROP TYPE IF EXISTS shop.table;
CREATE TYPE shop.table AS ENUM (
	'address', 
	'article', 
	'order', 
	'order_article', 
	'shipment_category', 
	'role_permission', 
	'user'
);