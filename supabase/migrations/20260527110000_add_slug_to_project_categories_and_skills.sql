create extension if not exists unaccent with schema extensions;

alter table public.project_categories
add column if not exists slug text;

alter table public.skills
add column if not exists slug text;

update public.project_categories
set slug = trim(
  both '-'
  from regexp_replace(
    lower(extensions.unaccent(name)),
    '[^a-z0-9]+',
    '-',
    'g'
  )
)
where slug is null;

update public.skills
set slug = trim(
  both '-'
  from regexp_replace(
    lower(extensions.unaccent(name)),
    '[^a-z0-9]+',
    '-',
    'g'
  )
)
where slug is null;

alter table public.project_categories
alter column slug set not null;

alter table public.skills
alter column slug set not null;

create unique index if not exists project_categories_slug_key
on public.project_categories (slug);

create unique index if not exists skills_slug_key
on public.skills (slug);