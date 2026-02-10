import { PrismaClient } from "@prisma/client";
import prisma from '@/lib/prisma';

export async function seedResults(prisma: PrismaClient) {
    const students = await prisma.student.findMany({ take: 50 });
    const exams = await prisma.exam.findMany();

    for (const student of students) {
        for (const exam of exams.slice(0, 3)) {
            await prisma.result.create({
                data: {
                    score: Math.floor(Math.random() * 20),
                    studentId: student.id,
                    examId: exam.id,
                },
            });
        }
    }
}
