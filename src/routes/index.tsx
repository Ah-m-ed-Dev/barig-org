import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Heart, Quote } from "lucide-react";
import { images, news, programs, testimonials, formatDate } from "@/lib/data";
import { Counter, Reveal, SectionTitle } from "@/components/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "منظمة بريق | معاً نبني مجتمعاً أكثر إشراقاً" },
      { name: "description", content: "منظمة بريق للتنمية والعمل المجتمعي — برامج صحية وتنموية وإغاثية في نيالا وجنوب دارفور. تبرّع الآن." },
      { property: "og:title", content: "منظمة بريق | معاً نبني مجتمعاً أكثر إشراقاً" },
      { property: "og:description", content: "برامج صحية وتنموية وإغاثية في نيالا وجنوب دارفور." },
    ],
  }),
  component: Index,
});

const stats = [
  { n: 150, s: "+", label: "مشروع منفّذ" },
  { n: 25000, s: "+", label: "مستفيد" },
  { n: 50, s: "+", label: "متطوع نشط" },
  { n: 15, s: "+", label: "سنة خبرة" },
];

const impact = [
  { label: "الصحة", v: 30 }, { label: "الإغاثة", v: 25 }, { label: "التعليم والطفل", v: 18 },
  { label: "التمكين", v: 15 }, { label: "البيئة", v: 7 }, { label: "الإدارة", v: 5 },
];

function Index() {
  return (
    <>
      <section className="relative isolate min-h-[88vh] overflow-hidden">
        <img src={images.hero} alt="متطوعو بريق يوزعون المساعدات" width={1600} height={1008} className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-hero-overlay" />
        <div className="mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-center px-4 py-20 text-on-dark">
          <div className="max-w-2xl animate-rise">
            <span className="inline-flex items-center gap-2 rounded-full border border-current/30 px-4 py-1.5 text-sm"><span className="text-gold">✦</span> منظمة طوعية سودانية غير ربحية</span>
            <h1 className="mt-6 text-5xl leading-tight md:text-7xl">معاً.. نبني مجتمعاً <span className="text-gold">أكثر إشراقاً</span></h1>
            <p className="mt-6 text-lg leading-8 opacity-90">نعمل في نيالا وجنوب دارفور على الصحة والتعليم والتمكين والإغاثة، لنصنع مع مجتمعاتنا أثراً مستداماً يحفظ كرامة الإنسان.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/donate" className="btn btn-primary"><Heart className="h-5 w-5" />ابدأ التبرع الآن</Link>
              <Link to="/about" className="btn btn-ghost-light">تعرّف علينا أكثر</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-16 max-w-6xl px-4">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-border shadow-soft md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-card p-6 text-center md:p-8">
              <div className="font-display text-4xl text-primary md:text-5xl"><Counter to={s.n} suffix={s.s} /></div>
              <div className="mt-2 text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24">
        <SectionTitle kicker="ماذا نفعل" title="برامجنا الرئيسية" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((p, i) => (
            <Reveal key={p.slug}>
              <Link to="/programs" hash={p.slug} className="group block h-full overflow-hidden rounded-3xl border bg-card shadow-soft transition hover:-translate-y-1">
                <div className="relative h-48 overflow-hidden">
                  <img src={p.img} alt={p.title} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
                  <span className="absolute right-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">{(i + 1).toLocaleString("ar-EG")}</span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl text-secondary">برنامج {p.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{p.short}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">اعرف أكثر <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" /></span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-muted py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionTitle kicker="من الميدان" title="آخر الأخبار" center={false} />
            <Link to="/news" className="btn btn-outline mb-10">كل الأخبار</Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {news.slice(0, 3).map((n) => (
              <Reveal key={n.id}>
                <article className="h-full overflow-hidden rounded-3xl bg-card shadow-soft">
                  <img src={n.img} alt={n.title} loading="lazy" className="h-52 w-full object-cover" />
                  <div className="p-6">
                    <div className="text-xs text-primary">{n.program} · {formatDate(n.date)}</div>
                    <h3 className="mt-2 text-lg leading-8 text-secondary">{n.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{n.excerpt}</p>
                    <Link to="/news" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">اقرأ المزيد <ArrowLeft className="h-4 w-4" /></Link>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-24 lg:grid-cols-2">
        <Reveal>
          <SectionTitle kicker="شفافية تامة" title="أين تذهب تبرعاتك؟" center={false} />
          <div className="space-y-4">
            {impact.map((r) => (
              <div key={r.label}>
                <div className="mb-1 flex justify-between text-sm"><span>{r.label}</span><span className="font-bold text-primary">{r.v.toLocaleString("ar-EG")}٪</span></div>
                <div className="h-3 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-brand" style={{ width: `${r.v}%` }} /></div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">٩٥٪ من التبرعات تذهب مباشرة إلى البرامج الميدانية.</p>
        </Reveal>
        <Reveal>
          <SectionTitle kicker="أصوات المستفيدين" title="قصص نعتز بها" center={false} />
          <div className="space-y-4">
            {testimonials.map((t) => (
              <figure key={t.name} className="rounded-2xl border bg-card p-6">
                <Quote className="h-6 w-6 text-gold" />
                <blockquote className="mt-2 leading-8">{t.text}</blockquote>
                <figcaption className="mt-3 text-sm font-semibold text-secondary">{t.name} <span className="font-normal text-muted-foreground">— {t.place}</span></figcaption>
              </figure>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="px-4 pb-24">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-brand p-10 text-center text-on-dark md:p-16">
          <div className="text-4xl text-gold">✦</div>
          <h2 className="mt-4 text-3xl md:text-5xl">تبرّعك يصنع الفرق اليوم</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg opacity-90">٥٠ دولاراً توفّر سلة غذائية لأسرة لشهر كامل، و١٠٠ دولار تغطي استشارات طبية لعشرين طفلاً.</p>
          <Link to="/donate" className="btn mt-8 bg-background !px-10 !py-4 text-lg text-primary"><Heart className="h-5 w-5" />تبرّع الآن</Link>
        </div>
      </section>
    </>
  );
}
