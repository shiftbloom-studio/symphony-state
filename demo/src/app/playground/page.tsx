import { Navigation } from "@/components/shared/Navigation";
import { PlaygroundApp } from "@/components/playground/PlaygroundApp";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "State Lab",
  description:
    "Trigger single state sources, add network delay and stale responses, then watch Symphony State reconcile them in your browser.",
  path: "/playground",
});

export default function PlaygroundPage() {
  return (
    <>
      <Navigation />
      <main className="mx-auto max-w-[100rem] px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary">State Lab</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Isolated testbench — trigger individual sources, simulate chaos, observe reconciliation.
          </p>
        </div>
        <PlaygroundApp />
      </main>
    </>
  );
}
