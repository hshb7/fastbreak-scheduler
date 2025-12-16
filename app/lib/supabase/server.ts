// app/lib/supabase/server.ts
import 'server-only';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // or PUBLISHABLE_KEY if you used that name
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: CookieOptions }[]
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              // TS sometimes complains here because cookieStore is "Readonly"
              // but this is the pattern Supabase expects.
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from a Server Component – safe to ignore; middleware will refresh sessions
          }
        },
      },
    }
  );
}