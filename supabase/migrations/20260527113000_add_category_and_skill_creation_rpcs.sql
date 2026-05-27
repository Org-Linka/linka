drop function if exists public.create_project_category_if_not_exists(text);
drop function if exists public.create_project_category_if_not_exists(text, text);
drop function if exists public.create_skill_if_not_exists(text);
drop function if exists public.create_skill_if_not_exists(text, text);

create function public.create_project_category_if_not_exists(
  p_name text,
  p_slug text
)
returns table (
  category_id uuid,
  category_name text,
  category_slug text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
  v_slug text;
  v_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Você precisa estar logado para criar uma categoria.';
  end if;

  v_name := trim(p_name);
  v_slug := trim(both '-' from lower(trim(p_slug)));

  if v_name is null or v_name = '' or v_slug is null or v_slug = '' then
    raise exception 'Informe uma categoria válida.';
  end if;

  insert into public.project_categories (name, slug)
  values (v_name, v_slug)
  on conflict (slug) do nothing;

  select pc.id
  into v_id
  from public.project_categories pc
  where pc.slug = v_slug
  limit 1;

  return query
  select pc.id, pc.name, pc.slug
  from public.project_categories pc
  where pc.id = v_id;
end;
$$;

create function public.create_skill_if_not_exists(
  p_name text,
  p_slug text
)
returns table (
  skill_id uuid,
  skill_name text,
  skill_slug text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
  v_slug text;
  v_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Você precisa estar logado para criar uma tecnologia.';
  end if;

  v_name := trim(p_name);
  v_slug := trim(both '-' from lower(trim(p_slug)));

  if v_name is null or v_name = '' or v_slug is null or v_slug = '' then
    raise exception 'Informe uma tecnologia válida.';
  end if;

  insert into public.skills (name, slug)
  values (v_name, v_slug)
  on conflict (slug) do nothing;

  select s.id
  into v_id
  from public.skills s
  where s.slug = v_slug
  limit 1;

  return query
  select s.id, s.name, s.slug
  from public.skills s
  where s.id = v_id;
end;
$$;

grant execute on function public.create_project_category_if_not_exists(text, text) to authenticated;
grant execute on function public.create_skill_if_not_exists(text, text) to authenticated;