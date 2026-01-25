import { PrismaClient } from "../../src/generated/prisma";
import prisma from '@/lib/prisma';

export async function seedGradesAndClasses(prisma: PrismaClient) {
    for (let level = 1; level <= 9; level++) {
        const grade = await prisma.grade.create({
            data: { level },
        });

        await prisma.class.create({
            data: {
                name: `Classe ${level}`,
                capacity: 60,
                gradeId: grade.id,
            },
        });
    }
}
