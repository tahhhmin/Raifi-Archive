import styles from '@/app/(protected)/profile/page.module.css'
import LogoutButton from '@/components/LogoutButton';

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
    const supabase = await createClient();

    const {data: { user }} = await supabase.auth.getUser();
    if (!user) {redirect("/login")}

    const metadata = user.user_metadata;
    const name = metadata?.full_name || metadata?.name || "Unknown User";
    const email = user.email || "No email available";
    const avatar = metadata?.avatar_url || metadata?.picture || null;

    return (
        <main>
            <div className={styles.container}>
                {avatar ? (
                    <img
                    src={avatar}
                    alt={`${name}'s profile picture`}
                    />
                ) : (
                    <div className="profile-avatar-placeholder">
                    {name.charAt(0).toUpperCase()}
                    </div>
                )}
                <h1>{name}</h1>
                <p>{email}</p> 

                <LogoutButton/>
            </div>
        </main>
    );
}

