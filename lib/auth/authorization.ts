import { createClient } from "@/lib/supabase/server";

const allowedEmails = [
  process.env.ALLOWED_EMAIL_1,
  process.env.ALLOWED_EMAIL_2,
]
  .filter((email): email is string => Boolean(email))
  .map((email) => email.trim().toLowerCase());

export async function getAuthorizedUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const email = user.email?.trim().toLowerCase();

  if (!email) {
    return null;
  }

  if (!allowedEmails.includes(email)) {
    return null;
  }

  return user;
}