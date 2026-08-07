"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users2,
  Sparkles,
  Handshake,
  Wallet,
  Banknote,
  Megaphone,
  CalendarClock,
  CalendarDays,
  FileBarChart,
  LayoutDashboard,
  Bot,
  Bell,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/creators", label: "Creators", icon: Users2 },
  { href: "/deals", label: "Deals", icon: Handshake },
  { href: "/financeiro", label: "Financeiro", icon: Wallet },
  { href: "/saques", label: "Saques", icon: Banknote },
  { href: "/campanhas", label: "Campanhas", icon: Megaphone },
  { href: "/entregas", label: "Entregas", icon: CalendarClock },
  { href: "/calendario", label: "Calendário", icon: CalendarDays },
  { href: "/relatorios", label: "Relatórios", icon: FileBarChart },
  { href: "/ia", label: "Agente de IA", icon: Bot },
  { href: "/notificacoes", label: "Notificações", icon: Bell },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { open } = useSidebar();

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/" className="flex h-9 items-center gap-2 px-2">
          <Sparkles className="h-5 w-5 shrink-0 text-primary" />
          {open && <span className="text-sm font-semibold">CS Hub</span>}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarMenu>
            {NAV_ITEMS.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={item.exact ? pathname === item.href : pathname.startsWith(item.href)}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon />
                    {open && <span>{item.label}</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
