-- Bound export work to listings with a public candidate. The exporter still
-- rechecks current repository ownership and the approved revision for each ID.
begin;
create function public.maker_v2_approved_listings()
returns jsonb language sql stable security definer set search_path = '' as $$
  select coalesce(pg_catalog.jsonb_agg(listing order by listing), '[]'::jsonb)
  from maker_v2_private.owner_state
  where pg_catalog.jsonb_typeof(value #> '{approved,profile}') = 'object'
$$;
revoke all on function public.maker_v2_approved_listings() from public, anon, authenticated;
grant execute on function public.maker_v2_approved_listings() to service_role;
commit;
