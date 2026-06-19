insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'company-content-media',
  'company-content-media',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Company content media is readable by authenticated users"
on storage.objects;

drop policy if exists "Company users can upload own content media"
on storage.objects;

drop policy if exists "Company users can update own content media"
on storage.objects;

drop policy if exists "Company users can delete own content media"
on storage.objects;

create policy "Company content media is readable by authenticated users"
on storage.objects
for select
to authenticated
using (bucket_id = 'company-content-media');

create policy "Company users can upload own content media"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'company-content-media'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Company users can update own content media"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'company-content-media'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'company-content-media'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Company users can delete own content media"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'company-content-media'
  and auth.uid()::text = (storage.foldername(name))[1]
);
