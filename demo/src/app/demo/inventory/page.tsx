import { Footer } from "@/components/shared/Footer";
import { Navigation } from "@/components/shared/Navigation";
import { InventoryDashboard } from "@/components/inventory/InventoryDashboard";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Inventory demo",
  description:
    "A sample inventory dashboard where server data, optimistic stock edits, filters and saved preferences all run through one Symphony State conductor.",
  path: "/demo/inventory",
});

export default function InventoryDemoPage() {
  return (
    <>
      <Navigation />
      <InventoryDashboard />
      <Footer />
    </>
  );
}
