create extension if not exists "pgcrypto";

create table if not exists properties (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  city text not null,
  state text not null,
  postal_code text not null,
  created_at timestamptz not null default now()
);

create table if not exists units (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  label text not null,
  floor text,
  bedrooms integer,
  created_at timestamptz not null default now()
);

create table if not exists app_users (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('tenant', 'manager')),
  email text not null,
  full_name text,
  property_id uuid references properties(id) on delete set null,
  unit_id uuid references units(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists vendors (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  approved boolean not null default false,
  reliability_score integer not null default 0,
  completion_rate integer not null default 0,
  notes text,
  next_window text,
  response_hours integer,
  trip_fee integer not null default 0,
  hourly_rate integer not null default 0,
  trades text[] not null default '{}',
  coverage_postal_codes text[] not null default '{}',
  city text,
  created_at timestamptz not null default now()
);

create table if not exists maintenance_issues (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  unit_id uuid not null references units(id) on delete cascade,
  tenant_id uuid references auth.users(id) on delete set null,
  category text not null,
  description text not null,
  tenant_availability text not null,
  permission_to_enter boolean not null default false,
  status text not null default 'new',
  urgency_level text not null default 'routine',
  ai_triage jsonb not null default '{}'::jsonb,
  escalation jsonb,
  vendor_recommendations jsonb not null default '[]'::jsonb,
  appointment_proposal jsonb,
  photo_paths text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists issue_messages (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references maintenance_issues(id) on delete cascade,
  role text not null check (role in ('assistant', 'tenant', 'manager')),
  text text not null,
  created_at timestamptz not null default now()
);

create table if not exists manager_approvals (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references maintenance_issues(id) on delete cascade,
  decision text not null check (decision in ('approved', 'rejected', 'modified')),
  approved_vendor_id uuid references vendors(id) on delete set null,
  approved_window text not null,
  notes text,
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz not null default now()
);

create table if not exists work_orders (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references maintenance_issues(id) on delete cascade,
  vendor_id uuid references vendors(id) on delete set null,
  trade text not null,
  scheduled_window text not null,
  estimated_cost integer not null default 0,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists notification_events (
  id uuid primary key default gen_random_uuid(),
  recipient_type text not null,
  channel text not null,
  template_key text not null,
  issue_id uuid references maintenance_issues(id) on delete cascade,
  work_order_id uuid references work_orders(id) on delete cascade,
  message_summary text not null,
  created_at timestamptz not null default now()
);

alter table properties enable row level security;
alter table units enable row level security;
alter table app_users enable row level security;
alter table maintenance_issues enable row level security;
alter table issue_messages enable row level security;
alter table manager_approvals enable row level security;
alter table work_orders enable row level security;
alter table notification_events enable row level security;

create policy "tenants can view their own issues"
on maintenance_issues
for select
using (
  exists (
    select 1
    from app_users
    where app_users.id = auth.uid()
      and app_users.role = 'tenant'
      and app_users.unit_id = maintenance_issues.unit_id
  )
);

create policy "managers can view assigned property issues"
on maintenance_issues
for select
using (
  exists (
    select 1
    from app_users
    where app_users.id = auth.uid()
      and app_users.role = 'manager'
      and app_users.property_id = maintenance_issues.property_id
  )
);

create or replace function approve_maintenance_issue(
  p_issue_id uuid,
  p_decision text,
  p_vendor_id uuid,
  p_window text,
  p_notes text
)
returns json
language plpgsql
security definer
as $$
declare
  updated_issue maintenance_issues;
  created_work_order work_orders;
begin
  update maintenance_issues
  set
    status = case when p_decision = 'rejected' then 'triaged' else 'scheduled' end
  where id = p_issue_id
  returning * into updated_issue;

  insert into manager_approvals (issue_id, decision, approved_vendor_id, approved_window, notes, approved_by)
  values (p_issue_id, p_decision, p_vendor_id, p_window, p_notes, auth.uid());

  insert into work_orders (issue_id, vendor_id, trade, scheduled_window, estimated_cost, status)
  values (
    p_issue_id,
    p_vendor_id,
    coalesce(updated_issue.ai_triage ->> 'recommendedTrade', 'general'),
    p_window,
    coalesce((updated_issue.appointment_proposal ->> 'estimatedCost')::integer, 0),
    case when p_decision = 'rejected' then 'pending' else 'scheduled' end
  )
  returning * into created_work_order;

  return json_build_object(
    'issue', row_to_json(updated_issue),
    'workOrder', row_to_json(created_work_order)
  );
end;
$$;
