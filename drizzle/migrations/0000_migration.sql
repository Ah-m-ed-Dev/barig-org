
-- ROLES
create type public.app_role as enum ('super_admin','editor','donations_manager','volunteer_supervisor');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text, full_name text, created_at timestamptz not null default now()
);
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null, unique (user_id, role)
);
grant select, update on public.profiles to authenticated; grant all on public.profiles to service_role;
grant select on public.user_roles to authenticated; grant all on public.user_roles to service_role;
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id=_user_id and role=_role) $$;
create or replace function public.is_staff(_user_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id=_user_id) $$;
create or replace function public.can_manage(_user_id uuid, _role app_role) returns boolean
language sql stable security definer set search_path = public as $$
  select public.has_role(_user_id,'super_admin') or public.has_role(_user_id,_role) $$;

create policy "own or admin read profiles" on public.profiles for select to authenticated using (id = auth.uid() or public.has_role(auth.uid(),'super_admin'));
create policy "own update profile" on public.profiles for update to authenticated using (id = auth.uid());
create policy "own or admin read roles" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'super_admin'));

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id,email,full_name) values (new.id,new.email,coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)));
  if lower(new.email) = 'ahgadoora2002@gmail.com' then
    insert into public.user_roles(user_id,role) values (new.id,'super_admin') on conflict do nothing;
  end if;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- AUDIT + NOTIFICATIONS
create table public.audit_log (
  id bigserial primary key, user_id uuid, user_email text, action text not null, entity text not null,
  entity_id text, details jsonb, created_at timestamptz not null default now()
);
grant select, insert on public.audit_log to authenticated; grant all on public.audit_log to service_role;
grant usage on sequence public.audit_log_id_seq to authenticated;
alter table public.audit_log enable row level security;
create policy "admin reads audit" on public.audit_log for select to authenticated using (public.has_role(auth.uid(),'super_admin'));
create policy "staff writes audit" on public.audit_log for insert to authenticated with check (public.is_staff(auth.uid()) and user_id = auth.uid());

create or replace function public.audit_trigger() returns trigger
language plpgsql security definer set search_path = public as $$
declare rid text; em text;
begin
  if auth.uid() is null then return coalesce(new, old); end if;
  select email into em from public.profiles where id = auth.uid();
  rid := coalesce((to_jsonb(coalesce(new,old))->>'id'), '');
  insert into public.audit_log(user_id,user_email,action,entity,entity_id)
  values (auth.uid(), em, lower(tg_op), tg_table_name, rid);
  return coalesce(new, old);
end $$;

create table public.notifications (
  id bigserial primary key, type text not null, title text not null, link text,
  read boolean not null default false, created_at timestamptz not null default now()
);
grant select, update, delete on public.notifications to authenticated; grant all on public.notifications to service_role;
alter table public.notifications enable row level security;
create policy "staff read notif" on public.notifications for select to authenticated using (public.is_staff(auth.uid()));
create policy "staff update notif" on public.notifications for update to authenticated using (public.is_staff(auth.uid()));
create policy "staff delete notif" on public.notifications for delete to authenticated using (public.is_staff(auth.uid()));

create or replace function public.notify_trigger() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_table_name='donations' then insert into public.notifications(type,title,link) values ('donation','تبرع جديد من '||coalesce(new.donor_name,'متبرع')||' بقيمة '||new.amount||' '||new.currency,'/admin/donations');
  elsif tg_table_name='messages' then insert into public.notifications(type,title,link) values ('message','رسالة جديدة من '||new.name,'/admin/messages');
  elsif tg_table_name='volunteers' then insert into public.notifications(type,title,link) values ('volunteer','طلب تطوع جديد من '||new.name,'/admin/volunteers');
  elsif tg_table_name='partnerships' then insert into public.notifications(type,title,link) values ('partnership','طلب شراكة من '||coalesce(new.organization,new.name),'/admin/partnerships');
  end if;
  return new;
end $$;

