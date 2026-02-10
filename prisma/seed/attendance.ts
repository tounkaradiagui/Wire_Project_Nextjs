import { PrismaClient } from "@prisma/client";
import prisma from '@/lib/prisma';

export async function seedAttendance(prisma: PrismaClient) {
    const students = await prisma.student.findMany({ take: 50 });
    const lessons = await prisma.lesson.findMany({ take: 5 });

    for (const student of students) {
        for (const lesson of lessons) {
            await prisma.attendance.create({
                data: {
                    date: new Date(),
                    status: "ABSENT",
                    studentId: student.id,
                    lessonId: lesson.id,
                    comment: "Absent non justifié",
                    createdBy: "TEACHER",
                },
            });
        }
    }
}
