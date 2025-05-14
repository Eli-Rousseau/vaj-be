type Address = {
  reference: number;
  user: number;
  created_at?: Date;
  updated_at?: Date;
  zip_code: string;
  street: string;
  street_number: string;
  box?: string;
  country: string;
  city: string;
}

type User = {
  updated_at?: Date;
  billing_address?: number;
  authentication: string;
  role: string;
  created_at?: Date;
  reference: number;
  birthday?: Date;
  shipping_address?: number;
  name: string;
  salt?: string;
  email: string;
  phone_number?: string;
  password?: string;
}

export {
  Address, 
  User
};