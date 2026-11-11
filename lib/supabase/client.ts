import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

// Single shared instance across the whole app. Supabase's browser client manages
// its own auth-token refresh via the Web Locks API, keyed by project ref — creating
// more than one instance causes them to fight over the same lock
// ("Acquiring an exclusive Navigator LockManager lock ... immediately failed").
let client: SupabaseClient | undefined;

export function createClient() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:3000',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
    );
  }
  return client;
}