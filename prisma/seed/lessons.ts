import { PrismaClient } from "@prisma/client";

export async function seedLessons(prisma: PrismaClient) {
    const subjects = await prisma.subject.findMany();
    const classes = await prisma.class.findMany();
    const teachers = await prisma.teacher.findMany();

    for (const classItem of classes) {
        for (let i = 0; i < 3; i++) {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() + i);

            const dueDate = new Date(startDate);
            dueDate.setHours(startDate.getHours() + 1);

            await prisma.lesson.create({
                data: {
                    name: `Cours ${i + 1}`,
                    startDate,
                    dueDate,
                    subjectId: subjects[i % subjects.length].id,
                    classId: classItem.id,
                    teacherId: teachers[i % teachers.length].id,
                },
            });
        }
    }
}