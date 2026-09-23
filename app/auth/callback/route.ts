import { createClient } from "@/lib/supabase/server";
import { getAuthorizedUser } from "@/lib/auth/authorization";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  // OAuth must return an authorization code.
  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=oauth_failed", requestUrl.origin)
    );
  }

  const supabase = await createClient();

  // Exchange the Google authorization code for a Supabase session.
  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error("OAuth code exchange failed:", exchangeError);

    return NextResponse.redirect(
      new URL("/login?error=oauth_failed", requestUrl.origin)
    );
  }

  // The session now exists in the server-side cookies.
  // Check whether this Google account is actually allowed.
  const user = await getAuthorizedUser();

  if (!user) {
    console.warn("Unauthorized Google account attempted to sign in.");

    // Immediately destroy the newly-created session.
    await supabase.auth.signOut();

    return NextResponse.redirect(
      new URL("/login?error=unauthorized", requestUrl.origin)
    );
  }

  // Authorized user.
  return NextResponse.redirect(
    new URL("/", requestUrl.origin)
  );
}