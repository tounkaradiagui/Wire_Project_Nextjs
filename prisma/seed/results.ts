import { PrismaClient } from "@prisma/client";

export async function seedResults(prisma: PrismaClient, terms: any[]) {
    const students = await prisma.student.findMany({ take: 50 });
    const exams = await prisma.exam.findMany({ include: { lesson: true } });

    for (const student of students) {
        for (const exam of exams.slice(0, 3)) {
            const term =
                terms.find(
                    (t) =>
                        exam.startTime >= new Date(t.startDate) &&
                        exam.startTime <= new Date(t.endDate)
                ) || terms[0];

            await prisma.result.upsert({
                where: {
                    studentId_examId: {
                        studentId: student.id,
                        examId: exam.id,
                    },
                },
                update: {},
                create: {
                    score: Math.floor(Math.random() * 20),
                    studentId: student.id,
                    examId: exam.id,
                    subjectId: exam.lesson.subjectId,
                    teacherId: exam.lesson.teacherId,
                    termId: term.id,
                    appreciation: Math.random() > 0.5 ? "Bon travail" : undefined,
                },
            });
        }
    }

    console.log("Résultats seedés.");
}
