import { Navigation } from "@/components/shared/Navigation";
import { PlaygroundApp } from "@/components/playground/PlaygroundApp";

export default function PlaygroundPage() {
  return (
    <>
      <Navigation />
      <main className="mx-auto max-w-7xl px-6 py-8">
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
