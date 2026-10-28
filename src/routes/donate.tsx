import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import {
  Lock, ShieldCheck, Heart, Landmark, Smartphone, Quote, Copy, Upload, CheckCircle2, MessageCircle, CreditCard,
} from "lucide-react";
import { images, programs, testimonials } from "@/lib/data";
import { PageHero, SectionTitle } from "@/components/site";
import { supabase } from "@/integrations/supabase/client"; // عدّل المسار حسب مشروعك

/* ───────────── الإعدادات (عدّلها ببيانات المنظمة الحقيقية) ───────────── */

const WHATSAPP = "249000000000"; // رقم واتساب المنظمة بصيغة دولية بدون +

type Currency = "USD" | "SDG";

const AMOUNTS: Record<Currency, number[]> = {
  USD: [25, 50, 100, 250],
  SDG: [20000, 50000, 100000, 250000],
};

// أثر المبلغ — عدّل الأرقام حسب تكلفتكم الفعلية
const IMPACT: Record<Currency, Record<number, string>> = {
  USD: { 25: "وجبات لأسرة لأسبوع", 50: "سلة غذائية لأسرة", 100: "مستلزمات مدرسية لـ٥ طلاب", 250: "دعم مشروع مياه لحيّ صغير" },
  SDG: {},
};

const CAMPAIGNS = [
  { slug: "back-to-school", title: "حملة العودة إلى المدارس" },
  { slug: "warm-winter", title: "حملة الشتاء الدافئ" },
  { slug: "water", title: "حملة سقيا الماء" },
];

type Method = {
  id: string;
  label: string;
  icon: typeof Landmark;
  logo?: string;
  currencies: Currency[];
  account?: { holder: string; number: string; note?: string };
  soon?: boolean;
};

const METHODS: Method[] = [
  { id: "bankak", label: "بنكك (mBOK)", icon: Smartphone, logo: "/banks/bankak.png", currencies: ["SDG"], account: { holder: "منظمة بريق", number: "0000000" } },
  { id: "fawry", label: "فوري", icon: Smartphone, logo: "/banks/fawry.png", currencies: ["SDG"], account: { holder: "منظمة بريق", number: "00000000" } },
  { id: "ocash", label: "أوو-كاش (O-Cash)", icon: Smartphone, logo: "/banks/okash.png", currencies: ["SDG"], account: { holder: "منظمة بريق", number: "00000000" } },
  { id: "bank", label: "تحويل بنكي", icon: Landmark, currencies: ["SDG", "USD"], account: { holder: "منظمة بريق", number: "SD00 0000 0000 0000", note: "اسم البنك / الفرع: ..." } },
  { id: "card", label: "بطاقة", icon: CreditCard, currencies: ["USD"], soon: true },
];

/* ───────────── التحقق ───────────── */

const MAX_FILE = 5 * 1024 * 1024;

const schema = z.object({
  name: z.string().trim().min(2, "الاسم مطلوب").max(100),
  phone: z.string().trim().regex(/^\+?[0-9\s-]{8,16}$/, "رقم واتساب غير صالح"),
  email: z.string().trim().email("بريد إلكتروني غير صالح").max(255).optional().or(z.literal("")),
  amount: z.number().positive("حدد مبلغاً صحيحاً").max(100000000),
  receipt: z
    .instanceof(File, { message: "ارفع صورة إشعار التحويل" })
    .refine((f) => f.size > 0, "ارفع صورة إشعار التحويل")
    .refine((f) => f.size <= MAX_FILE, "حجم الملف أكبر من 5 ميجا")
    .refine((f) => /^(image\/|application\/pdf)/.test(f.type), "الصيغة المسموحة: صورة أو PDF"),
});

/* ───────────── الصفحة ───────────── */

export const Route = createFileRoute("/donate")({
  validateSearch: (s: Record<string, unknown>): { program?: string } =>
    typeof s["program"] === "string" ? { program: s["program"] } : {},
  head: () => ({
    meta: [
      { title: "تبرّع الآن | منظمة بريق" },
      { name: "description", content: "تبرّع بسهولة لدعم برامج منظمة بريق في السودان عبر بنكك أو فوري أو كاشي أو التحويل البنكي." },
      { property: "og:title", content: "تبرّع الآن | منظمة بريق" },
      { property: "og:description", content: "تبرّعك يصنع الفرق في حياة الأسر في جنوب دارفور." },
    ],
  }),
  component: Donate,
});

