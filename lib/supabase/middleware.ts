import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

type SupabaseCookieOptions = {
  domain?: string;
  expires?: Date;
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  sameSite?: "lax" | "strict" | "none" | boolean;
  secure?: boolean;
};

// Middleware Supabase client that refreshes auth cookies without disturbing app routing.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers
    }
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Preview deployments may be missing Supabase env vars; keep the site routable
  // instead of crashing middleware for anonymous browsing.
  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: SupabaseCookieOptions) {
          request.cookies.set(name, value);
          response = NextResponse.next({
            request: {
              headers: request.headers
            }
          });
          response.cookies.set(name, value, options);
        },
        remove(name: string, options: SupabaseCookieOptions) {
          request.cookies.set(name, "");
          response = NextResponse.next({
            request: {
              headers: request.headers
            }
          });
          response.cookies.set(name, "", { ...options, maxAge: 0 });
        }
      }
    }
  );

  await supabase.auth.getUser();

  return response;
}
