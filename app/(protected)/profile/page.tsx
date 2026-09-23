
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // User isn't logged in
  if (!user) {
    redirect("/login");
  }

  const metadata = user.user_metadata;

  const name =
    metadata?.full_name ||
    metadata?.name ||
    "Unknown User";

  const email = user.email || "No email available";

  const avatar =
    metadata?.avatar_url ||
    metadata?.picture ||
    null;

  return (
    <main className="profile-page">
        <LogoutButton />
      <div className="profile-card">
        <div className="profile-avatar">
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
        </div>

        <div className="profile-info">
          <h1>{name}</h1>
          <p>{email}</p>
        </div>

        <div className="profile-details">
          <div className="profile-detail">
            <span>Name</span>
            <strong>{name}</strong>
          </div>

          <div className="profile-detail">
            <span>Email</span>
            <strong>{email}</strong>
          </div>

          <div className="profile-detail">
            <span>Provider</span>
            <strong>Google</strong>
          </div>
        </div>
      </div>
    </main>
  );
}

