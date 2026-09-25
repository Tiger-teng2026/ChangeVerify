import { createCheckoutBody, createCreemCheckout, logPaymentEvent } from "@/lib/payment";
import { openReportToken } from "@/lib/report-token";

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    logPaymentEvent({ requestId, verificationId: null, paymentStatus: "rejected", errorCode: "invalid_json" });
    return Response.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const parsed = createCheckoutBody.safeParse(payload);
  if (!parsed.success) {
    logPaymentEvent({ requestId, verificationId: null, paymentStatus: "rejected", errorCode: "invalid_body" });
    return Response.json({ error: "Checkout request was not accepted." }, { status: 400 });
  }

  const sealed = openReportToken(parsed.data.unlockToken);
  if (!sealed) {
    logPaymentEvent({ requestId, verificationId: null, paymentStatus: "rejected", errorCode: "invalid_token" });
    return Response.json({ error: "This verification session has expired. Run the check again." }, { status: 400 });
  }

  const origin = (process.env.APP_ORIGIN?.trim() || new URL(request.url).origin).replace(/\/$/, "");
  const checkout = await createCreemCheckout({
    verificationId: sealed.verificationId,
    reportHash: sealed.reportHash,
    successUrl: `${origin}/success`,
  });
  if (!checkout.ok) {
    logPaymentEvent({
      requestId,
      verificationId: sealed.verificationId,
      paymentStatus: "checkout_failed",
      errorCode: checkout.errorCode,
    });
    return Response.json({ error: "Checkout could not be started. Please try again." }, { status: 502 });
  }

  logPaymentEvent({
    requestId,
    verificationId: sealed.verificationId,
    paymentStatus: "checkout_created",
    errorCode: null,
  });
  return Response.json({ checkoutUrl: checkout.checkoutUrl });
}
