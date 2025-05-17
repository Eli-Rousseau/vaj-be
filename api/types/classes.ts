class Address {
  reference: number | undefined;
  city: string;
  country: string;
  street: string;
  street_number: string;
  user: number;
  zip_code: string;
  box: string | null;
  created_at: Date | null;
  updated_at: Date | null;
  
  constructor(reference: number | undefined, city: string, country: string, street: string, street_number: string, user: number, zip_code: string, box: string | null, created_at: Date | null, updated_at: Date | null) {
    this.reference = reference;
    this.city = city;
    this.country = country;
    this.street = street;
    this.street_number = street_number;
    this.user = user;
    this.zip_code = zip_code;
    this.box = box;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}

class User {
  reference: number | undefined;
  authentication: string;
  email: string;
  name: string;
  role: string;
  billing_address: number | null;
  birthday: Date | null;
  created_at: Date | null;
  password: string | null;
  phone_number: string | null;
  salt: string | null;
  shipping_address: number | null;
  updated_at: Date | null;
  
  constructor(reference: number | undefined, authentication: string, email: string, name: string, role: string, billing_address: number | null, birthday: Date | null, created_at: Date | null, password: string | null, phone_number: string | null, salt: string | null, shipping_address: number | null, updated_at: Date | null) {
    this.reference = reference;
    this.authentication = authentication;
    this.email = email;
    this.name = name;
    this.role = role;
    this.billing_address = billing_address;
    this.birthday = birthday;
    this.created_at = created_at;
    this.password = password;
    this.phone_number = phone_number;
    this.salt = salt;
    this.shipping_address = shipping_address;
    this.updated_at = updated_at;
  }
}

export {
  Address, 
  User
};