import type { Metadata } from "next";
import { Shell } from "@/components/shell";

export const metadata: Metadata = {
  title: "Privacy Policy - ChangeVerify",
  description: "How ChangeVerify handles the original task and Git diff you submit for one verification.",
};

export default function PrivacyPage() {
  return (
    <Shell>
      <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
      <p className="mt-3 text-sm text-[#6b6258]">Last updated September 27, 2026</p>
      <div className="mt-8 space-y-8 text-sm leading-7 text-[#3f3832]">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1c1915]">What this covers</h2>
          <p>
            ChangeVerify checks one AI code change at a time. This policy describes what happens to
            the original task and Git diff you paste, and to the verification report produced from
            them.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1c1915]">What you submit</h2>
          <p>
            You choose what to paste. That usually includes the original instruction you gave an AI
            coding tool and the Git diff for that change. Do not include secrets such as API keys,
            passwords, access tokens, or private keys.
          </p>
          <p>ChangeVerify does not access your repository. It only analyzes the text you submit.</p>
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1c1915]">How the submission is used</h2>
          <p>
            The original task and Git diff are sent to ChangeVerify and then to a third-party AI
            model provider to produce this verification report. They are used for that verification,
            not to build a code history.
          </p>
          <p>
            ChangeVerify does not keep a database of your code. Server logs record request details
            such as character counts and token counts. They do not record the task text or the diff
            text.
          </p>
          <p>
            The report can be kept in an encrypted token in your browser session for a short time so
            you can unlock that same report. The token holds the report, not the raw task or diff.
            Closing the tab or starting another check removes that session data.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1c1915]">Payment</h2>
          <p>
            Checkout is handled by Creem. ChangeVerify does not receive or store your card number.
            The purchase is a one-time payment for the current verification report.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1c1915]">Accounts</h2>
          <p>ChangeVerify does not create a user account for this check.</p>
        </section>
      </div>
    </Shell>
  );
}
