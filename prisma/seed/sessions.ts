import { PrismaClient } from "@prisma/client";

export async function seedSessions(prisma: PrismaClient) {
    const lessons = await prisma.lesson.findMany({
        include: {
            class: true,
            teacher: true,
        },
    });

    for (const lesson of lessons) {
        for (let i = 0; i < 5; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);

            const startTime = new Date(date);
            startTime.setHours(8 + i, 0, 0);

            const endTime = new Date(startTime);
            endTime.setHours(startTime.getHours() + 1);

            await prisma.session.create({
                data: {
                    date,
                    startTime,
                    endTime,
                    room: `Salle ${i + 1}`,
                    lessonId: lesson.id,
                    teacherId: lesson.teacherId,
                    classId: lesson.classId,
                },
            });
        }
    }
}