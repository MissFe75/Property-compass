import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Property Analyser | Property Compass",
  description: "Analyse any Australian investment property instantly. Calculate stamp duty, loan repayments, gross and net yield, and weekly cashflow — all in one place.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
