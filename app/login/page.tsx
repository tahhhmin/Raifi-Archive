"use client";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("Google login failed:", error);
    }
  }

  return (
    <main>
      <h1>raifi.archive</h1>

      <button type="button" onClick={signInWithGoogle}>
        Continue with Google
      </button>
    </main>
  );
}