"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { ReportView } from "@/components/report-view";
import { Shell } from "@/components/shell";
import { clearStoredReport, getStoredReport } from "@/lib/report-store";

function subscribe() {
  return () => {};
}

export default function ResultPage() {
  const result = useSyncExternalStore(subscribe, getStoredReport, () => null);

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
          <ReportView result={result} />
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
