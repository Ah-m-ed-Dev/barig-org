import { createFileRoute } from "@tanstack/react-router";
import { Eye, Target, CheckCircle2, User } from "lucide-react";
import { images, values, goals, team } from "@/lib/data";
import { PageHero, Reveal, SectionTitle } from "@/components/site";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "من نحن | منظمة بريق" },
      { name: "description", content: "تعرّف على قصة منظمة بريق ورؤيتها ورسالتها وقيمها العشر وأهدافها وفريقها." },
      { property: "og:title", content: "من نحن | منظمة بريق" },
      { property: "og:description", content: "قصة منظمة بريق ورؤيتها ورسالتها وقيمها." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <>
      <PageHero title="من نحن" subtitle="منظمة طوعية سودانية تؤمن بأن التكافل هو الطريق إلى التنمية." img={images.children} />
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 lg:grid-cols-2">
        <Reveal>
          <SectionTitle kicker="قصتنا" title="بدأنا بمبادرة.. وأصبحنا منظمة" center={false} />
          <p className="leading-8 text-muted-foreground">انطلقت بريق من نيالا بجنوب دارفور كمبادرة شبابية لمساندة الأسر المتأثرة، ثم تطورت إلى منظمة مجتمعية خيرية مسجلة تعمل في الصحة والتعليم والتمكين والإغاثة والبيئة. نعمل مع المجتمعات لا من أجلها فقط، ونؤمن بأن كل إنسان قادر على صنع الفرق.</p>
        </Reveal>
        <img src={images.training} alt="فريق بريق" loading="lazy" className="rounded-3xl shadow-soft" />
      </section>
      <section className="mx-auto grid max-w-7xl gap-6 px-4 md:grid-cols-2">
        <div className="rounded-3xl bg-primary p-8 text-primary-foreground"><Eye className="h-8 w-8 text-gold" /><h3 className="mt-4 text-2xl">رؤيتنا</h3><p className="mt-2 text-lg opacity-90">مجتمع واعٍ، متكافل وقادر على تحقيق التنمية.</p></div>
        <div className="rounded-3xl bg-secondary p-8 text-secondary-foreground"><Target className="h-8 w-8 text-gold" /><h3 className="mt-4 text-2xl">رسالتنا</h3><p className="mt-2 text-lg opacity-90">إحداث أثر مجتمعي مستدام.</p></div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-20">
        <SectionTitle kicker="ما نؤمن به" title="قيمنا" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {values.map((v, i) => (
            <Reveal key={v}><div className="h-full rounded-2xl border bg-card p-5 text-center transition hover:border-primary">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-accent font-bold text-primary">{(i + 1).toLocaleString("ar-EG")}</div>
              <div className="mt-3 font-semibold text-secondary">{v}</div>
            </div></Reveal>
          ))}
        </div>
      </section>
      <section className="bg-muted py-20">
        <div className="mx-auto max-w-5xl px-4">
          <SectionTitle kicker="إلى أين نتجه" title="أهدافنا" />
          <ol className="grid gap-3 md:grid-cols-2">
            {goals.map((g) => (
              <li key={g} className="flex items-start gap-3 rounded-xl bg-card p-4"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />{g}</li>
            ))}
          </ol>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-20">
        <SectionTitle kicker="الأشخاص خلف بريق" title="فريقنا" />
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {team.map((t) => (
            <div key={t.name} className="rounded-3xl border bg-card p-6 text-center">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-brand text-on-dark"><User className="h-10 w-10" /></div>
              <div className="mt-4 font-semibold text-secondary">{t.name}</div>
              <div className="text-sm text-muted-foreground">{t.role}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
