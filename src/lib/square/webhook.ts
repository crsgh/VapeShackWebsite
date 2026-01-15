import crypto from "crypto";
import { config } from "../config";

export function verifySquareSignature(params: {
  url: string;
  body: string;
  signature: string | null;
}) {
  if (!config.square.webhookSignatureKey) {
    throw new Error("SQUARE_WEBHOOK_SIGNATURE_KEY is not configured");
  }

  if (!params.signature) {
    return false;
  }

  const payload = params.url + params.body;

  const hmac = crypto.createHmac(
    "sha256",
    config.square.webhookSignatureKey
  );
  hmac.update(payload);
  const expected = hmac.digest("base64");

  return crypto.timingSafeEqual(
    Buffer.from(expected, "utf8"),
    Buffer.from(params.signature, "utf8")
  );
}

