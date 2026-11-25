import type { Metadata } from "next";
import { LegalPage, legalMetadata } from "@/components/legal/LegalPage";

export const metadata: Metadata = legalMetadata("imprint", "en");

export default function ImprintPage() {
  return <LegalPage kind="imprint" lang="en" />;
}
