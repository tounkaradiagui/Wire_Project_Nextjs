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

  // --- 2. Récupérer les présences depuis la base de données ---

  const resData = await prisma.attendance.findMany({
    where: {
      date: {
        gte: lastMonday, // On récupère seulement à partir du lundi
      },
    },
    select: {
      date: true, // Récupère la date
      present: true, // Récupère s’il était présent (true/false)
    },
  });

  // --- 3. Préparer la structure de données pour le graphique ---

  // Jours de la semaine (version française abrégée)
  const daysOfWeek = ["Lun", "Mar", "Mer", "Jeu", "Ven"];

  // Structure pour stocker le nombre de présents / absents par jour
  const attendanceMap: { [key: string]: { present: number; absent: number } } =
    {
      Lun: { present: 0, absent: 0 },
      Mar: { present: 0, absent: 0 },
      Mer: { present: 0, absent: 0 },
      Jeu: { present: 0, absent: 0 },
      Ven: { present: 0, absent: 0 },
    };

  //   console.log(attendanceMap);

  // --- 4. Remplir la map d'assiduité ---

  resData.forEach((item) => {
    const itemDate = new Date(item.date); // Convertit la date en objet JS
    const day = itemDate.getDay(); // Jour de la semaine

    // On ne prend que les jours du lundi au vendredi
    if (day >= 1 && day <= 5) {
      const dayName = daysOfWeek[day - 1]; // Convertit 1–5 en Lun–Ven

      // Ajout dans le compteur selon présence ou absence
      if (item.present) {
        attendanceMap[dayName].present += 1;
      } else {
        attendanceMap[dayName].absent += 1;
      }
    }
  });

  // --- 5. Préparer les données finales pour le graphique ---

  const data = daysOfWeek.map((day) => ({
    name: day, // Nom du jour
    present: attendanceMap[day].present, // Nombre de présents
    absent: attendanceMap[day].absent, // Nombre d’absents
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
