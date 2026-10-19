import { z } from "zod";
import { toast } from "sonner";
import type { FormEvent, ReactNode } from "react";

export function SimpleForm({ schema, success, children, submit }: {
  schema: z.ZodTypeAny; success: string; children: ReactNode; submit: string;
}) {
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const r = schema.safeParse(data);
    if (!r.success) return toast.error(r.error.issues[0].message);
    toast.success(success);
    e.currentTarget.reset();
  };
  return (
    <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
      {children}
      <button className="btn btn-primary sm:col-span-2">{submit}</button>
    </form>
  );
}

export const name = z.string().trim().min(2, "الاسم مطلوب").max(100);
export const email = z.string().trim().email("بريد إلكتروني غير صالح").max(255);
export const phone = z.string().trim().max(20).optional();
export const message = z.string().trim().min(5, "الرسالة قصيرة جداً").max(1000, "الرسالة طويلة جداً");
