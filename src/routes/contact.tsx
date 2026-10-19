import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Phone, Mail, MapPin } from "lucide-react";
import { contact, images } from "@/lib/data";
import { PageHero, socials } from "@/components/site";
import { SimpleForm, name, email, phone, message } from "@/components/forms";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "تواصل معنا | منظمة بريق" },
      { name: "description", content: "تواصل مع منظمة بريق في نيالا، جنوب دارفور: هاتف، بريد إلكتروني، ونموذج اتصال." },
      { property: "og:title", content: "تواصل معنا | منظمة بريق" },
      { property: "og:description", content: "نسعد بتواصلك مع منظمة بريق." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const info = [
    { icon: Phone, l: "الهاتف", v: contact.phone, href: `tel:${contact.phone}`, ltr: true },
    { icon: Mail, l: "البريد الإلكتروني", v: contact.email, href: `mailto:${contact.email}` },
    { icon: MapPin, l: "العنوان", v: contact.address },
  ];
  return (
    <>
      <PageHero title="تواصل معنا" subtitle="نسعد بسماع صوتك، أسئلتك واقتراحاتك." img={images.health} />
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-4">
          {info.map((i) => (
            <div key={i.l} className="flex items-center gap-4 rounded-2xl border bg-card p-5">
              <div className="rounded-xl bg-primary p-3 text-primary-foreground"><i.icon className="h-5 w-5" /></div>
              <div><div className="text-sm text-muted-foreground">{i.l}</div>{i.href ? <a href={i.href} dir={i.ltr ? "ltr" : undefined} className="font-semibold text-secondary">{i.v}</a> : <div className="font-semibold text-secondary">{i.v}</div>}</div>
            </div>
          ))}
          <div className="flex gap-2">
            {socials.map((s) => <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="flex flex-1 flex-col items-center gap-1 rounded-2xl bg-secondary p-3 text-xs text-secondary-foreground hover:bg-primary"><s.icon className="h-5 w-5" />{s.label}</a>)}
          </div>
          <iframe title="خريطة نيالا" src="https://www.google.com/maps?q=Nyala,South+Darfur,Sudan&output=embed" className="h-64 w-full rounded-2xl border" loading="lazy" />
        </div>
        <div className="rounded-3xl bg-card p-8 shadow-soft">
          <h2 className="mb-6 text-2xl text-secondary">أرسل لنا رسالة</h2>
          <SimpleForm submit="إرسال" success="تم إرسال رسالتك بنجاح، سنرد عليك قريباً."
            schema={z.object({ name, email, phone, subject: z.string().trim().min(2, "الموضوع مطلوب").max(150), message })}>
            <input name="name" placeholder="الاسم" className="field" maxLength={100} />
            <input name="email" type="email" placeholder="البريد الإلكتروني" className="field" maxLength={255} />
            <input name="phone" placeholder="الهاتف" className="field" dir="ltr" maxLength={20} />
            <input name="subject" placeholder="الموضوع" className="field" maxLength={150} />
            <textarea name="message" rows={6} placeholder="رسالتك" className="field sm:col-span-2" maxLength={1000} />
          </SimpleForm>
        </div>
      </section>
    </>
  );
}
