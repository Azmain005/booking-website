"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";

interface HeaderUserControlsProps {
  isLoggedIn: boolean;
  displayName?: string;
}

export function HeaderUserControls({
  isLoggedIn,
  displayName,
}: HeaderUserControlsProps) {
  if (!isLoggedIn) {
    return (
      <Link
        href="/account/login"
        className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-all duration-200 rounded-xl hover:bg-accent/80 relative group"
      >
        <span className="relative z-10">Sign in</span>
        <div className="absolute inset-0 bg-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/account/profile"
        className="max-w-40 truncate px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-all duration-200 rounded-xl hover:bg-accent/80 relative group"
        title={displayName ?? "Account"}
      >
        <span className="relative z-10">{displayName ?? "Account"}</span>
        <div className="absolute inset-0 bg-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </Link>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-9 gap-1.5"
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        <LogOut className="h-3.5 w-3.5" />
        Logout
      </Button>
    </div>
  );
}
