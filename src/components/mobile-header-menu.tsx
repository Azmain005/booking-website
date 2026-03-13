"use client";

import { HeaderUserControls } from "@/components/account/header-user-controls";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Menu } from "lucide-react";
import Link from "next/link";

interface MobileHeaderMenuProps {
  isLoggedIn: boolean;
  displayName: string;
}

export function MobileHeaderMenu({
  isLoggedIn,
  displayName,
}: MobileHeaderMenuProps) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-xl"
            aria-label="Open menu"
          />
        }
      >
        <Menu className="h-5 w-5" />
      </DialogTrigger>

      <DialogContent className="max-w-[calc(100%-2rem)] p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-border/70">
          <DialogTitle>Menu</DialogTitle>
        </DialogHeader>

        <div className="p-5 space-y-4">
          <Link
            href="/"
            className="block rounded-xl border border-border/60 px-4 py-3 text-sm font-semibold text-foreground hover:bg-accent/60 transition-colors"
          >
            Services
          </Link>

          <div className="rounded-xl border border-border/60 p-3">
            <HeaderUserControls
              isLoggedIn={isLoggedIn}
              displayName={displayName}
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border/60 p-3">
            <span className="text-sm font-medium text-muted-foreground">
              Theme
            </span>
            <ThemeToggle />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
