import type { Metadata } from "next";

import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { Header } from "@/components/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Admin Login",
  description:
    "Administrative access to manage bookings and view business analytics.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Admin Login | Serene Wellness",
    description:
      "Administrative access to manage bookings and view business analytics.",
    type: "website",
  },
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin</CardTitle>
            <CardDescription>
              Sign in to view and manage bookings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdminLoginForm />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
