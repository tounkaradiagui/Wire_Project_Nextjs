import prisma from "@/lib/prisma";

const StudentAttendanceCard = async ({ id }: { id: string }) => {

  const startOfYear = new Date(new Date().getFullYear(), 0, 1);

  const totalDays = await prisma.attendance.count({
    where: {
      studentId: id,
      session: {
        date: { gte: startOfYear },
      },
    },
  });

  const presentDays = await prisma.attendance.count({
    where: {
      studentId: id,
      status: "PRESENT",
      session: {
        date: { gte: startOfYear },
      },
    },
  });

  // Calculer le pourcentage de présence d'un étudiant depuis le début de l'année en comptant le nombre total de jours d'absence et de présence, 
  // puis en calculant le pourcentage de jours de présence par rapport au total des jours d'absence et de présence
  const percentage =
    totalDays === 0 ? 0 : Math.round((presentDays / totalDays) * 100);

  return (
    <div>
      <h1 className="text-2xl font-semibold">{percentage}%</h1>
      <span className="text-sm opacity-90">Présence</span>
    </div>
  );
};

export default StudentAttendanceCard;