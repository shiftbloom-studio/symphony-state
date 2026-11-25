import type { Metadata } from "next";
import { LegalPage, legalMetadata } from "@/components/legal/LegalPage";

export const metadata: Metadata = legalMetadata("privacy", "de");

export default function DatenschutzPage() {
  return <LegalPage kind="privacy" lang="de" />;
}
