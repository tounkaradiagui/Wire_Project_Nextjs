import { PrismaClient } from "@prisma/client";

export async function seedResults(prisma: PrismaClient, terms: any[]) {
    const students = await prisma.student.findMany({ take: 50 });

    const exams = await prisma.exam.findMany({
        include: {
            lesson: true, // 🔥 IMPORTANT
        },
    });

    for (const student of students) {
        for (const exam of exams.slice(0, 3)) {

            // 🎯 Trouver le bon trimestre (logique intelligente)
            const examDate = exam.startTime;

            const term =
                terms.find(
                    (t) =>
                        examDate >= new Date(t.startDate) &&
                        examDate <= new Date(t.endDate)
                ) || terms[0]; // fallback

            await prisma.result.create({
                data: {
                    score: Math.floor(Math.random() * 20),

                    studentId: student.id,

                    // 🔥 CONTEXTE ACADÉMIQUE
                    examId: exam.id,
                    subjectId: exam.lesson.subjectId,
                    teacherId: exam.lesson.teacherId,
                    termId: term.id,

                    // optionnel
                    appreciation:
                        Math.random() > 0.5 ? "Bon travail" : undefined,
                },
            });
        }
    }

    console.log("✅ Results seeded with term, subject, teacher");
}