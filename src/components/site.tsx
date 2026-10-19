import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Menu, X, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin, Heart, Star, Share2 } from "lucide-react";
import mark from "@/assets/mark.png";
import { contact } from "@/lib/data";

const nav = [
  { to: "/", label: "الرئيسية" },
  { to: "/about", label: "من نحن" },
  { to: "/programs", label: "البرامج" },
  { to: "/news", label: "الأخبار والأنشطة" },
  { to: "/partners", label: "الشراكات والتطوع" },
  { to: "/contact", label: "تواصل معنا" },
] as const;

export const socials = [
  { icon: Facebook, label: "فيسبوك", href: "https://facebook.com" },
  { icon: Twitter, label: "تويتر", href: "https://twitter.com" },
  { icon: Instagram, label: "إنستجرام", href: "https://instagram.com" },
  { icon: Linkedin, label: "لينكدإن", href: "https://linkedin.com" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-3">
          <img src={mark} alt="شعار منظمة بريق" className="h-12 w-auto" />
          <div className="leading-tight">
            <div className="font-display text-2xl text-primary">بريق</div>
            <div className="text-xs text-secondary">منظمة مجتمعية خيرية</div>
          </div>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className="rounded-full px-3 py-2 text-sm font-medium text-foreground/80 hover:text-primary"
              activeProps={{ className: "text-primary bg-accent" }} activeOptions={{ exact: n.to === "/" }}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/donate" className="btn btn-primary !px-5 !py-2.5 text-sm"><Heart className="h-4 w-4" />تبرّع</Link>
          <button className="rounded-full p-2 lg:hidden" aria-label="القائمة" onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t bg-background px-4 py-3 lg:hidden">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 font-medium hover:bg-accent">{n.label}</Link>
          ))}
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-secondary text-on-dark">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-background p-2"><img src={mark} alt="" className="h-12 w-auto" /></div>
            <div><div className="font-display text-2xl">بريق</div><div className="text-sm opacity-80">للتنمية والعمل المجتمعي</div></div>
          </div>
          <p className="mt-4 text-sm leading-7 opacity-80">منظمة طوعية سودانية غير ربحية. معاً.. نبني مجتمعاً أكثر إشراقاً.</p>
        </div>
        <div>
          <h3 className="mb-4 text-lg text-gold">روابط سريعة</h3>
          <ul className="space-y-2 text-sm opacity-90">
            {nav.slice(1).map((n) => <li key={n.to}><Link to={n.to} className="hover:text-gold">{n.label}</Link></li>)}
            <li><Link to="/donate" className="hover:text-gold">تبرّع الآن</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-lg text-gold">السياسات</h3>
          <ul className="space-y-2 text-sm opacity-90">
            <li><Link to="/policies/$slug" params={{ slug: "privacy" }} className="hover:text-gold">سياسة الخصوصية</Link></li>
            <li><Link to="/policies/$slug" params={{ slug: "terms" }} className="hover:text-gold">شروط الاستخدام</Link></li>
            <li><Link to="/policies/$slug" params={{ slug: "donations" }} className="hover:text-gold">سياسة التبرعات والاسترجاع</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-lg text-gold">تواصل معنا</h3>
          <ul className="space-y-3 text-sm opacity-90">
            <li className="flex gap-2"><Phone className="h-4 w-4 text-gold" /><a href={`tel:${contact.phone}`} dir="ltr">{contact.phone}</a></li>
            <li className="flex gap-2"><Mail className="h-4 w-4 text-gold" /><a href={`mailto:${contact.email}`}>{contact.email}</a></li>
            <li className="flex gap-2"><MapPin className="h-4 w-4 text-gold" />{contact.address}</li>
          </ul>
          <div className="mt-5 flex gap-2">
            {socials.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label} className="rounded-full border border-current/30 p-2 hover:bg-primary"><s.icon className="h-4 w-4" /></a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-current/15 py-5 text-center text-xs opacity-70">© {new Date().getFullYear()} منظمة بريق للتنمية والعمل المجتمعي. جميع الحقوق محفوظة.</div>
    </footer>
  );
}

export function PageHero({ title, subtitle, img }: { title: string; subtitle?: string; img: string }) {
  return (
    <section className="relative isolate overflow-hidden">
      <img src={img} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
      <div className="absolute inset-0 -z-10 bg-hero-overlay" />
      <div className="mx-auto max-w-7xl px-4 py-20 md:py-28 text-on-dark animate-rise">
        <Star className="mb-3 h-6 w-6 fill-current text-gold" />
        <h1 className="text-4xl md:text-5xl">{title}</h1>
        {subtitle && <p className="mt-4 max-w-2xl text-lg opacity-90">{subtitle}</p>}
      </div>
    </section>
  );
}

export function SectionTitle({ kicker, title, center = true }: { kicker?: string; title: string; center?: boolean }) {
  return (
    <div className={`mb-10 ${center ? "text-center" : ""}`}>
      {kicker && <div className={`star-divider mb-3 text-sm font-semibold ${center ? "justify-center" : ""}`}>✦ <span className="text-primary">{kicker}</span> ✦</div>}
      <h2 className="text-3xl md:text-4xl text-secondary">{title}</h2>
    </div>
  );
}

export function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e?.isIntersecting) { el.classList.add("in"); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(el); return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${className}`}>{children}</div>;
}

export function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e?.isIntersecting) return; io.disconnect();
      const start = performance.now();
      const tick = (t: number) => { const p = Math.min(1, (t - start) / 1600); setN(Math.round(to * (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    });
    io.observe(el); return () => io.disconnect();
  }, [to]);
  return <span ref={ref}>{n.toLocaleString("ar-EG")}{suffix}</span>;
}

export function ShareButtons({ title }: { title: string }) {
  const share = (net: string) => {
    const url = encodeURIComponent(window.location.href); const t = encodeURIComponent(title);
    const links: Record<string, string> = {
      fb: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      x: `https://twitter.com/intent/tweet?url=${url}&text=${t}`,
      wa: `https://wa.me/?text=${t}%20${url}`,
    };
    window.open(links[net], "_blank", "noopener");
  };
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Share2 className="h-4 w-4" />
      <button onClick={() => share("fb")} className="hover:text-primary">فيسبوك</button>·
      <button onClick={() => share("x")} className="hover:text-primary">تويتر</button>·
      <button onClick={() => share("wa")} className="hover:text-primary">واتساب</button>
    </div>
  );
}
