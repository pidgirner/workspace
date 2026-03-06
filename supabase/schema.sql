-- Team Workspace baseline schema for Supabase (PostgreSQL)
-- Includes: auth profile, teams, messaging, tasks, calendar, mail integration, notifications.

create extension if not exists pgcrypto;

-- ====== Core users / teams ======
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.team_members (
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'member', 'guest')),
  joined_at timestamptz not null default now(),
  primary key (team_id, user_id)
);

-- ====== Messaging ======
create table if not exists public.channels (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  name text not null,
  type text not null check (type in ('public', 'private', 'dm')),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.channels(id) on delete cascade,
  sender_id uuid not null references public.profiles(id),
  body text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  edited_at timestamptz
);

create index if not exists idx_messages_channel_created_at on public.messages(channel_id, created_at desc);

-- ====== Tasks ======
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done', 'blocked')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'critical')),
  assignee_id uuid references public.profiles(id),
  due_at timestamptz,
  source text not null default 'manual' check (source in ('manual', 'email', 'automation')),
  source_ref text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tasks_project_status on public.tasks(project_id, status);

-- ====== Calendar ======
create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  timezone text not null default 'UTC',
  organizer_id uuid not null references public.profiles(id),
  source text not null default 'manual' check (source in ('manual', 'email', 'integration')),
  source_ref text,
  created_at timestamptz not null default now()
);

create table if not exists public.calendar_event_attendees (
  event_id uuid not null references public.calendar_events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  response text not null default 'needs_action' check (response in ('accepted', 'declined', 'tentative', 'needs_action')),
  primary key (event_id, user_id)
);

-- ====== Mail integration ======
create table if not exists public.mailboxes (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  email text not null,
  incoming_protocol text not null check (incoming_protocol in ('imap', 'pop3')),
  incoming_host text not null,
  incoming_port int not null,
  incoming_security text not null check (incoming_security in ('ssl', 'starttls', 'none')),
  outgoing_host text not null,
  outgoing_port int not null,
  outgoing_security text not null check (outgoing_security in ('ssl', 'starttls', 'none')),
  username text not null,
  password_ciphertext text not null,
  is_active boolean not null default true,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create unique index if not exists idx_mailboxes_team_email on public.mailboxes(team_id, email);

create table if not exists public.mail_events (
  id uuid primary key default gen_random_uuid(),
  mailbox_id uuid not null references public.mailboxes(id) on delete cascade,
  provider text not null default 'beget',
  message_id text not null,
  thread_id text,
  from_json jsonb not null,
  to_json jsonb not null,
  subject text,
  preview text,
  received_at timestamptz not null,
  has_attachments boolean not null default false,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (mailbox_id, message_id)
);

create table if not exists public.mail_routing_rules (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  name text not null,
  is_active boolean not null default true,
  condition_json jsonb not null,
  action_json jsonb not null,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

-- ====== Notifications ======
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null,
  payload jsonb not null default '{}'::jsonb,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user_created_at on public.notifications(user_id, created_at desc);

-- ====== Timestamp helper ======
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_tasks_set_updated_at on public.tasks;
create trigger trg_tasks_set_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

-- ====== Enable RLS ======
alter table public.profiles enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.channels enable row level security;
alter table public.messages enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.calendar_events enable row level security;
alter table public.calendar_event_attendees enable row level security;
alter table public.mailboxes enable row level security;
alter table public.mail_events enable row level security;
alter table public.mail_routing_rules enable row level security;
alter table public.notifications enable row level security;

-- ====== Minimal policies (team-scoped via membership) ======
create policy if not exists "profiles_select_self" on public.profiles
for select using (id = auth.uid());

create policy if not exists "profiles_update_self" on public.profiles
for update using (id = auth.uid());

create policy if not exists "teams_member_read" on public.teams
for select using (
  exists (
    select 1 from public.team_members tm
    where tm.team_id = teams.id and tm.user_id = auth.uid()
  )
);

create policy if not exists "team_members_member_read" on public.team_members
for select using (
  exists (
    select 1 from public.team_members tm
    where tm.team_id = team_members.team_id and tm.user_id = auth.uid()
  )
);

create policy if not exists "messages_member_read" on public.messages
for select using (
  exists (
    select 1
    from public.channels c
    join public.team_members tm on tm.team_id = c.team_id
    where c.id = messages.channel_id and tm.user_id = auth.uid()
  )
);

create policy if not exists "messages_member_insert" on public.messages
for insert with check (
  sender_id = auth.uid()
  and exists (
    select 1
    from public.channels c
    join public.team_members tm on tm.team_id = c.team_id
    where c.id = messages.channel_id and tm.user_id = auth.uid()
  )
);

create policy if not exists "tasks_member_read" on public.tasks
for select using (
  exists (
    select 1
    from public.projects p
    join public.team_members tm on tm.team_id = p.team_id
    where p.id = tasks.project_id and tm.user_id = auth.uid()
  )
);

create policy if not exists "notifications_owner_rw" on public.notifications
for all using (user_id = auth.uid()) with check (user_id = auth.uid());
