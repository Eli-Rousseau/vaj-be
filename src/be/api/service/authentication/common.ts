import crypto from "crypto";

export function generateGenericToken(): string {
  return crypto.randomBytes(64).toString("hex");
}

// export function encrypt(message: string, secret: string): string {
//   // 1. Derive a 32-byte key from the secret
//   const key = crypto.createHash("sha256").update(secret).digest();

//   // 2. Generate random IV (16 bytes for AES)
//   const iv = crypto.randomBytes(16);

//   // 3. Create cipher
//   const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

//   // 4. Encrypt
//   const encrypted = Buffer.concat([
//     cipher.update(message, "utf8"),
//     cipher.final(),
//   ]);

//   // 5. Return iv + encrypted (both needed for decryption)
//   return `${iv.toString("base64")}:${encrypted.toString("base64")}`;
// }

// export function decrypt(data: string, secret: string): string {
//   const [ivBase64, encryptedBase64] = data.split(":");

//   const key = crypto.createHash("sha256").update(secret).digest();
//   const iv = Buffer.from(ivBase64, "base64");
//   const encrypted = Buffer.from(encryptedBase64, "base64");

//   const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);

//   const decrypted = Buffer.concat([
//     decipher.update(encrypted),
//     decipher.final(),
//   ]);

//   return decrypted.toString("utf8");
// }