-- CONTENT TABLES
create table public.programs (
  id uuid primary key default gen_random_uuid(), slug text unique not null, title text not null,
  short text default '', description text default '', image_url text,
  goals text[] not null default '{}', activities text[] not null default '{}', targets text[] not null default '{}', results text[] not null default '{}',
  gallery text[] not null default '{}', active boolean not null default true, sort_order int not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.campaigns (
  id uuid primary key default gen_random_uuid(), name text not null, description text default '', image_url text,
  goal_amount numeric not null default 0, start_date date, end_date date,
  status text not null default 'active', created_at timestamptz not null default now()
);
create table public.donations (
  id uuid primary key default gen_random_uuid(), ref serial, donor_name text, donor_email text, donor_phone text, country text default 'السودان',
  amount numeric not null check (amount > 0), currency text not null default 'USD', program text, campaign_id uuid references public.campaigns(id) on delete set null,
  frequency text not null default 'once', status text not null default 'pending', subscription_status text default 'active',
  payment_method text default 'manual', notes text, created_at timestamptz not null default now()
);
create table public.news (
  id uuid primary key default gen_random_uuid(), title text not null, slug text, excerpt text default '', content text default '',
  image_url text, program text, status text not null default 'draft', publish_at timestamptz default now(),
  seo_title text, seo_description text, seo_keywords text, og_image text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.gallery_images (
  id uuid primary key default gen_random_uuid(), url text not null, caption text default '', album text default 'عام',
  sort_order int not null default 0, created_at timestamptz not null default now()
);
create table public.messages (
  id uuid primary key default gen_random_uuid(), name text not null, email text not null, phone text, subject text default '',
  message text not null, status text not null default 'unread', important boolean not null default false, reply text,
  created_at timestamptz not null default now()
);
create table public.volunteers (
  id uuid primary key default gen_random_uuid(), name text not null, email text not null, phone text, specialty text default '',
  message text, status text not null default 'pending', notes text, created_at timestamptz not null default now()
);
create table public.volunteer_opportunities (
  id uuid primary key default gen_random_uuid(), title text not null, description text default '', requirements text default '',
  date date, registrations int not null default 0, active boolean not null default true, created_at timestamptz not null default now()
);
create table public.partnerships (
  id uuid primary key default gen_random_uuid(), name text not null, organization text, email text not null, phone text,
  message text, status text not null default 'pending', notes text, created_at timestamptz not null default now()
);
create table public.team_members (
  id uuid primary key default gen_random_uuid(), name text not null, role text default '', bio text default '', photo_url text,
  visible boolean not null default true, sort_order int not null default 0, created_at timestamptz not null default now()
);
create table public.site_values (
  id uuid primary key default gen_random_uuid(), text text not null, sort_order int not null default 0, created_at timestamptz not null default now()
);
create table public.site_goals (
  id uuid primary key default gen_random_uuid(), text text not null, sort_order int not null default 0, created_at timestamptz not null default now()
);
create table public.stats (
  id uuid primary key default gen_random_uuid(), label text not null, value int not null default 0, suffix text default '+',
  sort_order int not null default 0, created_at timestamptz not null default now()
);
create table public.testimonials (
  id uuid primary key default gen_random_uuid(), name text not null, place text default '', text text not null, photo_url text,
  program text, visible boolean not null default true, created_at timestamptz not null default now()
);
create table public.site_pages (
  slug text primary key, title text not null, content jsonb not null default '{}', updated_at timestamptz not null default now()
);
create table public.site_settings (
  key text primary key, value jsonb not null default '{}', updated_at timestamptz not null default now()
);

-- GRANTS
grant select on public.programs, public.campaigns, public.news, public.gallery_images, public.team_members, public.site_values, public.site_goals, public.stats, public.testimonials, public.site_pages, public.site_settings to anon;
grant insert on public.donations, public.messages, public.volunteers, public.partnerships to anon;
grant select, insert, update, delete on public.programs, public.campaigns, public.donations, public.news, public.gallery_images, public.messages, public.volunteers, public.volunteer_opportunities, public.partnerships, public.team_members, public.site_values, public.site_goals, public.stats, public.testimonials, public.site_pages, public.site_settings to authenticated;
grant all on public.programs, public.campaigns, public.donations, public.news, public.gallery_images, public.messages, public.volunteers, public.volunteer_opportunities, public.partnerships, public.team_members, public.site_values, public.site_goals, public.stats, public.testimonials, public.site_pages, public.site_settings to service_role;
grant usage on sequence public.donations_ref_seq to anon, authenticated;
grant select on public.volunteer_opportunities to anon;

alter table public.programs enable row level security;
alter table public.campaigns enable row level security;
alter table public.donations enable row level security;
alter table public.news enable row level security;
alter table public.gallery_images enable row level security;
alter table public.messages enable row level security;
alter table public.volunteers enable row level security;
alter table public.volunteer_opportunities enable row level security;
alter table public.partnerships enable row level security;
alter table public.team_members enable row level security;
alter table public.site_values enable row level security;
alter table public.site_goals enable row level security;
alter table public.stats enable row level security;
alter table public.testimonials enable row level security;
alter table public.site_pages enable row level security;
alter table public.site_settings enable row level security;

-- public reads
create policy "public programs" on public.programs for select using (active or public.is_staff(auth.uid()));
create policy "public campaigns" on public.campaigns for select using (true);
create policy "public news" on public.news for select using ((status='published' or (status='scheduled' and publish_at <= now())) or public.is_staff(auth.uid()));
create policy "public gallery" on public.gallery_images for select using (true);
create policy "public team" on public.team_members for select using (visible or public.is_staff(auth.uid()));
create policy "public values" on public.site_values for select using (true);
create policy "public goals" on public.site_goals for select using (true);
create policy "public stats" on public.stats for select using (true);
create policy "public testimonials" on public.testimonials for select using (visible or public.is_staff(auth.uid()));
create policy "public pages" on public.site_pages for select using (true);
create policy "public settings" on public.site_settings for select using (true);
create policy "public opportunities" on public.volunteer_opportunities for select using (active or public.is_staff(auth.uid()));

-- public submissions
create policy "submit donation" on public.donations for insert to anon, authenticated with check (status='pending' and amount > 0 and amount < 1000000);
create policy "submit message" on public.messages for insert to anon, authenticated with check (status='unread' and length(message) <= 2000);
create policy "submit volunteer" on public.volunteers for insert to anon, authenticated with check (status='pending');
create policy "submit partnership" on public.partnerships for insert to anon, authenticated with check (status='pending');

-- staff management by role
create policy "donations mgr" on public.donations for select to authenticated using (public.can_manage(auth.uid(),'donations_manager'));
create policy "donations mgr upd" on public.donations for update to authenticated using (public.can_manage(auth.uid(),'donations_manager'));
create policy "donations mgr del" on public.donations for delete to authenticated using (public.can_manage(auth.uid(),'donations_manager'));
create policy "campaigns mgr" on public.campaigns for all to authenticated using (public.can_manage(auth.uid(),'donations_manager')) with check (public.can_manage(auth.uid(),'donations_manager'));
create policy "programs ed" on public.programs for all to authenticated using (public.can_manage(auth.uid(),'editor')) with check (public.can_manage(auth.uid(),'editor'));
create policy "news ed" on public.news for all to authenticated using (public.can_manage(auth.uid(),'editor')) with check (public.can_manage(auth.uid(),'editor'));
create policy "gallery ed" on public.gallery_images for all to authenticated using (public.can_manage(auth.uid(),'editor')) with check (public.can_manage(auth.uid(),'editor'));
create policy "volunteers sup" on public.volunteers for select to authenticated using (public.can_manage(auth.uid(),'volunteer_supervisor'));
create policy "volunteers sup upd" on public.volunteers for update to authenticated using (public.can_manage(auth.uid(),'volunteer_supervisor'));
create policy "volunteers sup del" on public.volunteers for delete to authenticated using (public.can_manage(auth.uid(),'volunteer_supervisor'));
create policy "opps sup" on public.volunteer_opportunities for all to authenticated using (public.can_manage(auth.uid(),'volunteer_supervisor')) with check (public.can_manage(auth.uid(),'volunteer_supervisor'));
create policy "messages admin" on public.messages for select to authenticated using (public.has_role(auth.uid(),'super_admin'));
create policy "messages admin upd" on public.messages for update to authenticated using (public.has_role(auth.uid(),'super_admin'));
create policy "messages admin del" on public.messages for delete to authenticated using (public.has_role(auth.uid(),'super_admin'));
create policy "partner admin" on public.partnerships for select to authenticated using (public.has_role(auth.uid(),'super_admin'));
create policy "partner admin upd" on public.partnerships for update to authenticated using (public.has_role(auth.uid(),'super_admin'));
create policy "partner admin del" on public.partnerships for delete to authenticated using (public.has_role(auth.uid(),'super_admin'));
create policy "team admin" on public.team_members for all to authenticated using (public.has_role(auth.uid(),'super_admin')) with check (public.has_role(auth.uid(),'super_admin'));
create policy "values admin" on public.site_values for all to authenticated using (public.has_role(auth.uid(),'super_admin')) with check (public.has_role(auth.uid(),'super_admin'));
create policy "goals admin" on public.site_goals for all to authenticated using (public.has_role(auth.uid(),'super_admin')) with check (public.has_role(auth.uid(),'super_admin'));
create policy "stats admin" on public.stats for all to authenticated using (public.has_role(auth.uid(),'super_admin')) with check (public.has_role(auth.uid(),'super_admin'));
create policy "testi admin" on public.testimonials for all to authenticated using (public.has_role(auth.uid(),'super_admin')) with check (public.has_role(auth.uid(),'super_admin'));
create policy "pages admin" on public.site_pages for all to authenticated using (public.has_role(auth.uid(),'super_admin')) with check (public.has_role(auth.uid(),'super_admin'));
create policy "settings admin" on public.site_settings for all to authenticated using (public.has_role(auth.uid(),'super_admin')) with check (public.has_role(auth.uid(),'super_admin'));

-- triggers
do $$ declare t text; begin
  foreach t in array array['programs','campaigns','donations','news','gallery_images','messages','volunteers','volunteer_opportunities','partnerships','team_members','site_values','site_goals','stats','testimonials','site_pages','site_settings'] loop
    execute format('create trigger audit_%1$s after insert or update or delete on public.%1$s for each row execute function public.audit_trigger()', t);
  end loop;
  foreach t in array array['donations','messages','volunteers','partnerships'] loop
    execute format('create trigger notify_%1$s after insert on public.%1$s for each row execute function public.notify_trigger()', t);
  end loop;
end $$;

alter publication supabase_realtime add table public.notifications;

-- SEED
insert into public.programs(slug,title,short,description,activities,targets,results,sort_order) values
('health','بريق للصحة المجتمعية','رعاية صحية أولية وتوعية تصل إلى القرى والمخيمات.','يقدّم البرنامج خدمات الرعاية الصحية الأولية والعيادات المتنقلة وحملات التوعية بالصحة العامة والتغذية والمياه والإصحاح البيئي.','{"عيادات متنقلة","حملات تطعيم وتوعية","دعم التغذية للأمهات والأطفال","توعية بالنظافة والمياه الآمنة"}','{"الأمهات والأطفال","النازحون","كبار السن","المجتمعات الريفية"}','{"+12,000 استشارة طبية","+40 حملة توعوية"}',1),
('training','بريق للتدريب والتمكين','مهارات مهنية ورقمية تفتح أبواب العمل والإنتاج.','يبني قدرات الأفراد والمنظمات القاعدية عبر برامج تدريبية مهنية ورقمية وقيادية تقود إلى سبل عيش كريمة.','{"تدريب مهني وحرفي","مهارات رقمية","ريادة الأعمال","بناء قدرات المنظمات"}','{"الشباب الباحثون عن عمل","النساء المعيلات","المنظمات المجتمعية"}','{"+2,500 متدرب","+300 مشروع صغير"}',2),
('sanad','بريق سند','إغاثة ودعم عاجل للأسر الأشد احتياجاً.','برنامج الاستجابة الإنسانية والدعم الاجتماعي، يوزّع السلال الغذائية والمواد الإيوائية ويقدّم الدعم النفسي والاجتماعي.','{"سلال غذائية","مواد إيواء","كفالة أسر وأيتام","دعم نفسي واجتماعي"}','{"الأسر النازحة","الأيتام والأرامل","ذوو الإعاقة"}','{"+8,000 سلة غذائية","+600 أسرة مكفولة"}',3),
('development','بريق للتنمية المجتمعية','مشاريع بنية مجتمعية تعزز الاستقرار والتكافل.','يعمل مع المجتمعات المحلية لتحديد أولوياتها وتنفيذ مشاريع المياه والتعليم والبنية الأساسية بمشاركة الأهالي.','{"آبار ومصادر مياه","تأهيل مدارس ومراكز","لجان مجتمعية","مبادرات السلام المجتمعي"}','{"القرى والأحياء الطرفية","اللجان المحلية"}','{"+35 مشروع مياه","+20 مدرسة مؤهلة"}',4),
('youth','بريق للشباب','مساحات للقيادة والإبداع والمبادرة.','يمكّن الشباب من قيادة التغيير عبر برامج القيادة والحوار والمبادرات الشبابية والأنشطة الثقافية والرياضية.','{"أكاديمية القيادة","منح المبادرات","منتديات حوار","أنشطة رياضية وثقافية"}','{"الشباب 15–35 سنة","طلاب الجامعات"}','{"+1,200 شاب وشابة","+60 مبادرة شبابية"}',5),
('women','بريق للمرأة والأسرة','تمكين اقتصادي واجتماعي للمرأة واستقرار للأسرة.','يدعم المرأة اقتصادياً واجتماعياً ويعزز التماسك الأسري عبر التدريب والتمويل الأصغر والإرشاد.','{"مجموعات ادخار نسائية","تمويل أصغر","محو الأمية","إرشاد أسري"}','{"النساء المعيلات","الفتيات","الأسر الهشة"}','{"+900 امرأة مستفيدة","+45 مجموعة ادخار"}',6),
('child','بريق للطفل','تعليم وحماية ولعب آمن لكل طفل.','يحمي حقوق الطفل ويدعم تعليمه عبر توفير الحقائب المدرسية والمساحات الصديقة للطفل وبرامج الحماية.','{"حقائب مدرسية","مساحات صديقة للطفل","حماية الطفل","دعم تعليمي"}','{"الأطفال في سن الدراسة","الأطفال النازحون"}','{"+5,000 طفل","+3,000 حقيبة مدرسية"}',7),
('green','بريق الأخضر','تشجير وحماية بيئة من أجل مستقبل أنظف.','يعزز الوعي البيئي ومواجهة التصحر عبر حملات التشجير والزراعة المستدامة وإدارة النفايات.','{"حملات تشجير","زراعة مستدامة","توعية بيئية","إدارة النفايات"}','{"المدارس","المزارعون","الشباب"}','{"+10,000 شجرة","+25 مدرسة خضراء"}',8),
('volunteer','بريق التطوعي','شبكة متطوعين تصنع الفرق في الميدان.','يستقطب المتطوعين ويدربهم وينظم مشاركتهم في الأنشطة الميدانية، ترسيخاً لثقافة العطاء.','{"استقطاب وتدريب المتطوعين","حملات ميدانية","أيام تطوعية","تكريم المتطوعين"}','{"الطلاب","المهنيون","كل راغب في العطاء"}','{"+50 متطوعاً نشطاً","+200 يوم تطوعي"}',9);

insert into public.news(title,excerpt,content,program,status,publish_at) values
('توزيع 1,500 سلة غذائية على الأسر النازحة في نيالا','نفّذ فريق بريق سند حملة توزيع واسعة شملت أحياء ومخيمات في محيط نيالا.','<p>نفّذ فريق بريق سند حملة توزيع واسعة شملت أحياء ومخيمات في محيط نيالا.</p>','بريق سند','published','2026-10-05'),
('عيادة متنقلة تقدم 800 استشارة في أسبوع','وصلت العيادة المتنقلة إلى خمس قرى، مع حملة توعية بالتغذية وصحة الأم.','<p>وصلت العيادة المتنقلة إلى خمس قرى.</p>','بريق للصحة المجتمعية','published','2026-09-21'),
('تخريج الدفعة الرابعة من برنامج المهارات الرقمية','تخرّج 120 شاباً وشابة بمهارات رقمية تؤهلهم لسوق العمل الحر.','<p>تخرّج 120 شاباً وشابة.</p>','بريق للتدريب والتمكين','published','2026-09-10'),
('حملة العودة إلى المدارس: 3,000 حقيبة','وزّعنا حقائب ومستلزمات مدرسية على أطفال المدارس في جنوب دارفور.','<p>وزّعنا حقائب ومستلزمات مدرسية.</p>','بريق للطفل','published','2026-08-28'),
('غرس 2,000 شجرة في يوم البيئة','شارك متطوعون وطلاب في حملة تشجير واسعة لمواجهة التصحر.','<p>حملة تشجير واسعة.</p>','بريق الأخضر','published','2026-08-12'),
('إطلاق 15 مجموعة ادخار نسائية جديدة','مجموعات تمنح النساء أدوات الادخار والإقراض لبدء مشاريعهن.','<p>مجموعات ادخار نسائية.</p>','بريق للمرأة والأسرة','published','2026-07-30');

insert into public.site_values(text,sort_order) select v, ord from unnest(array['النزاهة','الشفافية','المسؤولية','العمل التطوعي','احترام كرامة الإنسان','المشاركة المجتمعية','المساواة وعدم التمييز','العمل المؤسسي','الاستدامة','احترام القوانين']) with ordinality as x(v,ord);
insert into public.site_goals(text,sort_order) select v, ord from unnest(array['تحسين الخدمات الصحية الأولية في المجتمعات المحلية','نشر الوعي الصحي والبيئي','تمكين الشباب اقتصادياً واجتماعياً','تمكين المرأة ودعم استقرار الأسرة','حماية حقوق الطفل ودعم تعليمه','تقديم الإغاثة والدعم للفئات الأشد احتياجاً','بناء قدرات الأفراد والمنظمات المجتمعية','نشر ثقافة العمل التطوعي','تعزيز السلام والتعايش المجتمعي','دعم مشاريع المياه والإصحاح البيئي','مكافحة التصحر وحماية البيئة','دعم سبل العيش والمشاريع الصغيرة','تعزيز المشاركة المجتمعية في التنمية','بناء الشراكات مع الجهات المحلية والدولية','تحقيق الشفافية والحوكمة الرشيدة في العمل الخيري']) with ordinality as x(v,ord);

insert into public.team_members(name,role,sort_order) values ('رئيس مجلس الإدارة','القيادة والحوكمة',1),('المدير التنفيذي','الإدارة والعمليات',2),('مدير البرامج','التخطيط والتنفيذ',3),('مسؤول المالية','الشفافية والتقارير',4);
insert into public.stats(label,value,suffix,sort_order) values ('مشروع منفّذ',120,'+',1),('مستفيد',25000,'+',2),('متطوع',50,'+',3),('سنوات خبرة',5,'+',4);
insert into public.testimonials(name,place,text) values
('أم أحمد','نيالا','وصلتنا السلة الغذائية في أصعب الأوقات. شكراً لبريق على الإحساس بنا.'),
('محمد آدم','متدرب رقمي','بعد التدريب بدأت العمل الحر من بيتي وأصبحت أعيل أسرتي.'),
('فاطمة إسحاق','مجموعة ادخار','المجموعة غيّرت حياتي، فتحت محلاً صغيراً وأصبح لي دخل.');

insert into public.site_pages(slug,title,content) values
('about','من نحن','{"vision":"مجتمع سوداني متماسك ينعم بالكرامة والتنمية المستدامة.","mission":"نعمل مع المجتمعات المحلية لتقديم خدمات صحية وتعليمية وإغاثية وتنموية بشفافية ومسؤولية."}'),
('privacy','سياسة الخصوصية','{"body":"نحترم خصوصيتك ونحمي بياناتك الشخصية ولا نشاركها مع أي طرف ثالث دون إذنك."}'),
('terms','الشروط والأحكام','{"body":"باستخدامك لموقع منظمة بريق فإنك توافق على هذه الشروط."}'),
('refund','سياسة التبرع والاسترداد','{"body":"يمكن طلب استرداد التبرع خلال 14 يوماً من تاريخه بالتواصل معنا."}');

insert into public.site_settings(key,value) values
('general','{"name":"منظمة بريق للتنمية والعمل المجتمعي","phone":"+24916556596","email":"bariqorg26@gmail.com","address":"نيالا، جنوب دارفور، السودان","facebook":"","twitter":"","instagram":"","linkedin":"","map_embed":"","seo_title":"منظمة بريق للتنمية والعمل المجتمعي","seo_description":"منظمة طوعية سودانية غير ربحية"}'),
('donations','{"currencies":["USD","EUR","SDG"],"amounts":[50,100,250,500],"min_amount":5,"stripe":false,"paypal":false,"local_wallets":false}'),
('notifications','{"recipient":"bariqorg26@gmail.com","donation":true,"message":true,"volunteer":true,"partnership":true,"session_timeout":30}');

insert into public.campaigns(name,description,goal_amount,start_date,end_date,status) values
('حملة الشتاء الدافئ','بطانيات وملابس شتوية للأسر النازحة',20000,'2026-10-01','2026-12-31','active'),
('العودة إلى المدارس 2026','حقائب ومستلزمات مدرسية',10000,'2026-07-01','2026-09-30','closed');

insert into public.donations(donor_name,donor_email,country,amount,currency,program,frequency,status,payment_method,created_at)
select (array['أحمد علي','سارة محمد','عمر حسن','منى إبراهيم','خالد يوسف','Emily Clark','هالة عثمان','Yusuf Kaya'])[1+floor(random()*8)::int],
 'donor'||g||'@example.com',
 (array['السودان','السعودية','الإمارات','قطر','المملكة المتحدة','الولايات المتحدة','مصر','تركيا'])[1+floor(random()*8)::int],
 (array[25,50,100,250,500,75,150])[1+floor(random()*7)::int],
 (array['USD','USD','USD','EUR','SDG'])[1+floor(random()*5)::int],
 (array['بريق سند','بريق للصحة المجتمعية','بريق للطفل','بريق للتدريب والتمكين','بريق الأخضر','بريق للمرأة والأسرة'])[1+floor(random()*6)::int],
 (array['once','once','once','monthly','yearly'])[1+floor(random()*5)::int],
 (array['completed','completed','completed','completed','pending','cancelled'])[1+floor(random()*6)::int],
 (array['card','bank','wallet','manual'])[1+floor(random()*4)::int],
 now() - (random()*365 || ' days')::interval
from generate_series(1,120) g;

insert into public.messages(name,email,subject,message) values
('علي آدم','ali@example.com','استفسار عن التطوع','أرغب في معرفة كيفية الانضمام كمتطوع في برنامج الصحة.'),
('Sarah Lee','sarah@example.com','شراكة','We would like to explore a partnership on education.');
insert into public.volunteers(name,email,phone,specialty,message) values ('محمد عثمان','m.osman@example.com','+249900000000','الصحة','طبيب عام متاح أيام السبت.');
insert into public.partnerships(name,organization,email,message) values ('ليلى حسن','مؤسسة الأمل','info@amal.example','نرغب في دعم برنامج الطفل.');
