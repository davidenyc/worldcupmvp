import "server-only";

import { createClient } from "@supabase/supabase-js";

let warnedMissingAdminEnv = false;

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    if (!warnedMissingAdminEnv) {
      warnedMissingAdminEnv = true;
      console.warn("Notifications admin client disabled: missing Supabase service-role env.");
    }
    return null;
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
