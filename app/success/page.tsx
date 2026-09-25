"use client";

import Link from "next/link";
import { Suspense, useEffect, useSyncExternalStore } from "react";
import { ReportView } from "@/components/report-view";
import { Shell } from "@/components/shell";
import { readPaymentSession, setStoredFullReport, type StoredFull } from "@/lib/report-store";
import type { VerificationReport } from "@/lib/schema";

type CheckState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "unlocked"; report: StoredFull }
  | { status: "locked"; message: string };

const idleState: CheckState = { status: "idle" };
let state: CheckState = idleState;
let activeCheckoutId = "";
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

function getServerSnapshot(): CheckState {
  return idleState;
}

function beginPaymentCheck(checkoutId: string) {
  if (checkoutId && activeCheckoutId === checkoutId) return;
  activeCheckoutId = checkoutId;
  if (!checkoutId) {
    state = {
      status: "locked",
      message: "Payment could not be verified. The full report stays locked.",
    };
    emit();
    return;
  }
  state = { status: "checking" };
  emit();
  const session = readPaymentSession();
  if (!session) {
    state = {
      status: "locked",
      message: "This payment could not be matched to a verification. Run the check again.",
    };
    emit();
    return;
  }
  void fetch("/api/verify-payment", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      checkoutId,
      unlockToken: session.unlockToken,
    }),
  })
    .then(async (response) => {
      const payload = (await response.json().catch(() => null)) as
        | { report?: VerificationReport; requestId?: string; verificationId?: string; truncated?: boolean; error?: string }
        | null;
      if (activeCheckoutId !== checkoutId) return;
      if (!response.ok || !payload?.report || !payload.requestId || !payload.verificationId) {
        state = { status: "locked", message: "Payment could not be verified. The full report stays locked." };
        emit();
        return;
      }
      const report: StoredFull = {
        access: "full",
        requestId: payload.requestId,
        verificationId: payload.verificationId,
        truncated: Boolean(payload.truncated),
        report: payload.report,
      };
      setStoredFullReport(report);
      state = { status: "unlocked", report };
      emit();
    })
    .catch(() => {
      if (activeCheckoutId !== checkoutId) return;
      state = { status: "locked", message: "Payment could not be verified. The full report stays locked." };
      emit();
    });
}

function SuccessCheck() {
  const current = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    const checkoutId = new URLSearchParams(window.location.search).get("checkout_id") ?? "";
    beginPaymentCheck(checkoutId);
  }, []);

  return (
    <Shell>
      {current.status === "unlocked" ? (
        <div className="space-y-8">
          <ReportView result={current.report} />
          <Link href="/" className="inline-block text-sm font-semibold text-[#9a3412]">
            Check another change
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight">
            {current.status === "locked" ? "Full report locked" : "Confirming payment"}
          </h1>
          <p className="text-sm leading-6 text-[#5c5348]">
            {current.status === "locked"
              ? current.message
              : "ChangeVerify is confirming this payment with Creem before showing the full report."}
          </p>
          <Link href="/" className="inline-block text-sm font-semibold text-[#9a3412]">
            Back to ChangeVerify
          </Link>
        </div>
      )}
    </Shell>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessCheck />
    </Suspense>
  );
}
