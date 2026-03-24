import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mortgage Calculator | Property Compass",
  description: "Calculate Australian mortgage repayments weekly, fortnightly or monthly. See how extra repayments can save you years and thousands in interest.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
