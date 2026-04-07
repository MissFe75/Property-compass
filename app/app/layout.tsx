import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Property Explorer | Property Compass",
  description: "Analyse any Australian investment property instantly. Calculate stamp duty, loan repayments, gross and net yield, and weekly cashflow — all in one place.",
  alternates: {
    canonical: "https://sextantdigital.com.au/app",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
