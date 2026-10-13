/** Matches the one-time unlock price shown to users ($4.99). */
const REPORT_UNLOCK_VALUE_USD = 4.99;
const REPORT_UNLOCK_CURRENCY = "USD";

type Gtag = {
  (command: "event", eventName: string, params?: Record<string, unknown>): void;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

const reportedPurchases = new Set<string>();

export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  try {
    if (typeof window === "undefined") return;
    const send = window.gtag;
    if (typeof send === "function") {
      if (params) send("event", eventName, params);
      else send("event", eventName);
      return;
    }
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(params ? ["event", eventName, params] : ["event", eventName]);
  } catch {
    // Analytics must not block verification or checkout.
  }
}

export function trackPurchase(transactionId: string) {
  const id = transactionId.trim();
  if (!id || reportedPurchases.has(id)) return;

  const storageKey = `changeverify.ga.purchase.${id}`;
  try {
    if (sessionStorage.getItem(storageKey) === "1") {
      reportedPurchases.add(id);
      return;
    }
    sessionStorage.setItem(storageKey, "1");
  } catch {
    // Private mode can block sessionStorage. The in-memory set still dedupes this page.
  }

  reportedPurchases.add(id);
  trackEvent("purchase", {
    transaction_id: id,
    value: REPORT_UNLOCK_VALUE_USD,
    currency: REPORT_UNLOCK_CURRENCY,
  });
}

export function trackCheckoutStart() {
  trackEvent("checkout_start", {
    value: REPORT_UNLOCK_VALUE_USD,
    currency: REPORT_UNLOCK_CURRENCY,
  });
}