const newReference = () => {
  const d = new Date();
  const ym = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}`;
  return `BRQ-${ym}-${Math.floor(1000 + Math.random() * 9000)}`;
};

const fmt = (n: number) => n.toLocaleString("en-US");

function Donate() {
  const { program } = Route.useSearch();
  const validProgram = programs.some((p) => p.slug === program) ? program : undefined;

  const [currency, setCurrency] = useState<Currency>("SDG");
  const [amount, setAmount] = useState<number | "other">(AMOUNTS.SDG[1]!);
  const [other, setOther] = useState("");
  const [destination, setDestination] = useState(validProgram ? `program:${validProgram}` : "general");
  const [method, setMethod] = useState("bankak");
  const [anonymous, setAnonymous] = useState(false);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [reference] = useState(newReference);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ reference: string; amount: number; currency: Currency } | null>(null);

  const numericAmount = amount === "other" ? Number(other) : amount;
  const activeMethod = METHODS.find((m) => m.id === method)!;
  const availableMethods = METHODS.filter((m) => m.currencies.includes(currency));

  const changeCurrency = (c: Currency) => {
    setCurrency(c);
    setAmount(AMOUNTS[c][1]!);
    setOther("");
    const first = METHODS.find((m) => m.currencies.includes(c) && !m.soon);
    if (!METHODS.find((m) => m.id === method)?.currencies.includes(c) && first) setMethod(first.id);
  };

  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); toast.success("تم النسخ"); }
    catch { toast.error("تعذّر النسخ، انسخ يدوياً"); }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    const f = new FormData(e.currentTarget);
    const r = schema.safeParse({
      name: f.get("name"),
      phone: f.get("phone"),
      email: f.get("email") || "",
      amount: numericAmount,
      receipt: receipt ?? undefined,
    });
    if (!r.success) { toast.error(r.error.issues[0]?.message ?? "تحقق من البيانات"); return; }

    setBusy(true);
    try {
      const safeName = r.data.receipt.name.replace(/[^\w.-]/g, "_");
      const path = `${reference}/${Date.now()}-${safeName}`;
      const up = await supabase.storage.from("receipts").upload(path, r.data.receipt);
      if (up.error) throw up.error;

      const [kind, slug] = destination.split(":");
      const { error } = await supabase.from("donations").insert({
        reference,
        amount: r.data.amount,
        currency,
        method,
        status: "pending",
        receipt_url: path,
        donor_name: r.data.name,
        phone: r.data.phone,
        email: r.data.email || null,
        anonymous,
        destination_type: kind,
        destination_slug: slug ?? null,
      });
      if (error) throw error;

      setDone({ reference, amount: r.data.amount, currency });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      toast.error("حصل خطأ أثناء الإرسال. حاول مرة أخرى أو تواصل معنا عبر واتساب.");
    } finally {
      setBusy(false);
    }
  };

  const chip = (active: boolean, disabled = false) =>
    `rounded-xl border px-4 py-3 text-sm font-semibold transition ${
      disabled ? "cursor-not-allowed bg-muted text-muted-foreground opacity-60"
      : active ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary"
    }`;

  /* ───────── صفحة الشكر ───────── */
  if (done) {
    const msg = encodeURIComponent(`السلام عليكم، حوّلت تبرعاً بمبلغ ${fmt(done.amount)} ${done.currency}. الرقم المرجعي: ${done.reference}`);
    return (
      <>
        <PageHero title="شكراً لكرمك" subtitle="استلمنا بيانات تبرعك وسنراجعها قريباً." img={images.hero} />
        <section className="mx-auto max-w-xl px-4 py-16">
          <div className="rounded-3xl border bg-card p-8 text-center shadow-soft">
            <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
            <h2 className="mt-4 text-xl text-secondary">تم استلام طلب التبرع</h2>
            <p className="mt-2 text-sm text-muted-foreground">رقمك المرجعي</p>
            <p dir="ltr" className="mt-1 text-2xl font-bold tracking-wider">{done.reference}</p>
            <p className="mt-4 text-sm leading-7">
              بعد مراجعة التحويل سنرسل لك إيصالاً إلكترونياً على واتساب. احتفظ بالرقم المرجعي للمتابعة.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <a className="btn btn-primary" href={`https://wa.me/${WHATSAPP}?text=${msg}`} target="_blank" rel="noreferrer">
                <MessageCircle className="h-5 w-5" />تواصل معنا على واتساب
              </a>
              <Link to="/" className="text-sm text-primary underline">العودة للرئيسية</Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  /* ───────── النموذج ───────── */
  return (
    <>
      <PageHero title="تبرّع الآن" subtitle="كل مساهمة، مهما كانت صغيرة، تضيء حياة أسرة." img={images.hero} />
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 pb-32 lg:grid-cols-[1.4fr_1fr] lg:pb-16">
        <form id="donate-form" onSubmit={onSubmit} className="min-w-0 space-y-8 rounded-3xl border bg-card p-6 shadow-soft md:p-10">
          {/* ١. المبلغ */}
          <div>
            <h2 className="mb-3 text-lg text-secondary">١. المبلغ</h2>
            <div className="mb-3 flex gap-2" role="group" aria-label="العملة">
              {(["SDG", "USD"] as Currency[]).map((c) => (
                <button type="button" key={c} aria-pressed={currency === c} onClick={() => changeCurrency(c)} className={chip(currency === c)}>
                  {c === "SDG" ? "جنيه سوداني" : "دولار USD"}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {AMOUNTS[currency].map((a) => (
                <button type="button" key={a} aria-pressed={amount === a} onClick={() => setAmount(a)} className={chip(amount === a)}>
                  {fmt(a)}
                </button>
              ))}
              <button type="button" aria-pressed={amount === "other"} onClick={() => setAmount("other")} className={chip(amount === "other")}>آخر</button>
            </div>
            {amount === "other" && (
              <>
                <label htmlFor="other" className="sr-only">المبلغ</label>
                <input id="other" type="number" inputMode="numeric" min={1} value={other} onChange={(e) => setOther(e.target.value)} placeholder="أدخل المبلغ" className="field mt-3" />
              </>
            )}
            {typeof amount === "number" && IMPACT[currency][amount] && (
              <p className="mt-3 flex items-center gap-2 text-sm text-secondary">
                <Heart className="h-4 w-4 text-gold" />{fmt(amount)} {currency} = {IMPACT[currency][amount]}
              </p>
            )}
          </div>

          {/* ٢. الوجهة */}
          <div>
            <h2 className="mb-3 text-lg text-secondary">٢. وجهة التبرع</h2>
            <label htmlFor="dest" className="sr-only">وجهة التبرع</label>
            <select id="dest" value={destination} onChange={(e) => setDestination(e.target.value)} className="field">
              <option value="general">حيث الحاجة أكبر</option>
              <optgroup label="البرامج">
                {programs.map((p) => <option key={p.slug} value={`program:${p.slug}`}>برنامج {p.title}</option>)}
              </optgroup>
              <optgroup label="الحملات">
                {CAMPAIGNS.map((c) => <option key={c.slug} value={`campaign:${c.slug}`}>{c.title}</option>)}
              </optgroup>
            </select>
          </div>

          {/* ٣. طريقة الدفع */}
          <div>
            <h2 className="mb-3 text-lg text-secondary">٣. طريقة الدفع</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {availableMethods.map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    type="button" key={m.id} disabled={m.soon} aria-pressed={method === m.id}
                    onClick={() => setMethod(m.id)}
                    className={`${chip(method === m.id, m.soon)} flex flex-col items-center gap-1`}
                  >
                    {m.logo
                      ? <img src={m.logo} alt="" loading="lazy" className="h-9 w-auto rounded-md object-contain" />
                      : <Icon className="h-9 w-9 p-1.5" />}
                    {m.label}{m.soon && <span className="text-xs font-normal">قريباً</span>}
                  </button>
                );
              })}
            </div>

            {activeMethod.account && (
              <div className="mt-4 min-w-0 space-y-4 overflow-hidden rounded-2xl border border-dashed border-primary bg-background p-5">
                <ol className="list-decimal space-y-1 pr-5 text-sm leading-7">
                  <li>حوّل المبلغ إلى الحساب أدناه.</li>
                  <li>اكتب الرقم المرجعي في ملاحظة التحويل.</li>
                  <li>ارفع صورة الإشعار واضغط «تأكيد التبرع».</li>
                </ol>

                <dl className="space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-muted-foreground">اسم الحساب</dt>
                    <dd className="font-semibold">{activeMethod.account.holder}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-muted-foreground">رقم الحساب</dt>
                    <dd className="flex items-center gap-2 font-semibold">
                      <span dir="ltr">{activeMethod.account.number}</span>
                      <button type="button" aria-label="نسخ رقم الحساب" onClick={() => copy(activeMethod.account!.number)}><Copy className="h-4 w-4 text-primary" /></button>
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-muted-foreground">الرقم المرجعي</dt>
                    <dd className="flex items-center gap-2 font-bold text-secondary">
                      <span dir="ltr">{reference}</span>
                      <button type="button" aria-label="نسخ الرقم المرجعي" onClick={() => copy(reference)}><Copy className="h-4 w-4 text-primary" /></button>
                    </dd>
                  </div>
                  {activeMethod.account.note && <p className="text-xs text-muted-foreground">{activeMethod.account.note}</p>}
                </dl>

                <div>
                  <label htmlFor="receipt" className="mb-2 block text-sm font-semibold">صورة إشعار التحويل</label>
                  <label htmlFor="receipt" className="field flex w-full min-w-0 max-w-full cursor-pointer items-center gap-2 overflow-hidden text-sm text-muted-foreground">
                    <Upload className="h-4 w-4 shrink-0" />
                    <span dir="auto" title={receipt?.name} className="min-w-0 flex-1 truncate">
                      {receipt ? receipt.name : "اضغط لاختيار صورة أو PDF"}
                    </span>
                  </label>
                  <input id="receipt" type="file" accept="image/*,application/pdf" className="sr-only" onChange={(e) => setReceipt(e.target.files?.[0] ?? null)} />
                </div>
              </div>
            )}
          </div>

          {/* ٤. البيانات */}
          <div>
            <h2 className="mb-3 text-lg text-secondary">٤. بياناتك</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="mb-1 block text-sm">الاسم الكامل</label>
                <input id="name" name="name" className="field" maxLength={100} required autoComplete="name" />
              </div>
              <div>
                <label htmlFor="phone" className="mb-1 block text-sm">رقم واتساب</label>
                <input id="phone" name="phone" type="tel" inputMode="tel" className="field" maxLength={20} dir="ltr" placeholder="+249..." required autoComplete="tel" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="email" className="mb-1 block text-sm">البريد الإلكتروني (اختياري)</label>
                <input id="email" name="email" type="email" className="field" maxLength={255} dir="ltr" autoComplete="email" />
              </div>
            </div>
            <label className="mt-3 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} className="accent-[var(--primary)]" />
              أرغب في التبرع كمجهول (لا يظهر اسمي في أي تقرير)
            </label>
          </div>

          <button disabled={busy} className="btn btn-primary w-full !py-4 text-lg disabled:opacity-60">
            <Lock className="h-5 w-5" />
            {busy ? "جارٍ الإرسال..." : `تأكيد التبرع ${numericAmount > 0 ? `${fmt(numericAmount)} ${currency}` : ""}`}
          </button>
          <p className="text-center text-xs leading-6 text-muted-foreground">
            <ShieldCheck className="ml-1 inline h-4 w-4 text-secondary" />
            بتأكيد التبرع أنت توافق على{" "}
            <Link to="/policies/$slug" params={{ slug: "privacy" }} className="text-primary underline">سياسة الخصوصية</Link> و
            <Link to="/policies/$slug" params={{ slug: "donations" }} className="text-primary underline">سياسة التبرعات والاسترجاع</Link>.
          </p>
        </form>

        <aside className="space-y-6">
          <div className="rounded-3xl bg-secondary p-8 text-secondary-foreground">
            <Heart className="h-8 w-8 text-gold" />
            <h3 className="mt-3 text-xl">كيف نستخدم تبرعك؟</h3>
            <ul className="mt-4 space-y-3 text-sm opacity-90">
              <li>✦ تذهب التبرعات للبرامج الميدانية مباشرة</li>
              <li>✦ تقارير مالية دورية منشورة للمتبرعين</li>
              <li>✦ إيصال إلكتروني لكل تبرع</li>
              <li>✦ رقم تسجيل المنظمة: ........</li>
            </ul>
          </div>

          <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer" className="btn w-full border bg-card">
            <MessageCircle className="h-5 w-5 text-primary" />محتاج مساعدة؟ كلمنا على واتساب
          </a>

          <div className="rounded-3xl border bg-card p-6">
            <SectionTitle title="شهادات المستفيدين" center={false} />
            {testimonials.slice(0, 2).map((t) => (
              <figure key={t.name} className="mb-4 border-r-4 border-primary pr-4">
                <Quote className="h-4 w-4 text-gold" />
                <blockquote className="text-sm leading-7">{t.text}</blockquote>
                <figcaption className="mt-1 text-xs font-semibold text-secondary">{t.name}</figcaption>
              </figure>
            ))}
          </div>
        </aside>
      </section>

      {/* شريط ثابت للموبايل */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-card p-3 shadow-soft lg:hidden">
        <button form="donate-form" disabled={busy} className="btn btn-primary w-full !py-3">
          <Lock className="h-4 w-4" />تأكيد التبرع {numericAmount > 0 ? `${fmt(numericAmount)} ${currency}` : ""}
        </button>
      </div>
    </>
  );
}
