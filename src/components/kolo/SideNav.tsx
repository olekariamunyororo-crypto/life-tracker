"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Dumbbell,
  Utensils,
  HeartPulse,
  PlusCircle,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const tabs = [
  { href: "/", label: "Today", icon: Home },
  { href: "/train", label: "Train", icon: Dumbbell },
  { href: "/fuel", label: "Fuel", icon: Utensils },
  { href: "/health", label: "Health", icon: HeartPulse },
  { href: "/log", label: "Log entry", icon: PlusCircle },
] as const;

export function SideNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-[var(--kolo-border)] bg-[var(--kolo-surface)] px-3 py-6 sm:flex lg:w-64">
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--kolo-accent)] text-white">
          <Moon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-tight">Kolo Tracker</p>
          <p className="text-xs text-[var(--kolo-muted)]">Daily recovery OS</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-[var(--kolo-accent)]/10 text-[var(--kolo-accent)]"
                  : "text-[var(--kolo-muted)] hover:bg-black/5 hover:text-[var(--kolo-ink)] dark:hover:bg-white/5"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-[var(--kolo-border)] pt-4 px-2">
        <ThemeToggle />
      </div>
    </aside>
  );
}
