import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare Investment Properties | Property Compass",
  description: "Compare up to 3 Australian investment properties side by side. See repayments, cashflow, gross yield and net yield at a glance.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
