create or replace function public.create_project_with_relations(
  p_title text,
  p_summary text,
  p_description text,
  p_category text,
  p_course_name text,
  p_university text default null,
  p_technologies text[] default '{}',
  p_repository_url text default null,
  p_demo_url text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_project_id uuid;
  v_category_id uuid;
  v_skill_name text;
  v_skill_id uuid;
begin
  v_profile_id := auth.uid();

  if v_profile_id is null then
    raise exception 'Você precisa estar logado para cadastrar um projeto.';
  end if;

  if not exists (
    select 1
    from public.profiles
    where id = v_profile_id
  ) then
    raise exception 'Seu perfil ainda não foi configurado. Complete seu perfil antes de cadastrar um projeto.';
  end if;

  if nullif(trim(p_title), '') is null
    or nullif(trim(p_summary), '') is null
    or nullif(trim(p_description), '') is null
    or nullif(trim(p_category), '') is null
    or nullif(trim(p_course_name), '') is null then
    raise exception 'Preencha título, resumo, descrição, categoria e curso.';
  end if;

  insert into public.project_categories (name)
  values (trim(p_category))
  on conflict (name) do update
    set name = excluded.name
  returning id into v_category_id;

  insert into public.projects (
    owner_id,
    category_id,
    title,
    summary,
    description,
    course_name,
    university,
    repository_url,
    demo_url,
    status
  )
  values (
    v_profile_id,
    v_category_id,
    trim(p_title),
    trim(p_summary),
    trim(p_description),
    nullif(trim(p_course_name), ''),
    nullif(trim(coalesce(p_university, '')), ''),
    nullif(trim(coalesce(p_repository_url, '')), ''),
    nullif(trim(coalesce(p_demo_url, '')), ''),
    'pending_review'
  )
  returning id into v_project_id;

  insert into public.project_members (
    project_id,
    profile_id,
    role
  )
  values (
    v_project_id,
    v_profile_id,
    'owner'
  )
  on conflict (project_id, profile_id) do update
    set role = excluded.role;

  foreach v_skill_name in array p_technologies loop
    v_skill_name := trim(v_skill_name);

    if v_skill_name <> '' then
      insert into public.skills (name)
      values (v_skill_name)
      on conflict (name) do update
        set name = excluded.name
      returning id into v_skill_id;

      insert into public.project_skills (
        project_id,
        skill_id
      )
      values (
        v_project_id,
        v_skill_id
      )
      on conflict (project_id, skill_id) do nothing;
    end if;
  end loop;

  return v_project_id;
end;
$$;

grant execute on function public.create_project_with_relations(
  text,
  text,
  text,
  text,
  text,
  text,
  text[],
  text,
  text
) to authenticated;