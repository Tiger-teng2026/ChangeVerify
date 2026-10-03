import type { Metadata } from "next";
import Link from "next/link";
import { Shell } from "@/components/shell";

export const metadata: Metadata = {
  title: "About - ChangeVerify",
  description:
    "ChangeVerify is an independent developer project that checks one AI code change against the original task and Git diff.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <Shell>
      <h1 className="text-3xl font-semibold tracking-tight">About</h1>
      <div className="mt-8 space-y-8 text-sm leading-7 text-[#3f3832]">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1c1915]">Independent developer project</h2>
          <p>
            ChangeVerify is an independent developer project. It is not a company, and it does not
            have a team behind the product.
          </p>
          <p>
            The product checks whether an AI coding agent appears to have done what you asked. You
            paste the original task and the Git diff. ChangeVerify does not access your repository.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1c1915]">What the report is</h2>
          <p>
            The report is an AI analysis of the text you submit. It can miss issues or be wrong. It
            does not prove that your code is correct, secure, or ready to ship.
          </p>
          <p>
            A paid unlock is one report for that change. It is not a subscription, and it does not
            cover later checks.
          </p>
        </section>
        <p>
          <Link href="/contact" className="font-semibold text-[#9a3412]">
            Contact
          </Link>
        </p>
      </div>
    </Shell>
  );
}
