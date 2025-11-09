CREATE TABLE shop.system_authentication (
	reference TEXT PRIMARY KEY NOT NULL UNIQUE
);

INSERT INTO shop.system_authentication (reference)
VALUES ('INTERN'), ('GOOGLE'), ('APPLE');