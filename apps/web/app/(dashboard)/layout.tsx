import { cookies } from "next/headers";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const defaultSidebarOpen = cookieStore.get("cshub_sidebar_open")?.value !== "false";

  return <DashboardShell defaultSidebarOpen={defaultSidebarOpen}>{children}</DashboardShell>;
}
