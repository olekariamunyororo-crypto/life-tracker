import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./global.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { AppShell } from "@/components/ui/AppShell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Life Tracker",
    template: "%s | Life Tracker",
  },
  description:
    "Track office time, gym sessions, supplements, calories, protein, body weight and grip strength.",
  applicationName: "Life Tracker",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Life Tracker",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e2e8f0" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

// Server Component by design: metadata + static shell render on the server,
// and everything interactive is isolated inside client providers/shell.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
