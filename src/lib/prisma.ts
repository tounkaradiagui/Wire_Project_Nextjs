import { PrismaClient } from "@prisma/client";


// Singleton pour PrismaClient afin d'éviter les problèmes de connexion multiples en développement avec le hot reload de Next.js
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ["error", "warn"],
  });
};

declare global {
  var prisma: ReturnType<typeof prismaClientSingleton> | undefined;
}

// Utiliser une instance globale de PrismaClient en développement pour éviter les problèmes de connexion multiples
const prisma = globalThis.prisma ?? prismaClientSingleton();

// En production on peut se permettre de créer une nouvelle instance sans risque de fuite de mémoire
if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

export default prisma;
