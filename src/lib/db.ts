import { PrismaClient } from "@prisma/client";

// Prisma singleton: one client per process, reused across hot reloads in dev.
// Never `new PrismaClient()` anywhere else — always `import { prisma } from "@/lib/db"`.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
