import type { Metadata } from "next";
import { LegalPage, legalMetadata } from "@/components/legal/LegalPage";

export const metadata: Metadata = legalMetadata("imprint", "de");

export default function ImpressumPage() {
  return <LegalPage kind="imprint" lang="de" />;
}
