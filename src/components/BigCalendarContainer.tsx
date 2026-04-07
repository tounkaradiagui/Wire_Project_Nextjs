import prisma from "@/lib/prisma";
import BigCalendar from "@/components/BigCalendar";
import { adjustScheduleToCurrentWeek } from "@/lib/utils";

const BigCalendarContainer = async ({
  type,
  id,
}: {
  type: "teacherId" | "classId";
  id: string | number;
}) => {
  const now = new Date();

  // Lundi
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1);
  startOfWeek.setHours(0, 0, 0, 0);

  // Dimanche
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const dataRes = await prisma.session.findMany({
    where: {
      lesson: {
        ...(type === "teacherId"
          ? { teacherId: id as string }
          : { classId: id as number }),
      },
      // FILTRE SEMAINE ACTUELLE
      startTime: {
        gte: startOfWeek,
        lte: endOfWeek,
      },

      // éviter sessions supprimées
      isDeleted: false,
    },
    include: {
      lesson: true,
    },
  });

  const data = dataRes.map((session) => ({
    title: session.lesson.name,
    start: session.startTime,
    end: session.endTime,
  }));

  const schedule = adjustScheduleToCurrentWeek(data);

  return (
    <div>
      <BigCalendar data={data} />
    </div>
  );
};

export default BigCalendarContainer;