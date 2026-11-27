-- Apply after 20261123-maker-v2.sql on the isolated Directory database.
begin;
create table maker_v2_private.recovery_archive (
  listing text not null,
  old_version bigint not null,
  old_value jsonb not null,
  moderator bigint not null check (moderator > 0),
  successor bigint not null check (successor > 0),
  evidence text not null check (evidence ~ '^[A-Za-z0-9][A-Za-z0-9:._-]{2,95}$'),
  recovered_at timestamptz not null default now(),
  primary key (listing, old_version)
);
alter table maker_v2_private.recovery_archive enable row level security;
revoke all on maker_v2_private.recovery_archive from public, anon, authenticated, service_role;

-- The service has verified the exact provider identity and consulted its configured moderator list.
-- This privileged RPC serializes against owner updates, enforces the same immutable repo,
-- archives the exact prior private state, and constructs a blank successor record.
create function public.maker_v2_owner_recover(p_listing text,p_expected bigint,p_successor jsonb,p_audit jsonb)
returns boolean language plpgsql security definer set search_path = '' as $$
declare old_record maker_v2_private.owner_state%rowtype;
declare nominee bigint := (p_successor->>'owner')::bigint;
declare staff bigint := (p_audit->>'moderator')::bigint;
declare repo bigint := (p_successor->>'repoId')::bigint;
declare owner_id bigint := (p_successor->>'githubOwnerId')::bigint;
declare owner_type text := p_successor->>'githubOwnerType';
declare next_seq bigint := (p_successor->>'sequence')::bigint;
begin
  select * into old_record from maker_v2_private.owner_state o where o.listing=p_listing for update;
  if not found or p_expected is null or p_expected<>old_record.version or old_record.version>=9007199254740991
    or nominee is null or nominee<=0 or staff is null or staff<=0 or nominee=staff
    or (old_record.value->>'owner')::bigint in (nominee,staff)
    or repo is null or repo<>(old_record.value->>'repoId')::bigint
    or owner_id is null or owner_id<=0 or owner_type is null or owner_type not in ('User','Organization')
    or (owner_type='User' and owner_id<>nominee)
    or next_seq is null or next_seq>9007199254740991 or next_seq<=greatest(
      0, (old_record.value->>'editVersion')::bigint, (old_record.value->>'sequence')::bigint,
      (old_record.value #>> '{revision,version}')::bigint,
      (old_record.value #>> '{requests,re-review,version}')::bigint,
      (old_record.value #>> '{requests,improvement,version}')::bigint)
  then return false; end if;
  if old_record.value->>'githubOwnerType'='Organization'
    and owner_type='Organization' and owner_id=(old_record.value->>'githubOwnerId')::bigint then
    -- The same organization can recover only while the prior account remains revoked.
    perform 1 from maker_v2_private.reviewed_claim proof where proof.listing=p_listing
      and proof.github_user=(old_record.value->>'owner')::bigint and proof.github_repo=repo
      and proof.github_owner=owner_id for share;
    if public.maker_v2_has_reviewed_claim(p_listing,(old_record.value->>'owner')::bigint,repo,owner_id)
      then return false; end if;
  end if;
  if owner_type='Organization' then
    -- Lock the exact successor proof against concurrent revocation until this write completes.
    perform 1 from maker_v2_private.reviewed_claim proof where proof.listing=p_listing
      and proof.github_user=nominee and proof.github_repo=repo and proof.github_owner=owner_id
      and proof.revoked_at is null for share;
    if not found then return false; end if;
  end if;
  insert into maker_v2_private.recovery_archive(listing,old_version,old_value,moderator,successor,evidence)
    values(p_listing,old_record.version,old_record.value,staff,nominee,p_audit->>'evidence');
  update maker_v2_private.owner_state o set version=o.version+1,
    value=pg_catalog.jsonb_build_object('owner',nominee,'repoId',repo,'githubOwnerId',owner_id,
      'githubOwnerType',owner_type,'sequence',next_seq,'editVersion',next_seq,'revision',null,'approved',null)
    where o.listing=p_listing;
  return found;
end
$$;
revoke all on function public.maker_v2_owner_recover(text,bigint,jsonb,jsonb) from public, anon, authenticated, service_role;
grant execute on function public.maker_v2_owner_recover(text,bigint,jsonb,jsonb) to service_role;
-- Keep pending work discoverable even after proof revocation. Only listing IDs leave this query.
create or replace function public.maker_v2_pending_listings(p_moderator bigint)
returns jsonb language sql stable security definer set search_path = '' as $$
  select coalesce(pg_catalog.jsonb_agg(task.listing order by task.listing), '[]'::jsonb)
  from (
    select o.listing from maker_v2_private.owner_state o
    where (o.value->>'owner')::bigint <> p_moderator and (
      o.value #>> '{revision,status}' = 'pending' or
      o.value #>> '{requests,re-review,status}' = 'pending' or
      o.value #>> '{requests,improvement,status}' = 'pending'
    ) order by o.listing limit 100
  ) task
$$;
-- Final compare-and-check uses one database snapshot for the version and exact organization proof.
create function public.maker_v2_can_export(p_listing text,p_expected bigint)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from maker_v2_private.owner_state o
    where o.listing=p_listing and o.version=p_expected
      and jsonb_typeof(o.value #> '{approved,profile}') = 'object'
      and (o.value->>'githubOwnerType'='User' or
        (o.value->>'githubOwnerType'='Organization' and public.maker_v2_has_reviewed_claim(
          o.listing,(o.value->>'owner')::bigint,(o.value->>'repoId')::bigint,(o.value->>'githubOwnerId')::bigint)))
  )
$$;
revoke all on function public.maker_v2_can_export(text,bigint) from public, anon, authenticated, service_role;
grant execute on function public.maker_v2_can_export(text,bigint) to service_role;
commit;
