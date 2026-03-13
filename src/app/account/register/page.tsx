import { RegisterForm } from "@/components/account/register-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { Header } from "@/components/header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create account",
  description:
    "Create an account to continue to secure checkout and manage your bookings.",
};

export default function AccountRegisterPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <AuthShell
        badge="Create Account"
        title="Set up your customer account"
        description="Create an account to continue checkout, monitor your bookings, and update your profile quickly."
        panelTitle="Account benefits"
        panelDescription="A customer account gives you faster repeat bookings and better visibility."
        points={[
          "Checkout is linked to your user profile",
          "Track your appointments from one place",
          "Keep contact details updated for confirmations",
        ]}
      >
        <RegisterForm />
      </AuthShell>
    </div>
  );
}
