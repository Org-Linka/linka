do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'companies'
      and policyname = 'company_owners_update_own_company'
  ) then
    create policy company_owners_update_own_company
      on public.companies
      for update
      to authenticated
      using (owner_id = (select auth.uid()))
      with check (owner_id = (select auth.uid()));
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'company_members'
      and policyname = 'company_owners_insert_own_membership'
  ) then
    create policy company_owners_insert_own_membership
      on public.company_members
      for insert
      to authenticated
      with check (
        profile_id = (select auth.uid())
        and role = 'owner'
        and exists (
          select 1
          from public.companies
          where companies.id = company_members.company_id
            and companies.owner_id = (select auth.uid())
        )
      );
  end if;
end $$;
