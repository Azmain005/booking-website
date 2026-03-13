import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AccountProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    redirect("/account/login");
  }

  return <>{children}</>;
}
