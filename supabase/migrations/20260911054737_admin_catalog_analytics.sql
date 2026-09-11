create table public.admin_users(user_id uuid primary key references auth.users(id) on delete cascade, created_at timestamptz not null default now());
alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated;
grant all on public.admin_users to service_role;

create table public.products(
 id text primary key, kind text not null check(kind in ('category','product')), slug text not null check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 name text not null, family text not null, summary text not null default '', description text not null default '', price text not null default '', moq text not null default '',
 sizes text[] not null default '{}', grades text[] not null default '{}', uses text[] not null default '{}', branded boolean not null default true,
 images text[] not null default '{}', image text not null default '', eyebrow text not null default '', delivery text not null default '', badge text,
 status text not null default 'draft' check(status in ('published','draft','archived')), seo_title text not null default '',seo_description text not null default '',
 sort_order integer not null default 0,updated_at timestamptz not null default now(),unique(kind,slug)
);
alter table public.products enable row level security;
revoke all on public.products from anon,authenticated;
grant select on public.products to anon,authenticated;
grant all on public.products to service_role;
create policy published_catalog on public.products for select to anon,authenticated using(status='published');
create index products_status_order on public.products(status,sort_order);

create table public.visitor_sessions(
 id uuid primary key, started_at timestamptz not null default now(),last_seen timestamptz not null default now(),last_timed_at timestamptz not null default now(),
 city text not null default 'Unknown',state text not null default 'Unknown',country text not null default 'Unknown',
 device text not null default 'Desktop',referrer text not null default 'Direct',source text not null default 'Direct',
 active_seconds integer not null default 0,page_views integer not null default 0,cart_events integer not null default 0,
 current_path text not null default '/', current_product text not null default '', event_count integer not null default 0
);
create table public.analytics_events(
 id uuid primary key,session_id uuid not null references public.visitor_sessions(id) on delete cascade,
 created_at timestamptz not null default now(),type text not null check(type in ('page_view','product_view','add_to_cart','remove_from_cart','whatsapp_click','search','engaged','heartbeat')),
 path text not null,product text not null default '',seconds integer not null default 0 check(seconds between 0 and 30),search_term text not null default ''
);
alter table public.visitor_sessions enable row level security;
alter table public.analytics_events enable row level security;
revoke all on public.visitor_sessions,public.analytics_events from anon,authenticated;
grant all on public.visitor_sessions,public.analytics_events to service_role;
create index sessions_last_seen on public.visitor_sessions(last_seen desc);
create index sessions_started on public.visitor_sessions(started_at desc);
create index events_session_date on public.analytics_events(session_id,created_at desc);
create index events_type_date on public.analytics_events(type,created_at desc);
create index events_product on public.analytics_events(product,created_at desc);

-- Only the server can ingest events. Lock each session to serialize deduplication and counters.
create function public.record_event(payload jsonb) returns void language plpgsql security invoker set search_path='' as $$
declare sid uuid=(payload->>'session_id')::uuid; eid uuid=(payload->>'id')::uuid; sess public.visitor_sessions; elapsed integer;
begin
 insert into public.visitor_sessions(id,city,state,country,device,referrer,source)
 values(sid,coalesce(payload->>'city','Unknown'),coalesce(payload->>'state','Unknown'),coalesce(payload->>'country','Unknown'),coalesce(payload->>'device','Desktop'),coalesce(payload->>'referrer','Direct'),coalesce(payload->>'source','Direct')) on conflict do nothing;
 select * into sess from public.visitor_sessions where id=sid for update;
 if sess.event_count>=4000 or exists(select 1 from public.analytics_events where id=eid) then return; end if;
 if (select count(*) from public.analytics_events where session_id=sid and created_at>now()-interval '1 minute')>=40 then return; end if;
 elapsed=least(coalesce((payload->>'seconds')::integer,0),30,greatest(0,floor(extract(epoch from now()-sess.last_timed_at))::integer));
 insert into public.analytics_events(id,session_id,type,path,product,seconds,search_term) values(eid,sid,payload->>'type',payload->>'path',coalesce(payload->>'product',''),elapsed,coalesce(payload->>'search_term',''));
 update public.visitor_sessions set last_seen=now(),last_timed_at=case when payload->>'type'='heartbeat' then now() else last_timed_at end,active_seconds=active_seconds+elapsed,
 page_views=page_views+case when payload->>'type'='page_view' then 1 else 0 end,
 cart_events=cart_events+case when payload->>'type'='add_to_cart' then 1 else 0 end,
 current_path=payload->>'path',current_product=case when payload->>'type' in ('page_view','product_view','heartbeat') then coalesce(payload->>'product','') else current_product end,event_count=event_count+1 where id=sid;
 if sess.active_seconds<120 and sess.active_seconds+elapsed>=120 then
  insert into public.analytics_events(id,session_id,type,path,product) values(gen_random_uuid(),sid,'engaged',payload->>'path',coalesce(payload->>'product',''));
 end if;
