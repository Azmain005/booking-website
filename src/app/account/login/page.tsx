import { LoginForm } from "@/components/account/login-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { Header } from "@/components/header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to continue to secure checkout and your account.",
};

export default function AccountLoginPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <AuthShell
        badge="Customer Access"
        title="Welcome back"
        description="Sign in to complete checkout faster, track your bookings, and manage your profile in one place."
        panelTitle="Why sign in?"
        panelDescription="Your account keeps booking details in one secure dashboard."
        points={[
          "Pay securely with your booking linked to your account",
          "View booking history and status updates",
          "Manage your profile details anytime",
        ]}
      >
        <LoginForm />
      </AuthShell>
    </div>
  );
}
