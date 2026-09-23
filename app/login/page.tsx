"use client";

import styles from "@/app/login/page.module.css"
import { createClient } from "@/lib/supabase/client";
import { CornerDownRight } from "lucide-react";

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
        <main className={styles.main}>
            <section className={styles.container}>
                <h1 className={styles.title}>Raifi.archive</h1>
                <button className={styles.button} type="button" onClick={signInWithGoogle}>
                    <CornerDownRight size={22} strokeWidth={2.25}/> Continue with Google
                </button>
            </section>
        </main>
    );
}