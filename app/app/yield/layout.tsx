import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rental Yield Calculator | Property Compass",
  description: "Calculate gross and net rental yield for any Australian investment property. Includes vacancy, management fees, council rates, insurance and land tax.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
