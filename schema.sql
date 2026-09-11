-- PICFLOW MASTER DATABASE
-- Run this whole file in Supabase SQL Editor.

create extension if not exists pgcrypto;

-- PROFILES
create table if not exists public.profiles(
 id uuid primary key references auth.users(id) on delete cascade,
 username text not null,
 bio text default '',
 mobile text,
 avatar_url text,
 created_at timestamptz default now(),
 updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

grant select,insert,update on public.profiles to anon,authenticated;

drop policy if exists profiles_select_public on public.profiles;
create policy profiles_select_public
on public.profiles for select
to anon,authenticated
using(true);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
on public.profiles for insert
to authenticated
with check(auth.uid()=id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
on public.profiles for update
to authenticated
using(auth.uid()=id)
with check(auth.uid()=id);

-- POSTS
create table if not exists public.posts(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 media_url text not null,
 media_type text default 'image',
 caption text default '',
 created_at timestamptz default now()
);

alter table public.posts enable row level security;

grant select,insert,update,delete on public.posts to authenticated;

drop policy if exists posts_select on public.posts;
create policy posts_select
on public.posts for select
to authenticated
using(true);

drop policy if exists posts_insert on public.posts;
create policy posts_insert
on public.posts for insert
to authenticated
with check(auth.uid()=user_id);

drop policy if exists posts_update on public.posts;
create policy posts_update
on public.posts for update
to authenticated
using(auth.uid()=user_id)
with check(auth.uid()=user_id);

drop policy if exists posts_delete on public.posts;
create policy posts_delete
on public.posts for delete
to authenticated
using(auth.uid()=user_id);

-- LIKES
create table if not exists public.likes(
 post_id uuid references public.posts(id) on delete cascade,
 user_id uuid references auth.users(id) on delete cascade,
 created_at timestamptz default now(),
 primary key(post_id,user_id)
);

alter table public.likes enable row level security;

grant select,insert,delete on public.likes to authenticated;

drop policy if exists likes_select on public.likes;
create policy likes_select
on public.likes for select
to authenticated
using(true);

drop policy if exists likes_insert on public.likes;
create policy likes_insert
on public.likes for insert
to authenticated
with check(auth.uid()=user_id);

drop policy if exists likes_delete on public.likes;
create policy likes_delete
on public.likes for delete
to authenticated
using(auth.uid()=user_id);

-- COMMENTS
create table if not exists public.comments(
 id uuid primary key default gen_random_uuid(),
 post_id uuid references public.posts(id) on delete cascade,
 user_id uuid references auth.users(id) on delete cascade,
 body text not null,
 created_at timestamptz default now()
);

alter table public.comments enable row level security;

grant select,insert,delete on public.comments to authenticated;

drop policy if exists comments_select on public.comments;
create policy comments_select
on public.comments for select
to authenticated
using(true);

drop policy if exists comments_insert on public.comments;
create policy comments_insert
on public.comments for insert
to authenticated
with check(auth.uid()=user_id);

drop policy if exists comments_delete on public.comments;
create policy comments_delete
on public.comments for delete
to authenticated
using(auth.uid()=user_id);

-- SAVED
create table if not exists public.saved_posts(
 post_id uuid references public.posts(id) on delete cascade,
 user_id uuid references auth.users(id) on delete cascade,
 created_at timestamptz default now(),
 primary key(post_id,user_id)
);

alter table public.saved_posts enable row level security;

grant select,insert,delete on public.saved_posts to authenticated;

drop policy if exists saved_select on public.saved_posts;
create policy saved_select
on public.saved_posts for select
to authenticated
using(auth.uid()=user_id);

drop policy if exists saved_insert on public.saved_posts;
create policy saved_insert
on public.saved_posts for insert
to authenticated
with check(auth.uid()=user_id);

drop policy if exists saved_delete on public.saved_posts;
create policy saved_delete
on public.saved_posts for delete
to authenticated
using(auth.uid()=user_id);

-- FOLLOWS
create table if not exists public.follows(
 follower_id uuid references auth.users(id) on delete cascade,
 following_id uuid references auth.users(id) on delete cascade,
 created_at timestamptz default now(),
 primary key(follower_id,following_id),
 check(follower_id<>following_id)
);

alter table public.follows enable row level security;

grant select,insert,delete on public.follows to authenticated;

drop policy if exists follows_select on public.follows;
create policy follows_select
on public.follows for select
to authenticated
using(true);

drop policy if exists follows_insert on public.follows;
create policy follows_insert
on public.follows for insert
to authenticated
with check(auth.uid()=follower_id);

drop policy if exists follows_delete on public.follows;
create policy follows_delete
on public.follows for delete
to authenticated
using(auth.uid()=follower_id);

-- STORIES
create table if not exists public.stories(
 id uuid primary key default gen_random_uuid(),
 user_id uuid references auth.users(id) on delete cascade,
 media_url text not null,
 media_type text default 'image',
 created_at timestamptz default now(),
 expires_at timestamptz default (now()+interval '24 hours')
);

alter table public.stories enable row level security;

grant select,insert,delete on public.stories to authenticated;

drop policy if exists stories_select on public.stories;
create policy stories_select
on public.stories for select
to authenticated
using(expires_at>now());

drop policy if exists stories_insert on public.stories;
create policy stories_insert
on public.stories for insert
to authenticated
with check(auth.uid()=user_id);

drop policy if exists stories_delete on public.stories;
create policy stories_delete
on public.stories for delete
to authenticated
using(auth.uid()=user_id);

-- NOTIFICATIONS
create table if not exists public.notifications(
 id uuid primary key default gen_random_uuid(),
 user_id uuid references auth.users(id) on delete cascade,
 actor_id uuid references auth.users(id) on delete cascade,
 type text,
 message text,
 created_at timestamptz default now(),
 read boolean default false
);

alter table public.notifications enable row level security;

grant select,update on public.notifications to authenticated;

drop policy if exists notifications_select on public.notifications;
create policy notifications_select
on public.notifications for select
to authenticated
using(auth.uid()=user_id);

drop policy if exists notifications_update on public.notifications;
create policy notifications_update
on public.notifications for update
to authenticated
using(auth.uid()=user_id);

-- MESSAGES
create table if not exists public.messages(
 id uuid primary key default gen_random_uuid(),
 sender_id uuid references auth.users(id) on delete cascade,
 receiver_id uuid references auth.users(id) on delete cascade,
 body text not null,
 created_at timestamptz default now(),
 read boolean default false
);

alter table public.messages enable row level security;

grant select,insert,update on public.messages to authenticated;

drop policy if exists messages_select on public.messages;
create policy messages_select
on public.messages for select
to authenticated
using(auth.uid()=sender_id or auth.uid()=receiver_id);

drop policy if exists messages_insert on public.messages;
create policy messages_insert
on public.messages for insert
to authenticated
with check(auth.uid()=sender_id);

drop policy if exists messages_update on public.messages;
create policy messages_update
on public.messages for update
to authenticated
using(auth.uid()=receiver_id);

-- AUTO PROFILE AFTER SIGNUP
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
begin
 insert into public.profiles(id,username,mobile)
 values(
  new.id,
  coalesce(new.raw_user_meta_data->>'username',split_part(new.email,'@',1)),
  new.raw_user_meta_data->>'mobile'
 )
 on conflict(id) do nothing;

 return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();

-- STORAGE BUCKETS
insert into storage.buckets(id,name,public)
values('avatars','avatars',true)
on conflict(id) do update set public=true;

insert into storage.buckets(id,name,public)
values('posts','posts',true)
on conflict(id) do update set public=true;

-- AVATAR STORAGE
drop policy if exists avatar_public on storage.objects;
create policy avatar_public
on storage.objects for select
to public
using(bucket_id='avatars');

drop policy if exists avatar_upload on storage.objects;
create policy avatar_upload
on storage.objects for insert
to authenticated
with check(
 bucket_id='avatars'
 and (storage.foldername(name))[1]=(select auth.uid()::text)
);

drop policy if exists avatar_update on storage.objects;
create policy avatar_update
on storage.objects for update
to authenticated
using(
 bucket_id='avatars'
 and (storage.foldername(name))[1]=(select auth.uid()::text)
)
with check(
 bucket_id='avatars'
 and (storage.foldername(name))[1]=(select auth.uid()::text)
);

-- POST STORAGE
drop policy if exists post_public on storage.objects;
create policy post_public
on storage.objects for select
to public
using(bucket_id='posts');

drop policy if exists post_upload on storage.objects;
create policy post_upload
on storage.objects for insert
to authenticated
with check(
 bucket_id='posts'
 and (storage.foldername(name))[1]=(select auth.uid()::text)
);

drop policy if exists post_update on storage.objects;
create policy post_update
on storage.objects for update
to authenticated
using(
 bucket_id='posts'
 and (storage.foldername(name))[1]=(select auth.uid()::text)
)
with check(
 bucket_id='posts'
 and (storage.foldername(name))[1]=(select auth.uid()::text)
);

drop policy if exists post_delete on storage.objects;
create policy post_delete
on storage.objects for delete
to authenticated
using(
 bucket_id='posts'
 and (storage.foldername(name))[1]=(select auth.uid()::text)
);
