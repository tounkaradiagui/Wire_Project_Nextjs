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
  // Calculer le début et la fin de la semaine actuelle pour filtrer les sessions à afficher dans le calendrier
  const now = new Date();

  // Lundi
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1);
  startOfWeek.setHours(0, 0, 0, 0);

  // Dimanche
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  // Récupérer les sessions de la semaine actuelle pour le professeur ou la classe spécifiée, en incluant les informations sur le cours associé à chaque session
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

  // Transformer les données récupérées pour les adapter au format attendu par le composant BigCalendar, puis ajuster les horaires des sessions pour les faire correspondre à la semaine actuelle
  const data = dataRes.map((session) => ({
    title: session.lesson.name,
    start: session.startTime,
    end: session.endTime,
  }));

  return (
    <div>
      <BigCalendar data={data} />
    </div>
  );
};

export default BigCalendarContainer;