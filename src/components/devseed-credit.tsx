import devseed from "@/assets/devseed.png";

const DEVSEED_URL = "https://devseeda1.vercel.app";

export function DevSeedCredit() {
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="opacity-70">تطوير بواسطة</span>
      <a href={DEVSEED_URL} target="_blank" rel="noreferrer" aria-label="DevSeed">
        <img src={devseed} alt="DevSeed" className="h-8 w-auto" loading="lazy" />
      </a>
    </div>
  );
}
