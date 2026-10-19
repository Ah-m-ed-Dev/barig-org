import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { X, Calendar } from "lucide-react";
import { images, news, formatDate } from "@/lib/data";
import { PageHero, Reveal, SectionTitle, ShareButtons } from "@/components/site";

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { title: "الأخبار والأنشطة | منظمة بريق" },
      { name: "description", content: "آخر أخبار وأنشطة منظمة بريق ومعرض صور من الميدان في جنوب دارفور." },
      { property: "og:title", content: "الأخبار والأنشطة | منظمة بريق" },
      { property: "og:description", content: "أخبار ومعرض صور من أنشطة بريق الميدانية." },
    ],
  }),
  component: News,
});

const gallery = [
  { img: images.hero, cat: "الإغاثة" }, { img: images.health, cat: "الصحة" }, { img: images.training, cat: "التدريب" },
  { img: images.children, cat: "الطفل" }, { img: images.health, cat: "الصحة" }, { img: images.children, cat: "البيئة" },
  { img: images.training, cat: "الشباب" }, { img: images.hero, cat: "الإغاثة" },
];
const cats = ["الكل", ...Array.from(new Set(gallery.map((g) => g.cat)))];

function News() {
  const [cat, setCat] = useState("الكل");
  const [open, setOpen] = useState<string | null>(null);
  const [article, setArticle] = useState<(typeof news)[number] | null>(null);
  const items = gallery.filter((g) => cat === "الكل" || g.cat === cat);

  return (
    <>
      <PageHero title="الأخبار والأنشطة" subtitle="قصص من الميدان، وأثر يُرى." img={images.training} />
      <section className="mx-auto max-w-7xl px-4 py-20">
        <SectionTitle kicker="المدونة" title="آخر الأخبار" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {news.map((n) => (
            <Reveal key={n.id}>
              <article className="flex h-full flex-col overflow-hidden rounded-3xl border bg-card shadow-soft">
                <img src={n.img} alt={n.title} loading="lazy" className="h-48 w-full object-cover" />
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground"><Calendar className="h-3.5 w-3.5" />{formatDate(n.date)} · <span className="text-primary">{n.program}</span></div>
                  <h3 className="mt-2 text-lg leading-8 text-secondary">{n.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-7 text-muted-foreground">{n.excerpt}</p>
                  <button onClick={() => setArticle(n)} className="mt-4 self-start text-sm font-semibold text-primary">اقرأ المزيد ←</button>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="bg-muted py-20">
        <div className="mx-auto max-w-7xl px-4">
          <SectionTitle kicker="لحظات" title="معرض الصور" />
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            {cats.map((c) => <button key={c} onClick={() => setCat(c)} className={`rounded-full px-4 py-1.5 text-sm ${cat === c ? "bg-primary text-primary-foreground" : "bg-card"}`}>{c}</button>)}
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {items.map((g, i) => (
              <button key={i} onClick={() => setOpen(g.img)} className="group relative aspect-square overflow-hidden rounded-2xl">
                <img src={g.img} alt={g.cat} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                <span className="absolute bottom-2 right-2 rounded-full bg-background/90 px-2 py-0.5 text-xs">{g.cat}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/90 p-4" onClick={() => setOpen(null)}>
          <button className="absolute left-4 top-4 text-on-dark" aria-label="إغلاق"><X className="h-8 w-8" /></button>
          <img src={open} alt="" className="max-h-[85vh] max-w-full rounded-2xl animate-rise" />
        </div>
      )}
      {article && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/70 p-4" onClick={() => setArticle(null)}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-3xl bg-card animate-rise" onClick={(e) => e.stopPropagation()}>
            <img src={article.img} alt="" className="h-64 w-full object-cover" />
            <div className="p-8">
              <div className="text-xs text-primary">{article.program} · {formatDate(article.date)}</div>
              <h2 className="mt-2 text-2xl text-secondary">{article.title}</h2>
              <p className="mt-4 leading-8 text-muted-foreground">{article.excerpt} تأتي هذه الجهود ضمن التزام بريق بالوصول إلى الفئات الأكثر احتياجاً، بالشراكة مع المجتمع المحلي ومتطوعينا الذين يواصلون العطاء في الميدان.</p>
              <div className="mt-6 flex items-center justify-between"><ShareButtons title={article.title} /><button onClick={() => setArticle(null)} className="btn btn-outline !py-2">إغلاق</button></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
