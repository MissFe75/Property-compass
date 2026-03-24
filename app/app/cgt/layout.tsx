import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Capital Gains Tax Calculator | Property Compass",
  description: "Estimate capital gains tax on your Australian property sale. Includes the 50% CGT discount, tax bracket impact, and net profit after tax.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
