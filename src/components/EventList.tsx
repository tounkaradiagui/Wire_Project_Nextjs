"use server";

import prisma from "@/lib/prisma";

// ------------------------------------------------------------
// Fonction qui vérifie si une valeur représente une date valide
// ------------------------------------------------------------
function safeDate(value: any) {
  const d = new Date(value);

  // On retourne la date uniquement si elle est valide
  return d instanceof Date && !isNaN(d.getTime()) ? d : null;
}

// ------------------------------------------------------------
// Fonction pour récupérer tous les événements d'un jour donné
// ------------------------------------------------------------
export async function getEventsByDay(dateParam?: string) {
  // On transforme dateParam en Date valide, sinon on utilise la date du jour
  const baseDate = safeDate(dateParam) ?? new Date();

  // Création d’un objet Date représentant le début du jour (00:00:00)
  const startOfDay = new Date(baseDate);
  startOfDay.setHours(0, 0, 0, 0);

  // Création d’un objet Date représentant la fin du jour (23:59:59)
  const endOfDay = new Date(baseDate);
  endOfDay.setHours(23, 59, 59, 999);

  // Requête Prisma pour récupérer tous les événements où startTime
  // se trouve entre le début et la fin du jour demandé
  return prisma.event.findMany({
    where: {
      startTime: {
        gte: startOfDay, // supérieur ou égal au début de journée
        lte: endOfDay, // inférieur ou égal à la fin de journée
      },
    },
    orderBy: { startTime: "asc" }, // Trie les événements du plus tôt au plus tard
  });
}

// ------------------------------------------------------------
// Composant EventList : affiche les événements d'un jour donné
// ------------------------------------------------------------
const EventList = async ({ dateParam }: { dateParam?: string }) => {
  // Récupère les événements du jour via la fonction utilitaire
  const events = await getEventsByDay(dateParam);

  // On génère un composant <div> pour chaque événement
  return events.map((event) => (
    <div
      className="p-5 rounded-md border-2 border-gray-100 border-t-4 odd:border-t-lamaSky even:border-t-lamaPurple"
      key={event.id}
    >
      <div className="flex items-center justify-between">
        {/* Titre de l'événement */}
        <h1 className="font-semibold text-gray-600">{event.title}</h1>

        {/* Heure de début formatée en français (HH:MM) */}
        <span className="text-gray-300 text-xs">
          {event.startTime.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false, // Format 24h
          })}
        </span>
      </div>

      {/* Description de l'événement */}
      <p className="mt-2 text-gray-400 text-sm">{event.description}</p>
    </div>
  ));
};

export default EventList;
