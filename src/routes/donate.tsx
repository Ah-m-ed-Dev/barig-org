import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Lock, ShieldCheck, Heart, CreditCard, Landmark, Smartphone, Quote } from "lucide-react";
import { images, programs, testimonials } from "@/lib/data";
import { PageHero, SectionTitle } from "@/components/site";

export const Route = createFileRoute("/donate")({
  validateSearch: (s: Record<string, unknown>) => ({ program: typeof s.program === "string" ? s.program : undefined }),
  head: () => ({
    meta: [
      { title: "تبرّع الآن | منظمة بريق" },
      { name: "description", content: "تبرّع بأمان لدعم برامج منظمة بريق في السودان. تبرع لمرة واحدة أو شهرياً أو سنوياً." },
      { property: "og:title", content: "تبرّع الآن | منظمة بريق" },
      { property: "og:description", content: "تبرّعك يصنع الفرق في حياة الأسر في جنوب دارفور." },
    ],
  }),
  component: Donate,
});

const schema = z.object({
  name: z.string().trim().min(2, "الاسم مطلوب").max(100),
  email: z.string().trim().email("بريد إلكتروني غير صالح").max(255),
  phone: z.string().trim().max(20).optional(),
  amount: z.number().positive("حدد مبلغاً صحيحاً").max(1000000),
  agree: z.literal(true, { errorMap: () => ({ message: "يجب الموافقة على سياسة الخصوصية" }) }),
});

