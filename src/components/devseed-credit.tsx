import devseed from "@/assets/devseed.png";

// ضع رابط موقع أو صفحة DevSeed هنا ليصبح الشعار قابلاً للنقر (اختياري)
const DEVSEED_URL = "https://devseeda1.vercel.app";

export function DevSeedCredit() {
  const badge = (
    <span className="inline-flex items-center rounded-full bg-background px-3.5 py-1.5 shadow-soft ring-1 ring-white/20 transition duration-200 group-hover:-translate-y-0.5">
      <img src={devseed} alt="DevSeed" className="h-7 w-auto" loading="lazy" />
    </span>
  );
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="opacity-70">تطوير بواسطة</span>
      {DEVSEED_URL ? (
        <a href={DEVSEED_URL} target="_blank" rel="noreferrer" aria-label="DevSeed" className="group">{badge}</a>
      ) : (
        <span className="group">{badge}</span>
      )}
    </div>
  );
}
