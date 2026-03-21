"use server";
// Indique que ce composant s’exécute côté serveur (Server Component)

import Image from "next/image";
import AttendanceChart from "@/components/AttendanceChart";
import prisma from "@/lib/prisma";

const AttendanceChartContainer = async () => {
  // --- 1. Déterminer la date du lundi de la semaine en cours ---

  const today = new Date(); // Date actuelle
  const dayOfWeek = today.getDay(); // Numéro du jour (0 = dimanche, 1 = lundi, etc.)

  // Si nous sommes dimanche (0), on recule de 6 jours. Sinon on enlève dayOfWeek - 1.
  const daySinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const lastMonday = new Date(today); // Copie de la date actuelle
  lastMonday.setDate(today.getDate() - daySinceMonday); // Reculer jusqu'au lundi
  lastMonday.setHours(0, 0, 0, 0);

  const nextSunday = new Date(lastMonday);
  nextSunday.setDate(lastMonday.getDate() + 6);
  nextSunday.setHours(23, 59, 59, 999);

  // --- 2. Récupérer les présences depuis la base de données ---

  const resData = await prisma.attendance.findMany({
    where: {
      isDeleted: false,
      session: {
        is: {
          date: {
            gte: lastMonday,
            lte: nextSunday,
          },
          isDeleted: false,
        },
      },
    },
    select: {
      status: true,
      session: {
        select: {
          date: true,
        },
      },
    },
  });

  const formatted = resData.map((item) => ({
    date: item.session?.date,
    status: item.status,
  }));

  // --- 3. Préparer la structure de données pour le graphique ---
  // Jours de la semaine (version française abrégée)
  const daysOfWeek = ["Lun", "Mar", "Mer", "Jeu", "Ven"];

  // Structure pour stocker le nombre de présents / absents par jour
  const attendanceMap: Record<
    string,
    { absent: number; late: number }
  > = {
    Lun: { absent: 0, late: 0 },
    Mar: { absent: 0, late: 0 },
    Mer: { absent: 0, late: 0 },
    Jeu: { absent: 0, late: 0 },
    Ven: { absent: 0, late: 0 },
  };

  //   console.log(attendanceMap);

  // --- 4. Remplir la map d'assiduité ---
  resData.forEach((item) => {
    if (!item.session) return;

    const itemDate = new Date(item.session.date); // Convertit la date en objet JS
    const day = itemDate.getDay(); // Jour de la semaine

    // On ne prend que les jours du lundi au vendredi
    if (day >= 1 && day <= 5) {
      const dayName = daysOfWeek[day - 1];// Convertit 1–5 en Lun–Ven

      // Ajout dans le compteur selon présence ou absence
      switch (item.status) {
        case "ABSENT":
          attendanceMap[dayName].absent += 1;
          break;

        case "LATE":
          attendanceMap[dayName].late += 1;
          break;
      }
    }
  });

  // --- 5. Préparer les données finales pour le graphique ---
  const data = daysOfWeek.map((day) => ({
    name: day,
    absent: attendanceMap[day].absent,
    late: attendanceMap[day].late,
  }));

  //   console.log(data);

  // --- 6. Rendu du composant ---

  return (
    <div className="bg-white rounded-xl w-full h-full p-4 shadow-md">
      {/* Titre du graphique + bouton d’options */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Assiduité</h2>
        <Image
          src="/moreDark.png"
          alt="Options du graphique d'assiduité"
          width={14}
          height={14}
          className="cursor-pointer"
        />
      </div>

      {/* Affichage du graphique */}
      <div className="relative w-full h-[75%]">
        <AttendanceChart data={data} />
      </div>
    </div>
  );
};

export default AttendanceChartContainer;
