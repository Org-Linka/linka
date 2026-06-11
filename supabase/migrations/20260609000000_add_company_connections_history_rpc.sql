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
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_user_type public.user_type;
  v_company_id uuid;
begin
  v_profile_id := auth.uid();

  if v_profile_id is null then
    raise exception 'Você precisa estar logado para visualizar o histórico.';
  end if;

  select profiles.user_type
  into v_user_type
  from public.profiles
  where profiles.id = v_profile_id;

  if v_user_type <> 'company' then
    raise exception 'Apenas empresas podem visualizar este histórico.';
  end if;

  select companies.id
  into v_company_id
  from public.companies
  where companies.owner_id = v_profile_id
  order by companies.created_at asc
  limit 1;

  return query
    with connection_history as (
      select
        concat('contact-', project_contacts.id::text) as connection_id,
        'contact'::text as connection_type,
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
      where (
          project_contacts.company_id = v_company_id
          or (
            project_contacts.company_id is null
            and project_contacts.sender_profile_id = v_profile_id
          )
        )
        and (
          projects.status = 'approved'
          or projects.owner_id = v_profile_id
          or public.is_project_member(projects.id)
          or public.is_admin()
        )

      union all

      select
        concat(
          'interest-',
          project_favorites.project_id::text,
          '-',
          project_favorites.profile_id::text
        ) as connection_id,
        'interest'::text as connection_type,
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
      where (
          project_favorites.company_id = v_company_id
          or (
            project_favorites.company_id is null
            and project_favorites.profile_id = v_profile_id
          )
        )
        and (
          projects.status = 'approved'
          or projects.owner_id = v_profile_id
          or public.is_project_member(projects.id)
          or public.is_admin()
        )
    ),
    latest_connection_by_project as (
      select distinct on (connection_history.project_id)
        connection_history.connection_id,
        connection_history.connection_type,
        connection_history.project_id,
        connection_history.project_title,
        connection_history.project_summary,
        connection_history.project_status,
        connection_history.student_id,
        connection_history.student_name,
        connection_history.student_email,
        connection_history.message,
        connection_history.created_at
      from connection_history
      order by
        connection_history.project_id,
        connection_history.created_at desc,
        connection_history.connection_type asc
    )
    select
      latest_connection_by_project.connection_id,
      latest_connection_by_project.connection_type,
      latest_connection_by_project.project_id,
      latest_connection_by_project.project_title,
      latest_connection_by_project.project_summary,
      latest_connection_by_project.project_status,
      latest_connection_by_project.student_id,
      latest_connection_by_project.student_name,
      latest_connection_by_project.student_email,
      latest_connection_by_project.message,
      latest_connection_by_project.created_at
    from latest_connection_by_project
    order by latest_connection_by_project.created_at desc;
end;
$$;

grant execute on function public.list_company_connections_history() to authenticated;

create or replace function public.get_company_student_details(p_student_id uuid)
returns table (
  id uuid,
  full_name text,
  email text,
  avatar_url text,
  bio text,
  city text,
  state text,
  linkedin_url text,
  github_url text,
  portfolio_url text,
  university text,
  course_name text,
  semester text,
  headline text,
  availability text,
  focus_area text,
  tools text,
  languages text,
  skills_summary text,
  skills text[],
  projects jsonb
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_user_type public.user_type;
  v_company_id uuid;
begin
  v_profile_id := auth.uid();

  if v_profile_id is null then
    raise exception 'Você precisa estar logado para visualizar o estudante.';
  end if;

  select profiles.user_type
  into v_user_type
  from public.profiles
  where profiles.id = v_profile_id;

  if v_user_type <> 'company' then
    raise exception 'Apenas empresas podem visualizar detalhes de estudantes.';
  end if;

  select companies.id
  into v_company_id
  from public.companies
  where companies.owner_id = v_profile_id
  order by companies.created_at asc
  limit 1;

  return query
    select
      profiles.id,
      profiles.full_name,
      profiles.email,
      profiles.avatar_url,
      profiles.bio,
      profiles.city,
      profiles.state,
      profiles.linkedin_url,
      profiles.github_url,
      profiles.portfolio_url,
      student_profiles.university,
      student_profiles.course_name,
      student_profiles.semester,
      student_profiles.headline,
      student_profiles.availability,
      student_profiles.focus_area,
      student_profiles.tools,
      student_profiles.languages,
      student_profiles.skills_summary,
      coalesce(
        array_agg(distinct skills.name)
          filter (where skills.name is not null),
        array[]::text[]
      ) as skills,
      coalesce(
        (
          select jsonb_agg(
            jsonb_build_object(
              'id', projects.id,
              'title', projects.title,
              'summary', projects.summary,
              'status', projects.status
            )
            order by projects.created_at desc
          )
          from public.projects
          where projects.owner_id = profiles.id
            and projects.status = 'approved'
        ),
        '[]'::jsonb
      ) as projects
    from public.profiles
    left join public.student_profiles
      on student_profiles.profile_id = profiles.id
    left join public.profile_skills
      on profile_skills.profile_id = profiles.id
    left join public.skills
      on skills.id = profile_skills.skill_id
    where profiles.id = p_student_id
      and profiles.user_type = 'student'
      and (
        exists (
          select 1
          from public.project_contacts
          join public.projects
            on projects.id = project_contacts.project_id
          where (
              project_contacts.company_id = v_company_id
              or (
                project_contacts.company_id is null
                and project_contacts.sender_profile_id = v_profile_id
              )
            )
            and project_contacts.receiver_profile_id = p_student_id
            and (
              projects.status = 'approved'
              or projects.owner_id = v_profile_id
              or public.is_project_member(projects.id)
              or public.is_admin()
            )
        )
        or exists (
          select 1
          from public.project_favorites
          join public.projects
            on projects.id = project_favorites.project_id
          where (
              project_favorites.company_id = v_company_id
              or (
                project_favorites.company_id is null
                and project_favorites.profile_id = v_profile_id
              )
            )
            and projects.owner_id = p_student_id
            and (
              projects.status = 'approved'
              or projects.owner_id = v_profile_id
              or public.is_project_member(projects.id)
              or public.is_admin()
            )
        )
      )
    group by
      profiles.id,
      profiles.full_name,
      profiles.email,
      profiles.avatar_url,
      profiles.bio,
      profiles.city,
      profiles.state,
      profiles.linkedin_url,
      profiles.github_url,
      profiles.portfolio_url,
      student_profiles.university,
      student_profiles.course_name,
      student_profiles.semester,
      student_profiles.headline,
      student_profiles.availability,
      student_profiles.focus_area,
      student_profiles.tools,
      student_profiles.languages,
      student_profiles.skills_summary;
end;
$$;

grant execute on function public.get_company_student_details(uuid) to authenticated;

notify pgrst, 'reload schema';