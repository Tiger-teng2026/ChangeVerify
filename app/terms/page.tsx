import type { Metadata } from "next";
import { Shell } from "@/components/shell";

export const metadata: Metadata = {
  title: "Terms of Service - ChangeVerify",
  description: "Terms for using ChangeVerify to buy one AI code change verification report.",
};

export default function TermsPage() {
  return (
    <Shell>
      <h1 className="text-3xl font-semibold tracking-tight">Terms of Service</h1>
      <p className="mt-3 text-sm text-[#6b6258]">Last updated September 27, 2026</p>
      <div className="mt-8 space-y-8 text-sm leading-7 text-[#3f3832]">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1c1915]">The service</h2>
          <p>
            ChangeVerify compares the original task you provide with the Git diff you provide. It
            returns an AI-generated verification report for that change. It does not change your
            project, run your tests, or access your repository.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1c1915]">No guarantee of correctness</h2>
          <p>
            The report is an analysis of the text you submitted. It can miss issues or be wrong. It
            does not prove that your code is correct, secure, bug-free, or ready to ship. You are
            responsible for reviewing the change before you ship it.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1c1915]">One-time purchase</h2>
          <p>
            The paid unlock is a one-time purchase of the full report for the current verification.
            It is not a subscription, a membership, or a credit for later checks. A new change
            requires a new verification.
          </p>
          <p>
            Payment is processed by Creem. The full report is shown after Creem confirms that this
            payment is complete. Because the report is delivered at that time, the purchase is not
            refundable except where the law requires a refund.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1c1915]">Your submissions</h2>
          <p>
            You are responsible for the text you paste. Do not submit secrets, or code you are not
            allowed to send to a third-party AI model provider for analysis.
          </p>
        </section>
      </div>
    </Shell>
  );
}
