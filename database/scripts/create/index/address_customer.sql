DROP INDEX IF EXISTS address_customer;

CREATE INDEX address_customer ON shop.address(customer);