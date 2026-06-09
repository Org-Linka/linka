create or replace function public.list_company_connections_history()
returns table (
  connection_id text,
  connection_type text,
  project_id uuid,
  project_title text,
  project_summary text,
  project_status public.project_status,
  student_id uuid,
  student_name text,
  student_email text,
  message text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    concat('contact-', project_contacts.id::text) as connection_id,
    'contact' as connection_type,
    projects.id as project_id,
    projects.title as project_title,
    projects.summary as project_summary,
    projects.status as project_status,
    profiles.id as student_id,
    profiles.full_name as student_name,
    profiles.email as student_email,
    project_contacts.message as message,
    project_contacts.created_at as created_at
  from public.project_contacts
  join public.projects
    on projects.id = project_contacts.project_id
  left join public.profiles
    on profiles.id = project_contacts.receiver_profile_id
  where project_contacts.sender_profile_id = auth.uid()

  union all

  select
    concat('interest-', project_favorites.project_id::text, '-', project_favorites.profile_id::text) as connection_id,
    'interest' as connection_type,
    projects.id as project_id,
    projects.title as project_title,
    projects.summary as project_summary,
    projects.status as project_status,
    profiles.id as student_id,
    profiles.full_name as student_name,
    profiles.email as student_email,
    null::text as message,
    project_favorites.created_at as created_at
  from public.project_favorites
  join public.projects
    on projects.id = project_favorites.project_id
  left join public.profiles
    on profiles.id = projects.owner_id
  where project_favorites.profile_id = auth.uid()

  order by created_at desc;
$$;

grant execute on function public.list_company_connections_history() to authenticated;