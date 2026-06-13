do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'checkout_sessions'
      and policyname = 'demo_checkout_sessions_select_own'
  ) then
    create policy demo_checkout_sessions_select_own
      on public.checkout_sessions
      for select
      to authenticated
      using (
        profile_id = (select auth.uid())
        or exists (
          select 1
          from public.companies
          where companies.id = checkout_sessions.company_id
            and companies.owner_id = (select auth.uid())
        )
      );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'checkout_sessions'
      and policyname = 'demo_checkout_sessions_insert_own'
  ) then
    create policy demo_checkout_sessions_insert_own
      on public.checkout_sessions
      for insert
      to authenticated
      with check (
        provider = 'demo'
        and status in ('pending', 'approved', 'refused', 'cancelled')
        and (
          profile_id = (select auth.uid())
          or exists (
            select 1
            from public.companies
            where companies.id = checkout_sessions.company_id
              and companies.owner_id = (select auth.uid())
          )
        )
      );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'checkout_sessions'
      and policyname = 'demo_checkout_sessions_update_own'
  ) then
    create policy demo_checkout_sessions_update_own
      on public.checkout_sessions
      for update
      to authenticated
      using (
        provider = 'demo'
        and (
          profile_id = (select auth.uid())
          or exists (
            select 1
            from public.companies
            where companies.id = checkout_sessions.company_id
              and companies.owner_id = (select auth.uid())
          )
        )
      )
      with check (
        provider = 'demo'
        and status in ('pending', 'approved', 'refused', 'cancelled')
        and (
          profile_id = (select auth.uid())
          or exists (
            select 1
            from public.companies
            where companies.id = checkout_sessions.company_id
              and companies.owner_id = (select auth.uid())
          )
        )
      );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'subscriptions'
      and policyname = 'demo_subscriptions_select_own'
  ) then
    create policy demo_subscriptions_select_own
      on public.subscriptions
      for select
      to authenticated
      using (
        profile_id = (select auth.uid())
        or exists (
          select 1
          from public.companies
          where companies.id = subscriptions.company_id
            and companies.owner_id = (select auth.uid())
        )
      );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'subscriptions'
      and policyname = 'demo_subscriptions_insert_own'
  ) then
    create policy demo_subscriptions_insert_own
      on public.subscriptions
      for insert
      to authenticated
      with check (
        provider = 'demo'
        and status in ('unpaid', 'active', 'paid', 'cancelled', 'past_due')
        and (
          profile_id = (select auth.uid())
          or exists (
            select 1
            from public.companies
            where companies.id = subscriptions.company_id
              and companies.owner_id = (select auth.uid())
          )
        )
      );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'subscriptions'
      and policyname = 'demo_subscriptions_update_own'
  ) then
    create policy demo_subscriptions_update_own
      on public.subscriptions
      for update
      to authenticated
      using (
        provider = 'demo'
        and (
          profile_id = (select auth.uid())
          or exists (
            select 1
            from public.companies
            where companies.id = subscriptions.company_id
              and companies.owner_id = (select auth.uid())
          )
        )
      )
      with check (
        provider = 'demo'
        and status in ('unpaid', 'active', 'paid', 'cancelled', 'past_due')
        and (
          profile_id = (select auth.uid())
          or exists (
            select 1
            from public.companies
            where companies.id = subscriptions.company_id
              and companies.owner_id = (select auth.uid())
          )
        )
      );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'payment_events'
      and policyname = 'demo_payment_events_select_own'
  ) then
    create policy demo_payment_events_select_own
      on public.payment_events
      for select
      to authenticated
      using (
        provider = 'demo'
        and jsonb_typeof(payload) = 'object'
        and (
          payload ->> 'profile_id' = (select auth.uid())::text
          or exists (
            select 1
            from public.companies
            where companies.id::text = payment_events.payload ->> 'company_id'
              and companies.owner_id = (select auth.uid())
          )
        )
      );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'payment_events'
      and policyname = 'demo_payment_events_insert_own'
  ) then
    create policy demo_payment_events_insert_own
      on public.payment_events
      for insert
      to authenticated
      with check (
        provider = 'demo'
        and event_type in (
          'payment.approved',
          'payment.refused',
          'payment.cancelled',
          'payment.renewed'
        )
        and jsonb_typeof(payload) = 'object'
        and (
          payload ->> 'profile_id' = (select auth.uid())::text
          or exists (
            select 1
            from public.companies
            where companies.id::text = payment_events.payload ->> 'company_id'
              and companies.owner_id = (select auth.uid())
          )
        )
      );
  end if;
end $$;
