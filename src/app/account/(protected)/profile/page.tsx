import { ProfileForm } from "@/components/account/profile-form";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ProfilePage() {
  const session = await getAuthSession();
  const userId = session?.user?.id;
  if (!userId) {
    notFound();
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      _count: {
        select: {
          bookings: true,
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your profile</h1>
            <p className="text-muted-foreground">
              Manage your account details and bookings.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/account/bookings">
              <Button variant="outline">My bookings</Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Account details</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileForm
                initialName={user.name ?? ""}
                initialPhone={user.phone ?? ""}
                email={user.email}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-muted-foreground">Booked sessions</p>
              <p className="text-2xl font-bold">{user._count.bookings}</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
