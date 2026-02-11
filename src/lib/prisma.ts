import { PrismaClient } from "@prisma/client";


// Create a singleton instance function
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ["query", "error", "warn"],
  });
};

// Extend globalThis with a prisma property (for hot reload in dev)
declare global {
  var prisma: ReturnType<typeof prismaClientSingleton> | undefined;
}

// Reuse existing instance or create a new one
const prisma = globalThis.prisma ?? prismaClientSingleton();

// If not in production, store it on globalThis to prevent multiple connections
if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

export default prisma;
