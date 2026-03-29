import crypto from "crypto";
import { ShopUser } from "../database/classes/transformer-classes";
import { AuthenicationError } from "../api/error-classes";

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

export function generateJWTToken(user: ShopUser, secret: string, expirationInSeconds: number): string {
    const header = {
        alg: "HS256",
        typ: "JWT"
    };

    const encodedHeader = Buffer
        .from(JSON.stringify(header))
        .toString("base64url");

    const now = Math.floor(Date.now() / 1000);
    const payload = {
        reference: user.reference,
        sequentialId: user.sequentialId,
        email: user.email,
        systemRole: user.systemRole,
        systemAuthentication: user.systemAuthentication,
        iat: now,
        exp: now + expirationInSeconds
    } as Record<string, any>;

    const encodedPayload = Buffer
        .from(JSON.stringify(payload))
        .toString("base64url");

    const signature = crypto
        .createHmac("sha256", secret)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest("base64url");

    const token = `${encodedHeader}.${encodedPayload}.${signature}`;

    return token;
}

export function decodeJWTToken(token: string, secret: string) {
  const parts = token.split(".");

  if (parts.length !== 3) {
    throw new AuthenicationError("INVALID_REFRESH_TOKEN");
  }

  const [encodedHeader, encodedPayload, signature] = parts;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url");

  const isValid = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );

  if (!isValid) {
    throw new AuthenicationError("INCORRECT_REFRESH_TOKEN_SIGNATURE");
  }

  const payload = JSON.parse(
    Buffer.from(encodedPayload, "base64url").toString("utf-8")
  );

  if (payload.exp) {
    const now = Math.floor(Date.now() / 1000);
    if (now >= payload.exp) {
      throw new AuthenicationError("TOKEN_EXPIRED");
    }
  }

  const user = ShopUser.fromPlain({
    reference: payload.reference,
    sequentialId: payload.sequentialId,
    email: payload.email,
    systemRole: payload.systemRole,
    systemAuthentication: payload.systemAuthentication,
  });

  return user;
}