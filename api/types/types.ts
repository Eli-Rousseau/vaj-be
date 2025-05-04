/**
 * 1. Rewrite all the table creation scripts.
 * 2. Delete the address table and include the address on the customer and order tables.
 * 3. Leave the types as they are, don't convert them into tables.
 * 4. Write a script that can extract the table definitions.
 * 
 SELECT
  c.column_name,
  c.data_type,
  c.character_maximum_length,
  c.is_nullable,
  c.column_default,
  tc.constraint_type,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM
  information_schema.columns AS c
LEFT JOIN information_schema.key_column_usage AS kcu
  ON c.table_name = kcu.table_name
  AND c.column_name = kcu.column_name
LEFT JOIN information_schema.table_constraints AS tc
  ON kcu.constraint_name = tc.constraint_name
  AND tc.constraint_type = 'FOREIGN KEY'
LEFT JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE
  c.table_name = 'user'
  AND c.table_schema = 'shop';
 */

// Declare and export the database enum types
export type AuthType = "INTERN" | "GOOGLE" | "APPLE";
export type RoleType =
  | "SYSTEM DEVELOPER"
  | "ADMINISTRATOR"
  | "SUPERUSER"
  | "USER";

// Declare and export the database table types
export type Address = {
  reference: number;
  user: number | User;
  country: string;
  city: string;
  zip_code: string;
  street: string;
  street_number: string;
  box: string | null;
  created_at: string; // ISO timestamp string
  updated_at: string; // ISO timestamp string
};

export type User = {
  reference: number;
  name: string;
  birthday: string | null; // ISO date string (e.g., "1990-01-01")
  email: string;
  phone_number: string | null;
  shipping_address: number | Address | null;
  billing_address: number | Address | null;
  password: string | null;
  salt: string | null;
  authentication: AuthType;
  role: RoleType;
  created_at: string; // ISO timestamp string
  updated_at: string; // ISO timestamp string
};
