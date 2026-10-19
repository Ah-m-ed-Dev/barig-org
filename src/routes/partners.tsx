import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Handshake, Award, BarChart3, Globe, Users, Sparkles, GraduationCap, HeartHandshake } from "lucide-react";
import { images } from "@/lib/data";
import { PageHero, SectionTitle } from "@/components/site";
import { SimpleForm, name, email, phone, message } from "@/components/forms";

export const Route = createFileRoute("/partners")({
  head: () => ({
    meta: [
      { title: "الشراكات والتطوع | منظمة بريق" },
      { name: "description", content: "كن شريكاً لمنظمة بريق أو انضم إلى فريق المتطوعين وساهم في بناء مجتمع أكثر إشراقاً." },
      { property: "og:title", content: "الشراكات والتطوع | منظمة بريق" },
      { property: "og:description", content: "فرص الشراكة المؤسسية والتطوع مع منظمة بريق." },
    ],
  }),
  component: Partners,
});

const benefits = [
  { icon: Award, t: "أثر موثّق", d: "تقارير دورية بالنتائج والأرقام." },
  { icon: BarChart3, t: "شفافية مالية", d: "متابعة كاملة لاستخدام الموارد." },
  { icon: Globe, t: "وصول ميداني", d: "حضور مباشر في المجتمعات المستهدفة." },
  { icon: Handshake, t: "مسؤولية مجتمعية", d: "تعزيز صورة مؤسستك وقيمها." },
];
const volBenefits = [
  { icon: Sparkles, t: "اكتساب خبرة ميدانية" }, { icon: GraduationCap, t: "تدريب وشهادات" },
  { icon: Users, t: "شبكة علاقات واسعة" }, { icon: HeartHandshake, t: "أثر حقيقي في حياة الناس" },
];

function Partners() {
  return (
    <>
      <PageHero title="الشراكات والتطوع" subtitle="معاً نصل أبعد. شاركنا بخبرتك أو وقتك أو مؤسستك." img={images.children} />
      <section className="mx-auto max-w-7xl px-4 py-20">
        <SectionTitle kicker="للشركات والمؤسسات" title="فرص التعاون" />
        <div className="grid gap-4 md:grid-cols-4">
          {benefits.map((b) => <div key={b.t} className="rounded-3xl border bg-card p-6"><b.icon className="h-8 w-8 text-primary" /><h3 className="mt-3 text-lg text-secondary">{b.t}</h3><p className="mt-1 text-sm text-muted-foreground">{b.d}</p></div>)}
        </div>
        <div className="mx-auto mt-10 max-w-3xl rounded-3xl bg-card p-8 shadow-soft">
          <h3 className="mb-4 text-xl text-secondary">نموذج استفسار شراكة</h3>
          <SimpleForm submit="إرسال الاستفسار" success="تم استلام استفسارك، سنتواصل معك قريباً."
            schema={z.object({ name, org: z.string().trim().min(2, "اسم المؤسسة مطلوب").max(150), email, phone, message })}>
            <input name="name" placeholder="اسم المسؤول" className="field" maxLength={100} />
            <input name="org" placeholder="اسم المؤسسة" className="field" maxLength={150} />
            <input name="email" type="email" placeholder="البريد الإلكتروني" className="field" maxLength={255} />
            <input name="phone" placeholder="الهاتف" className="field" dir="ltr" maxLength={20} />
            <textarea name="message" rows={4} placeholder="مجال الشراكة المقترح" className="field sm:col-span-2" maxLength={1000} />
          </SimpleForm>
        </div>
      </section>
      <section className="bg-muted py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 lg:grid-cols-2">
          <div>
            <SectionTitle kicker="انضم إلينا" title="كن متطوعاً في بريق" center={false} />
            <p className="leading-8 text-muted-foreground">التطوع في بريق فرصة لتصنع الفرق وتنمو معنا. نرحّب بكل من يحمل روح العطاء.</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {volBenefits.map((b) => <div key={b.t} className="flex items-center gap-3 rounded-2xl bg-card p-4 text-sm font-semibold"><b.icon className="h-5 w-5 text-primary" />{b.t}</div>)}
            </div>
            <h3 className="mt-8 text-lg text-secondary">متطلبات التطوع</h3>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>✦ العمر ١٨ سنة فأكثر</li><li>✦ الالتزام بقيم المنظمة ومدونة السلوك</li><li>✦ تخصيص ٤ ساعات أسبوعياً على الأقل</li><li>✦ حضور التدريب التعريفي</li>
            </ul>
          </div>
          <div className="rounded-3xl bg-card p-8 shadow-soft">
            <h3 className="mb-4 text-xl text-secondary">نموذج تسجيل متطوع</h3>
            <SimpleForm submit="سجّل كمتطوع" success="شكراً لانضمامك! سيتواصل معك فريق التطوع."
              schema={z.object({ name, email, phone, area: z.string().min(1, "اختر مجال التطوع"), message: z.string().trim().max(1000).optional() })}>
              <input name="name" placeholder="الاسم الكامل" className="field" maxLength={100} />
              <input name="email" type="email" placeholder="البريد الإلكتروني" className="field" maxLength={255} />
              <input name="phone" placeholder="الهاتف" className="field" dir="ltr" maxLength={20} />
              <select name="area" className="field" defaultValue=""><option value="" disabled>مجال التطوع</option><option>الصحة</option><option>التعليم والطفل</option><option>الإغاثة</option><option>الإعلام والتصميم</option><option>البيئة</option></select>
              <textarea name="message" rows={3} placeholder="نبذة عن مهاراتك (اختياري)" className="field sm:col-span-2" maxLength={1000} />
            </SimpleForm>
          </div>
        </div>
      </section>
    </>
  );
}
