"use client";

// Client shell around the app chrome. The root layout is a Server Component —
// anything that needs the pathname (Navbar, particles) lives here instead.
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import { ParticleBackground } from "./ParticleBackground";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showParticles = !pathname.includes("/dashboard");

  return (
    <>
      <Navbar />
      {showParticles && <ParticleBackground />}
      <main className="min-h-screen bg-transparent pt-4">{children}</main>
    </>
  );
}
