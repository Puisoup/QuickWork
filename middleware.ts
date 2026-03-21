import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export async function middleware(request: NextRequest) {
  // Create an unmodified response we can return after Supabase refresh.
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  if (!supabaseUrl || !supabaseKey) return supabaseResponse;

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // Keep cookies in sync for SSR. If called from middleware, it's safe to re-create response.
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

        supabaseResponse = NextResponse.next({
          request,
        });

        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // Trigger session refresh.
  try {
    await supabase.auth.getUser();
  } catch {
    // Not fatal for unauthenticated requests.
  }

  return supabaseResponse;
}

export const config = {
  // Run middleware for all routes (except Next static assets).
  matcher: ["/:path*"],
};