function Donate() {
  const { program } = Route.useSearch();
  const [type, setType] = useState(program ? "program" : "general");
  const [target, setTarget] = useState(program ?? programs[0].slug);
  const [amount, setAmount] = useState<number | "other">(100);
  const [other, setOther] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [freq, setFreq] = useState("once");
  const [method, setMethod] = useState("card");

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const r = schema.safeParse({
      name: f.get("name"), email: f.get("email"), phone: f.get("phone") || undefined,
      amount: amount === "other" ? Number(other) : amount, agree: f.get("agree") === "on" ? true : false,
    });
    if (!r.success) return toast.error(r.error.issues[0].message);
    toast.success("شكراً لكرمك! بوابة الدفع الآمنة قيد التفعيل، وسنتواصل معك لإتمام التبرع.");
    e.currentTarget.reset();
  };

  const chip = (active: boolean) => `rounded-xl border px-4 py-3 text-sm font-semibold transition ${active ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary"}`;

  return (
    <>
      <PageHero title="تبرّع الآن" subtitle="كل مساهمة، مهما كانت صغيرة، تضيء حياة أسرة." img={images.hero} />
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 lg:grid-cols-[1.4fr_1fr]">
        <form onSubmit={onSubmit} className="space-y-8 rounded-3xl border bg-card p-6 shadow-soft md:p-10">
          <div>
            <h2 className="mb-3 text-lg text-secondary">١. نوع التبرع</h2>
            <div className="grid grid-cols-3 gap-2">
              {[["general","تبرع عام"],["program","برنامج معين"],["campaign","حملة"]].map(([v,l]) => <button type="button" key={v} onClick={() => setType(v)} className={chip(type===v)}>{l}</button>)}
            </div>
            {type === "program" && (
              <select value={target} onChange={(e) => setTarget(e.target.value)} className="field mt-3">
                {programs.map((p) => <option key={p.slug} value={p.slug}>برنامج {p.title}</option>)}
              </select>
            )}
            {type === "campaign" && (
              <select className="field mt-3"><option>حملة العودة إلى المدارس</option><option>حملة الشتاء الدافئ</option><option>حملة سقيا الماء</option></select>
            )}
          </div>
          <div>
            <h2 className="mb-3 text-lg text-secondary">٢. المبلغ والعملة</h2>
            <div className="mb-3 flex gap-2">
              {["USD","EUR","SDG"].map((c) => <button type="button" key={c} onClick={() => setCurrency(c)} className={chip(currency===c)}>{c}</button>)}
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {[50,100,250,500].map((a) => <button type="button" key={a} onClick={() => setAmount(a)} className={chip(amount===a)}>{a}</button>)}
              <button type="button" onClick={() => setAmount("other")} className={chip(amount==="other")}>آخر</button>
            </div>
            {amount === "other" && <input type="number" min={1} value={other} onChange={(e) => setOther(e.target.value)} placeholder="أدخل المبلغ" className="field mt-3" />}
          </div>
          <div>
            <h2 className="mb-3 text-lg text-secondary">٣. التكرار</h2>
            <div className="grid grid-cols-3 gap-2">
              {[["once","مرة واحدة"],["monthly","شهري"],["yearly","سنوي"]].map(([v,l]) => <button type="button" key={v} onClick={() => setFreq(v)} className={chip(freq===v)}>{l}</button>)}
            </div>
          </div>
          <div>
            <h2 className="mb-3 text-lg text-secondary">٤. بيانات المتبرع</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="name" placeholder="الاسم الكامل" className="field" maxLength={100} required />
              <input name="email" type="email" placeholder="البريد الإلكتروني" className="field" maxLength={255} required />
              <input name="phone" placeholder="رقم الهاتف (اختياري)" className="field sm:col-span-2" maxLength={20} dir="ltr" />
            </div>
          </div>
          <div>
            <h2 className="mb-3 text-lg text-secondary">٥. طريقة الدفع</h2>
            <div className="grid grid-cols-3 gap-2">
              {[["card","بطاقة بنكية",CreditCard],["bank","تحويل بنكي",Landmark],["mobile","محفظة إلكترونية",Smartphone]].map(([v,l,I]) => {
                const Icon = I as typeof CreditCard;
                return <button type="button" key={v as string} onClick={() => setMethod(v as string)} className={`${chip(method===v)} flex flex-col items-center gap-1`}><Icon className="h-5 w-5" />{l as string}</button>;
              })}
            </div>
          </div>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" name="agree" className="mt-1 accent-[var(--primary)]" />
            <span>أوافق على <Link to="/policies/$slug" params={{ slug: "privacy" }} className="text-primary underline">سياسة الخصوصية</Link> و<Link to="/policies/$slug" params={{ slug: "donations" }} className="text-primary underline">سياسة التبرعات والاسترجاع</Link>.</span>
          </label>
          <button className="btn btn-primary w-full !py-4 text-lg"><Lock className="h-5 w-5" />تبرّع {amount === "other" ? other || "" : amount} {currency} {freq === "monthly" ? "شهرياً" : freq === "yearly" ? "سنوياً" : ""}</button>
          <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 text-secondary" />اتصال مشفّر وآمن. لا نخزّن بيانات بطاقتك.</p>
        </form>
        <aside className="space-y-6">
          <div className="rounded-3xl bg-secondary p-8 text-secondary-foreground">
            <Heart className="h-8 w-8 text-gold" />
            <h3 className="mt-3 text-xl">كيف نستخدم تبرعك؟</h3>
            <ul className="mt-4 space-y-3 text-sm opacity-90">
              <li>✦ ٩٥٪ تذهب مباشرة للبرامج الميدانية</li>
              <li>✦ ٥٪ للتشغيل والمتابعة والتقارير</li>
              <li>✦ تقارير مالية دورية منشورة للمتبرعين</li>
              <li>✦ إيصال إلكتروني لكل تبرع</li>
            </ul>
          </div>
          <div className="rounded-3xl border bg-card p-6">
            <SectionTitle title="شهادات المستفيدين" center={false} />
            {testimonials.slice(0, 2).map((t) => (
              <figure key={t.name} className="mb-4 border-r-4 border-primary pr-4"><Quote className="h-4 w-4 text-gold" /><blockquote className="text-sm leading-7">{t.text}</blockquote><figcaption className="mt-1 text-xs font-semibold text-secondary">{t.name}</figcaption></figure>
            ))}
          </div>
        </aside>
      </section>
    </>
  );
}
