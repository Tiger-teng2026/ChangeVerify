import { evaluateCheckout, logPaymentEvent, readCreemConfig, retrieveCreemCheckout, verifyPaymentBody } from "@/lib/payment";
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

  const parsed = verifyPaymentBody.safeParse(payload);
  if (!parsed.success) {
    logPaymentEvent({ requestId, verificationId: null, paymentStatus: "rejected", errorCode: "invalid_body" });
    return Response.json({ error: "Payment could not be verified." }, { status: 400 });
  }

  const sealed = openReportToken(parsed.data.unlockToken);
  if (!sealed) {
    logPaymentEvent({ requestId, verificationId: null, paymentStatus: "rejected", errorCode: "invalid_token" });
    return Response.json({ error: "This verification session has expired. Run the check again." }, { status: 400 });
  }

  const config = readCreemConfig();
  const retrieved = await retrieveCreemCheckout(parsed.data.checkoutId);
  if (!retrieved.ok || !config) {
    logPaymentEvent({
      requestId,
      verificationId: sealed.verificationId,
      paymentStatus: "lookup_failed",
      errorCode: retrieved.ok ? "missing_payment_config" : retrieved.errorCode,
    });
    return Response.json({ error: "Payment could not be verified." }, { status: 502 });
  }

  const decision = evaluateCheckout(retrieved.checkout, {
    checkoutId: parsed.data.checkoutId,
    verificationId: sealed.verificationId,
    reportHash: sealed.reportHash,
    productId: config.productId,
  });
  logPaymentEvent({
    requestId,
    verificationId: sealed.verificationId,
    paymentStatus: decision.paymentStatus,
    errorCode: decision.errorCode,
  });
  if (!decision.ok) {
    return Response.json({ error: "Payment could not be verified." }, { status: 402 });
  }

  return Response.json({
    requestId: sealed.requestId,
    verificationId: sealed.verificationId,
    truncated: sealed.truncated,
    report: sealed.report,
  });
}
