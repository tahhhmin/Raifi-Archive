import { redirect } from "next/navigation";
import { getAuthorizedUser } from "@/lib/auth/authorization";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthorizedUser();

  if (!user) {
    redirect("/login?error=unauthorized");
  }

  return <>{children}</>;
}