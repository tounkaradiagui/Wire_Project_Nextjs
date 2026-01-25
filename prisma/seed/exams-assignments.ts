import { PrismaClient } from "../../src/generated/prisma";
import prisma from '@/lib/prisma';

export async function seedExamsAndAssignments(prisma: PrismaClient) {
    const lessons = await prisma.lesson.findMany();

    for (const lesson of lessons.slice(0, 10)) {
        await prisma.exam.create({
            data: {
                title: "Examen du trimestre",
                startTime: new Date(),
                endTime: new Date(),
                lessonId: lesson.id,
            },
        });

        await prisma.assignment.create({
            data: {
                title: "Devoir maison",
                startDate: new Date(),
                dueDate: new Date(),
                lessonId: lesson.id,
            },
        });
    }
}
