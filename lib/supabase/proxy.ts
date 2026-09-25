import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAllowedEmail } from "@/lib/auth/allowed-users";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  /*
   * No authenticated user.
   *
   * We don't redirect here yet because this proxy
   * currently handles the entire application.
   */
  if (!user) {
    return response;
  }

  /*
   * User is authenticated.
   * Check whether their email is in the allowed list.
   */
  const allowed = isAllowedEmail(user.email);

  console.log("Access check:", {
    email: user.email,
    allowed,
  });

  if (!allowed) {
    return NextResponse.redirect(
      new URL("/unauthorized", request.url)
    );
  }

  return response;
}