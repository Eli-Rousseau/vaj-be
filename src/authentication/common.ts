import crypto from "crypto";

export function generateGenericToken(): string {
  return crypto.randomBytes(35).toString("hex");
}

export function generateJWTToken(payload: any, secret: string, expirationInSeconds: number): string {
    const header = {
        alg: "HS256",
        typ: "JWT"
    };

    const encodedHeader = Buffer
        .from(JSON.stringify(header))
        .toString("base64url");

    const now = Math.floor(Date.now() / 1000);
    payload["iat"] = now;
    payload["exp"] = now + expirationInSeconds;

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