end $$;
revoke all on function public.record_event(jsonb) from public,anon,authenticated;
grant execute on function public.record_event(jsonb) to service_role;

create function public.analytics_report(filters jsonb) returns jsonb language sql stable security invoker set search_path='' as $$
with selected as (
 select s.* from public.visitor_sessions s where s.started_at >= (filters->>'from')::timestamptz and s.started_at < (filters->>'to')::timestamptz
 and (coalesce(filters->>'city','')='' or s.city=filters->>'city') and (coalesce(filters->>'state','')='' or s.state=filters->>'state')
 and (coalesce(filters->>'device','')='' or s.device=filters->>'device')
 and (coalesce(filters->>'product','')='' or exists(select 1 from public.analytics_events e where e.session_id=s.id and e.product=filters->>'product'))
 and (coalesce(filters->>'event','')='' or exists(select 1 from public.analytics_events e where e.session_id=s.id and e.type=filters->>'event'))
), events as (select e.* from public.analytics_events e join selected s on s.id=e.session_id),
daily as (select to_char(started_at at time zone 'Asia/Kolkata','YYYY-MM-DD') as day,count(*) sessions,sum(page_views) views from selected group by 1 order by 1),
locations as (select city,state,country,count(*) sessions,sum(cart_events) carts from selected group by 1,2,3 order by sessions desc limit 50),
popular as (select product,count(*) filter(where type='product_view') views,count(distinct session_id) visitors,count(*) filter(where type='add_to_cart') carts,sum(seconds) active_seconds from events where product<>'' group by 1 order by views desc limit 50),
sources as (select source,count(*) sessions from selected group by 1 order by sessions desc limit 30),
searches as (select search_term term,count(*) searches,count(distinct session_id) sessions from events where type='search' and search_term<>'' group by 1 order by searches desc limit 50)
select jsonb_build_object(
 'summary',(select jsonb_build_object('sessions',count(*),'live',count(*) filter(where last_seen>now()-interval '60 seconds'),'pageViews',coalesce(sum(page_views),0),'cartAdds',coalesce(sum(cart_events),0),'avgSeconds',coalesce(round(avg(active_seconds)),0),'cartSessions',count(*) filter(where cart_events>0),'engagedSessions',count(*) filter(where active_seconds>=120)) from selected),
 'daily',coalesce((select jsonb_agg(daily) from daily),'[]'::jsonb),
 'locations',coalesce((select jsonb_agg(locations) from locations),'[]'::jsonb),
 'products',coalesce((select jsonb_agg(popular) from popular),'[]'::jsonb),
 'sources',coalesce((select jsonb_agg(sources) from sources),'[]'::jsonb),
 'searches',coalesce((select jsonb_agg(s) from searches s),'[]'::jsonb),
 'funnel',(select jsonb_build_object('visited',count(*),'viewedProduct',count(*) filter(where exists(select 1 from events e where e.session_id=s.id and e.type='product_view')),'addedToCart',count(*) filter(where cart_events>0),'openedWhatsApp',count(*) filter(where exists(select 1 from events e where e.session_id=s.id and e.type='whatsapp_click'))) from selected s),
 'sessions',coalesce((select jsonb_agg(t) from (select * from selected order by last_seen desc limit 100 offset coalesce((filters->>'offset')::integer,0)) t),'[]'::jsonb),
 'notifications',coalesce((select jsonb_agg(t) from (select e.id,e.created_at,e.type,e.product,e.session_id,s.city,s.state from events e join selected s on s.id=e.session_id where e.type in ('add_to_cart','whatsapp_click','engaged') order by e.created_at desc limit 30) t),'[]'::jsonb)
); $$;
revoke all on function public.analytics_report(jsonb) from public,anon,authenticated;
grant execute on function public.analytics_report(jsonb) to service_role;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('product-images','product-images',true,8388608,array['image/jpeg','image/png','image/webp','image/avif']) on conflict(id) do nothing;
-- Public bucket serves image URLs; authenticated uploads only happen through the authorized server API.
