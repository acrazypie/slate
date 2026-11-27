-- Lets a signed-in user delete their own account and every row that belongs to it.
-- Called by the web app (Settings > Delete account). Not yet applied to the live project.

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not signed in' using errcode = '42501';
  end if;

  -- rotations has no foreign key to auth.users, so it is removed by hand.
  delete from public.rotations where user_id = uid;
  delete from public.reminder_log where user_id = uid;
  delete from public.push_subscriptions where user_id = uid;
  delete from public.shift_assignments where user_id = uid;
  delete from public.shifts where user_id = uid;
  -- block_exceptions cascade from blocks.
  delete from public.blocks where user_id = uid;
  -- Sessions, identities and MFA rows cascade from auth.users.
  delete from auth.users where id = uid;
end;
$$;

revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
