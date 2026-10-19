import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Users, TrendingUp, Heart } from "lucide-react";
import { images, programs } from "@/lib/data";
import { PageHero, Reveal } from "@/components/site";

export const Route = createFileRoute("/programs")({
  head: () => ({
    meta: [
      { title: "برامجنا | منظمة بريق" },
      { name: "description", content: "تسعة برامج لمنظمة بريق: الصحة، التدريب، سند، التنمية، الشباب، المرأة، الطفل، البيئة، والتطوع." },
      { property: "og:title", content: "برامجنا | منظمة بريق" },
      { property: "og:description", content: "تسعة برامج تصنع أثراً مستداماً في جنوب دارفور." },
    ],
  }),
  component: Programs,
});

function Programs() {
  return (
    <>
      <PageHero title="برامجنا" subtitle="تسعة برامج متكاملة تلامس احتياجات الإنسان من الصحة إلى البيئة." img={images.health} />
      <nav className="sticky top-[73px] z-30 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3">
          {programs.map((p) => <a key={p.slug} href={`#${p.slug}`} className="whitespace-nowrap rounded-full bg-muted px-4 py-1.5 text-sm hover:bg-primary hover:text-primary-foreground">{p.title}</a>)}
        </div>
      </nav>
      <div className="mx-auto max-w-7xl space-y-20 px-4 py-20">
        {programs.map((p, i) => (
          <Reveal key={p.slug}>
            <section id={p.slug} className="scroll-mt-40 grid items-center gap-10 lg:grid-cols-2">
              <img src={p.img} alt={p.title} loading="lazy" className={`h-80 w-full rounded-3xl object-cover shadow-soft ${i % 2 ? "lg:order-2" : ""}`} />
              <div>
                <span className="text-sm font-bold text-primary">البرنامج {(i + 1).toLocaleString("ar-EG")}</span>
                <h2 className="mt-1 text-3xl text-secondary">برنامج {p.title}</h2>
                <p className="mt-4 leading-8 text-muted-foreground">{p.desc}</p>
                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  <div><h3 className="mb-2 font-semibold text-secondary">الأنشطة والخدمات</h3>
                    <ul className="space-y-1.5 text-sm">{p.activities.map((a) => <li key={a} className="flex gap-2"><Check className="h-4 w-4 text-primary" />{a}</li>)}</ul></div>
                  <div><h3 className="mb-2 flex items-center gap-2 font-semibold text-secondary"><Users className="h-4 w-4" />الفئات المستهدفة</h3>
                    <div className="flex flex-wrap gap-2">{p.targets.map((t) => <span key={t} className="rounded-full bg-accent px-3 py-1 text-xs">{t}</span>)}</div></div>
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  {p.results.map((r) => <span key={r} className="inline-flex items-center gap-2 rounded-xl border border-gold/50 px-3 py-2 text-sm font-semibold"><TrendingUp className="h-4 w-4 text-gold" />{r}</span>)}
                  <Link to="/donate" search={{ program: p.slug }} className="btn btn-primary !py-2 text-sm"><Heart className="h-4 w-4" />ادعم البرنامج</Link>
                </div>
              </div>
            </section>
          </Reveal>
        ))}
      </div>
    </>
  );
}
