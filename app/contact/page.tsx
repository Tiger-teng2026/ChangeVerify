import type { Metadata } from "next";
import Link from "next/link";
import { Shell } from "@/components/shell";

export const metadata: Metadata = {
  title: "Contact - ChangeVerify",
  description: "Contact the independent developer behind ChangeVerify.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <Shell>
      <h1 className="text-3xl font-semibold tracking-tight">Contact</h1>
      <div className="mt-8 space-y-8 text-sm leading-7 text-[#3f3832]">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1c1915]">Email</h2>
          <p>Questions about ChangeVerify can be sent to:</p>
          <p>
            <a href="mailto:support@changeverify.com" className="font-semibold text-[#9a3412]">
              support@changeverify.com
            </a>
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1c1915]">Privacy</h2>
          <p>
            ChangeVerify does not access your repository. The original task and Git diff are used
            for the verification you request. ChangeVerify does not keep a code history.
          </p>
          <p>
            <Link href="/privacy" className="font-semibold text-[#9a3412]">
              Privacy Policy
            </Link>
          </p>
        </section>
      </div>
    </Shell>
  );
}
