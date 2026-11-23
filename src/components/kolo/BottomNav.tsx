"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Dumbbell,
  Utensils,
  HeartPulse,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "Today", icon: Home },
  { href: "/train", label: "Train", icon: Dumbbell },
  { href: "/fuel", label: "Fuel", icon: Utensils },
  { href: "/health", label: "Health", icon: HeartPulse },
  { href: "/log", label: "Log", icon: PlusCircle },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--kolo-border)] bg-[var(--kolo-surface)]/95 backdrop-blur-md sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between px-2">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors",
                  active
                    ? "text-[var(--kolo-accent)]"
                    : "text-[var(--kolo-muted)] hover:text-[var(--kolo-ink)]"
                )}
              >
                <Icon
                  className={cn("h-5 w-5", active && "stroke-[2.25px]")}
                  strokeWidth={active ? 2.25 : 1.75}
                />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
