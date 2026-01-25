import { PrismaClient } from "../../src/generated/prisma";
import prisma from '@/lib/prisma';

export async function seedAdmins(prisma: PrismaClient) {
    await prisma.admin.createMany({
        data: [
            { id: "admin1", username: "admin.principal" },
            { id: "admin2", username: "admin.secondaire" },
        ],
    });
}