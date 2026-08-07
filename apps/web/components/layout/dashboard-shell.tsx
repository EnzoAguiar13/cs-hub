"use client";

import * as React from "react";
import { useAuth } from "@/lib/auth-context";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Topbar } from "@/components/layout/topbar";
import { CommandPalette } from "@/components/layout/command-palette";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardShell({
  children,
  defaultSidebarOpen,
}: {
  children: React.ReactNode;
  defaultSidebarOpen: boolean;
}) {
  const { status } = useAuth();
  const [commandOpen, setCommandOpen] = React.useState(false);

  if (status !== "authenticated") {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={defaultSidebarOpen}>
      <AppSidebar />
      <SidebarInset>
        <Topbar onOpenCommandPalette={() => setCommandOpen(true)} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </SidebarInset>
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </SidebarProvider>
  );
}
