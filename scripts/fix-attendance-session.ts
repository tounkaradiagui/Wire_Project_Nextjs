import prisma from "@/lib/prisma";

async function fixAttendanceSession() {
  const lesson = await prisma.lesson.findFirst({
    include: {
      class: true,
      teacher: true,
    },
  });

  if (!lesson) throw new Error("Lesson not found");

  const session = await prisma.session.create({
    data: {
      date: new Date("2026-02-24T08:00:00"),
      startTime: new Date("2026-02-24T08:00:00"),
      endTime: new Date("2026-02-24T09:00:00"),
      room: "Salle 1",
      lessonId: lesson.id,
      teacherId: lesson.teacherId,
      classId: lesson.classId, // ✅ récupéré automatiquement
    },
  });

  console.log("Session créée :", session);
}

fixAttendanceSession()
  .catch(console.error)
  .finally(() => prisma.$disconnect());