import { Footer } from "@/components/shared/Footer";
import { Navigation } from "@/components/shared/Navigation";
import { InventoryDashboard } from "@/components/inventory/InventoryDashboard";

export default function InventoryDemoPage() {
  return (
    <>
      <Navigation />
      <InventoryDashboard />
      <Footer />
    </>
  );
}
