import { z } from "zod";

const UNLOCK_PRICE_CENTS = 499;

const paymentLogKeys = ["requestId", "verificationId", "paymentStatus", "errorCode", "timestamp"] as const;

type PaymentLogKey = (typeof paymentLogKeys)[number];

export function logPaymentEvent(
  event: Partial<Record<PaymentLogKey, string | null>>,
) {
  const safe: Partial<Record<PaymentLogKey, string | null>> = {};
  for (const key of paymentLogKeys) {
    if (key in event) safe[key] = event[key] ?? null;
  }
  if (!safe.timestamp) safe.timestamp = new Date().toISOString();
  console.log(JSON.stringify(safe));
}

export const createCheckoutBody = z
  .object({
    unlockToken: z.string().min(1).max(200_000),
  })
  .strict();

export const verifyPaymentBody = z
  .object({
    checkoutId: z.string().min(1).max(200),
    unlockToken: z.string().min(1).max(200_000),
  })
  .strict();

export type PaymentDecision = {
  ok: boolean;
  paymentStatus: string;
  errorCode: string | null;
};

type CreemConfig = {
  apiKey: string;
  productId: string;
  apiBase: string;
};

export function readCreemConfig(): CreemConfig | null {
  const apiKey = process.env.CREEM_API_KEY?.trim() ?? "";
  const productId = process.env.CREEM_PRODUCT_ID?.trim() ?? "";
  const apiBase = (process.env.CREEM_API_BASE?.trim() || "https://test-api.creem.io").replace(/\/$/, "");
  if (!apiKey || !productId) return null;
  return { apiKey, productId, apiBase };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function productIdOf(product: unknown): string | null {
  if (typeof product === "string") return product;
  const record = asRecord(product);
  return typeof record?.id === "string" ? record.id : null;
}

export function evaluateCheckout(
  checkout: unknown,
  expected: {
    checkoutId: string;
    verificationId: string;
    reportHash: string;
    productId: string;
  },
): PaymentDecision {
  const record = asRecord(checkout);
  if (!record || record.id !== expected.checkoutId) {
    return { ok: false, paymentStatus: "unknown", errorCode: "checkout_mismatch" };
  }

  const paymentStatus = typeof record.status === "string" ? record.status : "unknown";
  if (paymentStatus !== "completed") {
    return { ok: false, paymentStatus, errorCode: "payment_not_completed" };
  }

  const product = record.product;
  if (productIdOf(product) !== expected.productId) {
    return { ok: false, paymentStatus, errorCode: "product_mismatch" };
  }
  const productRecord = asRecord(product);
  if (productRecord?.billing_type && productRecord.billing_type !== "onetime") {
    return { ok: false, paymentStatus, errorCode: "product_mismatch" };
  }
  if (typeof productRecord?.price === "number" && productRecord.price !== UNLOCK_PRICE_CENTS) {
    return { ok: false, paymentStatus, errorCode: "price_mismatch" };
  }
  if (typeof productRecord?.currency === "string" && productRecord.currency !== "USD") {
    return { ok: false, paymentStatus, errorCode: "price_mismatch" };
  }

  const order = asRecord(record.order);
  if (order && order.status !== "paid") {
    return { ok: false, paymentStatus, errorCode: "payment_not_completed" };
  }

  const metadata = asRecord(record.metadata);
  if (
    metadata?.verificationId !== expected.verificationId ||
    metadata?.reportHash !== expected.reportHash
  ) {
    return { ok: false, paymentStatus, errorCode: "report_mismatch" };
  }

  return { ok: true, paymentStatus, errorCode: null };
}

export async function createCreemCheckout(
  input: {
    verificationId: string;
    reportHash: string;
    successUrl: string;
  },
  fetchImpl: typeof fetch = fetch,
): Promise<{ ok: true; checkoutUrl: string } | { ok: false; errorCode: string }> {
  const config = readCreemConfig();
  if (!config) return { ok: false, errorCode: "missing_payment_config" };
  const response = await fetchImpl(`${config.apiBase}/v1/checkouts`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": config.apiKey,
    },
    body: JSON.stringify({
      product_id: config.productId,
      request_id: `${input.verificationId}-${crypto.randomUUID()}`,
      success_url: input.successUrl,
      units: 1,
      metadata: {
        verificationId: input.verificationId,
        reportHash: input.reportHash,
      },
    }),
  });
  if (!response.ok) return { ok: false, errorCode: "checkout_failed" };
  const body = (await response.json()) as { checkout_url?: unknown };
  if (typeof body.checkout_url !== "string" || !body.checkout_url.startsWith("https://")) {
    return { ok: false, errorCode: "checkout_failed" };
  }
  return { ok: true, checkoutUrl: body.checkout_url };
}

export async function retrieveCreemCheckout(
  checkoutId: string,
  fetchImpl: typeof fetch = fetch,
): Promise<{ ok: true; checkout: unknown } | { ok: false; errorCode: string }> {
  const config = readCreemConfig();
  if (!config) return { ok: false, errorCode: "missing_payment_config" };
  const response = await fetchImpl(
    `${config.apiBase}/v1/checkouts?checkout_id=${encodeURIComponent(checkoutId)}`,
    {
      headers: { "x-api-key": config.apiKey },
    },
  );
  if (!response.ok) return { ok: false, errorCode: "checkout_lookup_failed" };
  return { ok: true, checkout: await response.json() };
}
