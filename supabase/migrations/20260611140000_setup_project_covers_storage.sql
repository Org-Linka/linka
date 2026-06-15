insert into storage.buckets (id, name, public)
values ('project-covers', 'project-covers', false)
on conflict (id) do update
set public = false;

drop policy if exists "Project covers are readable by authenticated users"
on storage.objects;

drop policy if exists "Users can upload their own project covers"
on storage.objects;

drop policy if exists "Users can update their own project covers"
on storage.objects;

drop policy if exists "Users can delete their own project covers"
on storage.objects;

create policy "Project covers are readable by authenticated users"
on storage.objects
for select
to authenticated
using (bucket_id = 'project-covers');

create policy "Users can upload their own project covers"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'project-covers'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can update their own project covers"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'project-covers'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'project-covers'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can delete their own project covers"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'project-covers'
  and auth.uid()::text = (storage.foldername(name))[1]
);