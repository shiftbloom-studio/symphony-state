// shiftbloom wordmark: "shiftbloom" semibold, "studio" regular at 60% ink, red seed period.
export const Wordmark = ({ className = "text-lg" }: { className?: string }) => (
  <span className={`brand-display whitespace-nowrap font-semibold tracking-[-0.035em] text-ink ${className}`}>
    shiftbloom <span className="font-normal text-ink/60">studio</span>
    <span className="text-bloom-red">.</span>
  </span>
);
