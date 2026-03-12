import { redirect } from "next/navigation";

import { isAdminAuthed } from "@/lib/admin-auth";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAdminAuthed();
  if (!authed) {
    redirect("/admin/login");
  }

  return <>{children}</>;
}
