// Account deletion for the web app. The database function does the work (see
// supabase/migrations/20261127000000_delete_my_account.sql); it removes the
// sign-in user and every row that belongs to them.

import { createClient } from '@/lib/supabase/client';

/** Deletes the signed-in account and its data, then signs out and clears this browser's storage. */
export async function deleteAccount(): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.rpc('delete_my_account');
  if (error) throw error;
  await supabase.auth.signOut();
  try {
    localStorage.clear();
  } catch {
    // Storage unavailable: nothing to clear.
  }
}
