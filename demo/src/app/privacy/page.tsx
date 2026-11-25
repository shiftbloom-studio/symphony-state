import type { Metadata } from "next";
import { LegalPage, legalMetadata } from "@/components/legal/LegalPage";

export const metadata: Metadata = legalMetadata("privacy", "en");

export default function PrivacyPage() {
  return <LegalPage kind="privacy" lang="en" />;
}
