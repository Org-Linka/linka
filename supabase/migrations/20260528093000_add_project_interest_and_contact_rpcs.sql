create or replace function public.register_project_interest(
  p_project_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_user_type public.user_type;
  v_owner_id uuid;
  v_company_id uuid;
begin
  v_profile_id := auth.uid();

  if v_profile_id is null then
    raise exception 'Você precisa estar logado para demonstrar interesse.';
  end if;

  select profiles.user_type
  into v_user_type
  from public.profiles
  where profiles.id = v_profile_id;

  if v_user_type not in ('company', 'investor') then
    raise exception 'Apenas empresas e investidores podem demonstrar interesse em projetos.';
  end if;

  select projects.owner_id
  into v_owner_id
  from public.projects
  where projects.id = p_project_id
    and (
      projects.status = 'approved'
      or projects.owner_id = v_profile_id
      or public.is_project_member(projects.id)
      or public.is_admin()
    );

  if v_owner_id is null then
    raise exception 'Projeto não encontrado ou sem permissão para visualização.';
  end if;

  if v_owner_id = v_profile_id then
    raise exception 'Você não pode demonstrar interesse no próprio projeto.';
  end if;

  select companies.id
  into v_company_id
  from public.companies
  where companies.owner_id = v_profile_id
  order by companies.created_at asc
  limit 1;

  insert into public.project_favorites (project_id, profile_id, company_id)
  values (p_project_id, v_profile_id, v_company_id)
  on conflict (project_id, profile_id) do update
    set company_id = excluded.company_id;
end;
$$;

create or replace function public.send_project_contact_message(
  p_project_id uuid,
  p_message text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_user_type public.user_type;
  v_owner_id uuid;
  v_company_id uuid;
  v_message text;
begin
  v_profile_id := auth.uid();

  if v_profile_id is null then
    raise exception 'Você precisa estar logado para entrar em contato.';
  end if;

  v_message := trim(p_message);

  if v_message is null or v_message = '' then
    raise exception 'Escreva uma mensagem antes de enviar.';
  end if;

  select profiles.user_type
  into v_user_type
  from public.profiles
  where profiles.id = v_profile_id;

  if v_user_type not in ('company', 'investor') then
    raise exception 'Apenas empresas e investidores podem entrar em contato com projetos.';
  end if;

  select projects.owner_id
  into v_owner_id
  from public.projects
  where projects.id = p_project_id
    and (
      projects.status = 'approved'
      or projects.owner_id = v_profile_id
      or public.is_project_member(projects.id)
      or public.is_admin()
    );

  if v_owner_id is null then
    raise exception 'Projeto não encontrado ou sem permissão para visualização.';
  end if;

  if v_owner_id = v_profile_id then
    raise exception 'Você não pode entrar em contato com o próprio projeto.';
  end if;

  select companies.id
  into v_company_id
  from public.companies
  where companies.owner_id = v_profile_id
  order by companies.created_at asc
  limit 1;

  insert into public.project_contacts (
    project_id,
    sender_profile_id,
    receiver_profile_id,
    company_id,
    message
  ) values (
    p_project_id,
    v_profile_id,
    v_owner_id,
    v_company_id,
    v_message
  );
end;
$$;

grant execute on function public.register_project_interest(uuid) to authenticated;
grant execute on function public.send_project_contact_message(uuid, text) to authenticated;