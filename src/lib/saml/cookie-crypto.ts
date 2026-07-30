import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

const AAD = Buffer.from("tqs-saml-cookie-v1");

function keyFrom(secret: string) {
  return createHash("sha256").update(secret).digest();
}

export function sealCookie(payload: object, secret: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", keyFrom(secret), iv);
  cipher.setAAD(AAD);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(payload), "utf8"),
    cipher.final(),
  ]);
  return [
    iv.toString("base64url"),
    encrypted.toString("base64url"),
    cipher.getAuthTag().toString("base64url"),
  ].join(".");
}

export function openCookie<T>(token: string | undefined, secret: string): T | null {
  if (!token) return null;
  try {
    const [ivPart, encryptedPart, tagPart, extra] = token.split(".");
    if (!ivPart || !encryptedPart || !tagPart || extra) return null;
    const decipher = createDecipheriv(
      "aes-256-gcm",
      keyFrom(secret),
      Buffer.from(ivPart, "base64url"),
    );
    decipher.setAAD(AAD);
    decipher.setAuthTag(Buffer.from(tagPart, "base64url"));
    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(encryptedPart, "base64url")),
      decipher.final(),
    ]);
    return JSON.parse(plaintext.toString("utf8")) as T;
  } catch {
    return null;
  }
}
