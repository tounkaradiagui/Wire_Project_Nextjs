import { PrismaClient } from "@prisma/client";

export async function seedExamsAndAssignments(prisma: PrismaClient) {
  const lessons = await prisma.lesson.findMany();

  for (const lesson of lessons.slice(0, 10)) {
    const now = new Date();
    const later = new Date(now.getTime() + 2 * 60 * 60 * 1000); // +2h

    await prisma.exam.create({
      data: {
        title: "Examen du trimestre",
        startTime: now,
        endTime: later,
        lessonId: lesson.id,
      },
    });

    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + 7);

    await prisma.assignment.create({
      data: {
        title: "Devoir maison",
        startDate: now,
        dueDate,
        lessonId: lesson.id,
      },
    });
  }

  console.log("✅ Examens et devoirs seedés.");
}
