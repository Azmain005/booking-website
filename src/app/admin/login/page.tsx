import type { Metadata } from "next";

import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { Header } from "@/components/header";

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
    <div className="min-h-screen bg-background">
      <Header />
      <AuthShell
        badge="Admin Access"
        title="Admin sign in"
        description="Access booking operations, service configuration, analytics, and user activity monitoring."
        panelTitle="Protected area"
        panelDescription="Only authorized admins should access this dashboard."
        points={[
          "Manage bookings and payment statuses",
          "Add or edit service catalog items",
          "Monitor registered user activity",
        ]}
      >
        <AdminLoginForm />
      </AuthShell>
    </div>
  );
}
