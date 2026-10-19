import { createFileRoute, notFound, Link } from "@tanstack/react-router";

const policies: Record<string, { title: string; sections: [string, string][] }> = {
  privacy: { title: "سياسة الخصوصية", sections: [
    ["البيانات التي نجمعها", "نجمع فقط البيانات التي تقدمها طوعاً عبر نماذج التبرع والتواصل والتطوع، مثل الاسم والبريد والهاتف."],
    ["كيف نستخدمها", "نستخدم بياناتك للتواصل معك وإصدار إيصالات التبرع وإرسال التقارير، ولا نبيعها أو نشاركها مع أي طرف لأغراض تجارية."],
    ["حماية البيانات", "تتم عمليات الدفع عبر بوابات مشفّرة ومعتمدة، ولا نخزّن بيانات البطاقات البنكية على خوادمنا."],
    ["حقوقك", `يحق لك طلب الاطلاع على بياناتك أو تعديلها أو حذفها بمراسلتنا على bariqorg26@gmail.com.`],
  ]},
  terms: { title: "شروط الاستخدام", sections: [
    ["القبول", "باستخدامك لهذا الموقع فإنك توافق على هذه الشروط."],
    ["المحتوى", "جميع المحتويات والصور والشعار ملك لمنظمة بريق، ولا يجوز استخدامها دون إذن مكتوب."],
    ["الاستخدام المقبول", "يُمنع استخدام الموقع لأي غرض غير قانوني أو مسيء أو إرسال معلومات مضللة عبر النماذج."],
    ["التعديلات", "تحتفظ المنظمة بحق تعديل هذه الشروط في أي وقت، ويسري التعديل فور نشره."],
  ]},
  donations: { title: "سياسة التبرعات والاسترجاع", sections: [
    ["استخدام التبرعات", "تُصرف التبرعات المخصصة على البرنامج المحدد، والتبرعات العامة حيث تكون الحاجة أشد."],
    ["الإيصالات", "يصلك إيصال إلكتروني بكل تبرع على بريدك الإلكتروني."],
    ["الاسترجاع", "يمكن طلب استرجاع التبرع خلال ١٤ يوماً في حال الخطأ في المبلغ أو التكرار غير المقصود، بمراسلتنا مع تفاصيل العملية."],
    ["التبرع المتكرر", "يمكنك إيقاف التبرع الشهري أو السنوي في أي وقت بمراسلتنا، ويسري الإيقاف من الدورة التالية."],
  ]},
};

export const Route = createFileRoute("/policies/$slug")({
  loader: ({ params }) => { const p = policies[params.slug]; if (!p) throw notFound(); return p; },
  head: ({ loaderData }) => ({
    meta: loaderData ? [
      { title: `${loaderData.title} | منظمة بريق` },
      { name: "description", content: `${loaderData.title} الخاصة بموقع منظمة بريق للتنمية والعمل المجتمعي.` },
      { property: "og:title", content: `${loaderData.title} | منظمة بريق` },
      { property: "og:description", content: `${loaderData.title} — منظمة بريق.` },
    ] : [{ title: "غير متاح" }, { name: "robots", content: "noindex" }],
  }),
  component: Policy,
});

function Policy() {
  const p = Route.useLoaderData();
  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      <div className="mb-6 flex flex-wrap gap-2 text-sm">
        {Object.entries(policies).map(([k, v]) => <Link key={k} to="/policies/$slug" params={{ slug: k }} className="rounded-full bg-muted px-3 py-1" activeProps={{ className: "bg-primary text-primary-foreground" }}>{v.title}</Link>)}
      </div>
      <h1 className="text-4xl text-secondary">{p.title}</h1>
      <div className="mt-8 space-y-6">
        {p.sections.map(([h, t]) => <section key={h}><h2 className="text-xl text-primary">{h}</h2><p className="mt-2 leading-8 text-muted-foreground">{t}</p></section>)}
      </div>
    </article>
  );
}
