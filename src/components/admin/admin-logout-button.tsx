"use client";

import { LogOut } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function AdminLogoutButton() {
  async function logout() {
    const toastId = toast.loading("Signing out...");
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
      toast.dismiss(toastId);
      toast.success("Signed out successfully");
      window.location.href = "/admin/login";
    } catch {
      toast.dismiss(toastId);
      toast.error("Failed to sign out");
    }
  }

  return (
    <Button
      variant="outline"
      onClick={logout}
      className="gap-2 text-muted-foreground hover:text-destructive hover:border-destructive/50"
    >
      <LogOut className="h-4 w-4" />
      <span>Logout</span>
    </Button>
  );
}
