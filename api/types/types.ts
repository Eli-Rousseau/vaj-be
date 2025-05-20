type Address = {
  reference?: number | undefined;
  city: string;
  country: string;
  street: string;
  street_number: string;
  user: number;
  zip_code: string;
  box?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

type User = {
  reference?: number | undefined;
  authentication: string;
  email: string;
  name: string;
  role: string;
  billing_address?: number | null;
  birthday?: string | null;
  password?: string | null;
  phone_number?: string | null;
  salt?: string | null;
  shipping_address?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export {
  Address, 
  User
};