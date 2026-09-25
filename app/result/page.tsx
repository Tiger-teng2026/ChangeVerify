"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { ReportView } from "@/components/report-view";
import { Shell } from "@/components/shell";
import { clearStoredReport, getStoredReport } from "@/lib/report-store";

function subscribe() {
  return () => {};
}

export default function ResultPage() {
  const result = useSyncExternalStore(subscribe, getStoredReport, () => null);
  const [unlockPending, setUnlockPending] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);

  async function onUnlock() {
    if (!result || result.access !== "preview" || unlockPending) return;
    setUnlockPending(true);
    setUnlockError(null);
    try {
      const response = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ unlockToken: result.unlockToken }),
      });
      const payload = (await response.json().catch(() => null)) as { checkoutUrl?: string; error?: string } | null;
      if (!response.ok || !payload?.checkoutUrl) {
        setUnlockError(payload?.error || "Checkout could not be started. Please try again.");
        setUnlockPending(false);
        return;
      }
      window.location.assign(payload.checkoutUrl);
    } catch {
      setUnlockError("Checkout could not be started. Please try again.");
      setUnlockPending(false);
    }
  }

  return (
    <Shell>
      {result === null ? (
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight">No report in this session</h1>
          <p className="text-sm leading-6 text-[#5c5348]">
            Verification results stay in page memory only. Refreshing or opening this URL directly
            does not restore the task or the diff.
          </p>
          <Link href="/" className="inline-block text-sm font-semibold text-[#9a3412]">
            Back to ChangeVerify
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          <ReportView
            result={result}
            onUnlock={result.access === "preview" ? onUnlock : undefined}
            unlockPending={unlockPending}
            unlockError={unlockError}
          />
          <Link
            href="/"
            onClick={() => clearStoredReport()}
            className="inline-block text-sm font-semibold text-[#9a3412]"
          >
            Check another change
          </Link>
        </div>
      )}
    </Shell>
  );
}
