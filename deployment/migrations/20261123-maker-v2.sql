-- Maker V2. Apply only to the dedicated Directory project as the DB migration owner.
-- Keep maker_v2_private out of exposed schemas. Existing public schema policies are untouched.
begin;

create schema maker_v2_private;
revoke all on schema maker_v2_private from public, anon, authenticated, service_role;

create table maker_v2_private.oauth_flow (
  token_digest text primary key check (token_digest ~ '^[A-Za-z0-9_-]{43}$'),
  expires_at_ms bigint not null check (expires_at_ms > 0),
  value jsonb not null check (jsonb_typeof(value) = 'object' and pg_column_size(value) <= 2048)
);
create index on maker_v2_private.oauth_flow (expires_at_ms);

create table maker_v2_private.session (
  token_digest text primary key check (token_digest ~ '^[A-Za-z0-9_-]{43}$'),
  expires_at_ms bigint not null check (expires_at_ms > 0),
  value jsonb not null check (jsonb_typeof(value) = 'object' and pg_column_size(value) <= 2048)
);
create index on maker_v2_private.session (expires_at_ms);

create table maker_v2_private.owner_state (
  listing text primary key check (length(listing) <= 100 and listing ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  version bigint not null check (version > 0 and version <= 9007199254740991),
  value jsonb not null check (jsonb_typeof(value) = 'object' and pg_column_size(value) <= 32768)
);

-- Privileged operators record proof only after reviewing control of this exact listing and repo.
-- No API can grant or revoke proofs. A row can be revoked and reseeded by the database owner.
create table maker_v2_private.reviewed_claim (
  listing text not null check (length(listing) <= 100 and listing ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  github_user bigint not null check (github_user > 0),
  github_repo bigint not null check (github_repo > 0),
  github_owner bigint not null check (github_owner > 0),
  reviewed_at timestamptz not null default now(),
  reviewed_by text not null check (length(reviewed_by) between 1 and 100),
  evidence_reference text not null check (length(evidence_reference) between 1 and 500),
  revoked_at timestamptz check (revoked_at >= reviewed_at),
  primary key (listing, github_user, github_repo, github_owner)
);
alter table maker_v2_private.oauth_flow enable row level security;
alter table maker_v2_private.session enable row level security;
alter table maker_v2_private.owner_state enable row level security;
alter table maker_v2_private.reviewed_claim enable row level security;
revoke all on all tables in schema maker_v2_private from public, anon, authenticated, service_role;

create function public.maker_v2_flow_save(p_key text, p_value jsonb)
returns void language sql security definer set search_path = '' as $$
  insert into maker_v2_private.oauth_flow (token_digest, expires_at_ms, value)
  values (p_key, (p_value ->> 'expiresAt')::bigint, p_value)
$$;

create function public.maker_v2_flow_consume(p_key text)
returns jsonb language sql security definer set search_path = '' as $$
  with consumed as (
    delete from maker_v2_private.oauth_flow as flow where flow.token_digest = p_key
    returning flow.expires_at_ms, flow.value
  )
  select consumed.value from consumed
  where consumed.expires_at_ms > extract(epoch from pg_catalog.statement_timestamp()) * 1000
$$;

create function public.maker_v2_session_save(p_key text, p_value jsonb)
returns void language sql security definer set search_path = '' as $$
  insert into maker_v2_private.session (token_digest, expires_at_ms, value)
  values (p_key, (p_value ->> 'expiresAt')::bigint, p_value)
$$;

create function public.maker_v2_session_read(p_key text)
returns jsonb language sql stable security definer set search_path = '' as $$
  select session.value from maker_v2_private.session as session
  where session.token_digest = p_key
    and session.expires_at_ms > extract(epoch from pg_catalog.statement_timestamp()) * 1000
$$;

create function public.maker_v2_session_delete(p_key text)
returns void language sql security definer set search_path = '' as $$
  delete from maker_v2_private.session as session where session.token_digest = p_key
$$;

create function public.maker_v2_owner_read(p_listing text)
returns jsonb language sql stable security definer set search_path = '' as $$
  select pg_catalog.jsonb_build_object('version', own.version, 'value', own.value)
  from maker_v2_private.owner_state as own where own.listing = p_listing
$$;

create function public.maker_v2_owner_cas(p_listing text, p_expected bigint, p_value jsonb)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  -- Hold this proof against concurrent revocation through the owner write.
  if p_value ->> 'githubOwnerType' = 'Organization' then
    perform 1 from maker_v2_private.reviewed_claim as proof
    where proof.listing = p_listing
      and proof.github_user = (p_value ->> 'owner')::bigint
      and proof.github_repo = (p_value ->> 'repoId')::bigint
      and proof.github_owner = (p_value ->> 'githubOwnerId')::bigint
      and proof.revoked_at is null
    for share;
    if not found then return false; end if;
  end if;
  if p_expected = 0 then
    insert into maker_v2_private.owner_state (listing, version, value)
    values (p_listing, 1, p_value)
    on conflict (listing) do nothing;
  elsif p_expected > 0 and p_expected < 9007199254740991 then
    update maker_v2_private.owner_state as own set version = own.version + 1, value = p_value
    where own.listing = p_listing and own.version = p_expected;
  else
    return false;
  end if;
  return found;
end
$$;

create function public.maker_v2_has_reviewed_claim(p_listing text, p_user bigint, p_repo bigint, p_owner bigint)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from maker_v2_private.reviewed_claim as proof
    where proof.listing = p_listing and proof.github_user = p_user and proof.github_repo = p_repo
      and proof.github_owner = p_owner and proof.revoked_at is null
  )
$$;

-- Listing IDs only. No owner identity, private messages or profile text leave this discovery query.
create function public.maker_v2_pending_listings(p_moderator bigint)
returns jsonb language sql stable security definer set search_path = '' as $$
  select coalesce(pg_catalog.jsonb_agg(task.listing order by task.listing), '[]'::jsonb)
  from (
    select o.listing from maker_v2_private.owner_state o
    where (o.value->>'owner')::bigint <> p_moderator
    and (o.value->>'githubOwnerType' <> 'Organization' or public.maker_v2_has_reviewed_claim(
      o.listing,(o.value->>'owner')::bigint,(o.value->>'repoId')::bigint,(o.value->>'githubOwnerId')::bigint))
    and (
      o.value #>> '{revision,status}' = 'pending' or
      o.value #>> '{requests,re-review,status}' = 'pending' or
      o.value #>> '{requests,improvement,status}' = 'pending'
    ) order by o.listing limit 100
  ) task
$$;

revoke all on function
  public.maker_v2_pending_listings(bigint), public.maker_v2_flow_save(text,jsonb), public.maker_v2_flow_consume(text),
  public.maker_v2_session_save(text,jsonb), public.maker_v2_session_read(text),
  public.maker_v2_session_delete(text), public.maker_v2_owner_read(text),
  public.maker_v2_owner_cas(text,bigint,jsonb), public.maker_v2_has_reviewed_claim(text,bigint,bigint,bigint)
from public, anon, authenticated, service_role;

grant execute on function
  public.maker_v2_pending_listings(bigint), public.maker_v2_flow_save(text,jsonb), public.maker_v2_flow_consume(text),
  public.maker_v2_session_save(text,jsonb), public.maker_v2_session_read(text),
  public.maker_v2_session_delete(text), public.maker_v2_owner_read(text),
  public.maker_v2_owner_cas(text,bigint,jsonb), public.maker_v2_has_reviewed_claim(text,bigint,bigint,bigint)
to service_role;

commit;

-- Schedule these two private deletes periodically using a database-owner job, not a public endpoint:
-- DELETE FROM maker_v2_private.oauth_flow WHERE expires_at_ms <= extract(epoch from statement_timestamp()) * 1000;
-- DELETE FROM maker_v2_private.session WHERE expires_at_ms <= extract(epoch from statement_timestamp()) * 1000;
