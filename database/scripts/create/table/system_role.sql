CREATE TABLE shop.system_role (
	reference TEXT PRIMARY KEY NOT NULL UNIQUE
);

INSERT INTO shop.system_role (reference)
VALUES ('SYSTEM DEVELOPER'), ('ADMINISTRATOR'), ('SUPERUSER'), ('USER');