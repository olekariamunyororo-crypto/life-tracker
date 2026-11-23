"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardDocumentIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import { ThemeToggle } from "./ThemeToggle";

const linkClasses = (active: boolean, mobile = false) =>
  mobile
    ? `flex flex-col items-center py-3 w-1/2 ${
        active ? "text-primary-500" : "text-gray-500 dark:text-gray-400"
      }`
    : `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
        active
          ? "border-primary-500 text-gray-900 dark:text-gray-100"
          : "border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-200"
      }`;

export default function Navbar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="bg-white dark:bg-gray-900 shadow-md hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              {/* Logo/Brand */}
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-primary-500">Life Tracker</span>
              </div>

              {/* Navigation Links */}
              <div className="ml-6 flex space-x-8">
                <Link href="/" className={linkClasses(pathname === "/")}>
                  Daily Entry
                </Link>
                <Link href="/dashboard" className={linkClasses(pathname === "/dashboard")}>
                  Dashboard
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 shadow-lg sm:hidden z-50">
        <div className="flex justify-around items-center">
          <Link href="/" className={linkClasses(pathname === "/", true)}>
            <ClipboardDocumentIcon className="h-6 w-6" />
            <span className="text-xs mt-1">Daily Entry</span>
          </Link>
          <Link href="/dashboard" className={linkClasses(pathname === "/dashboard", true)}>
            <ChartBarIcon className="h-6 w-6" />
            <span className="text-xs mt-1">Dashboard</span>
          </Link>
          <div className="w-1/2 flex justify-center py-2">
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Add bottom padding to content on mobile to account for fixed nav */}
      <div className="pb-16 sm:pb-0"></div>
    </>
  );
}
