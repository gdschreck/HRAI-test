import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Create a Supabase client that uses Clerk's session token for authentication
export function createClerkSupabaseClient(getToken: () => Promise<string | null>) {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      async accessToken() {
        return await getToken()
      },
    }
  )
}
