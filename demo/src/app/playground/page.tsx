import { Footer } from "@/components/shared/Footer";
import { Navigation } from "@/components/shared/Navigation";
import { PlaygroundApp } from "@/components/playground/PlaygroundApp";

export default function PlaygroundPage() {
  return (
    <>
      <Navigation />
      <main className="mx-auto max-w-[100rem] px-6 py-8">
        <div className="mb-8">
          <h1 className="brand-display text-3xl font-semibold text-ink">Playground</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Change one source at a time and watch the conductor reconcile it with the others. You can also slow the server down or make it disagree with your edits.
          </p>
        </div>
        <PlaygroundApp />
      </main>
      <Footer />
    </>
  );
}
