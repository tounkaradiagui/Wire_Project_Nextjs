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
  const dataRes = await prisma.session.findMany({
    where: {
      lesson: {
        ...(type === "teacherId"
          ? { teacherId: id as string }
          : { classId: id as number }),
      },
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
      <BigCalendar data={schedule} />
    </div>
  );
};

export default BigCalendarContainer;