"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full bg-[#f3efe6] text-[#1c1915]">
      <header className="border-b border-[#e4d9c8]">
        <div className="mx-auto flex max-w-3xl items-center px-6 py-5">
          <Link href="/" className="text-sm font-semibold tracking-[0.22em] uppercase">
            ChangeVerify
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl px-6 py-12">{children}</main>
    </div>
  );
}
