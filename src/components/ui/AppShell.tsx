"use client";

import { BottomNav } from "@/components/kolo/BottomNav";
import { SideNav } from "@/components/kolo/SideNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[var(--kolo-bg)]">
      <SideNav />
      <div className="flex min-h-screen flex-1 flex-col">
        <main className="flex-1">{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}
