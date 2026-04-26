import Image from "next/image";
import EventCalendar from "./EventCalendar";
import EventList from "./EventList";
import prisma from "@/lib/prisma";
import { toLocalISODate } from "@/lib/date";

type Props = {
  searchParams?: {
    date?: string;
  };
};

const EventCalendarContainer = async ({ searchParams }: Props) => {
  const selectedDate = searchParams?.date;

  // Récupérer tous les événements depuis la base de données, en sélectionnant uniquement les champs nécessaires pour l'affichage dans le calendrier
  const events = await prisma.event.findMany({
    select: {
      id: true,
      title: true,
      startTime: true,
    },
  });

  // Formater les événements récupérés pour les adapter au format attendu par le composant EventCalendar, en convertissant les dates en format ISO local
  const formattedEvents = events.map(e => ({
    id: e.id,
    title: e.title,
    startDate: toLocalISODate(e.startTime),
  }));

  return (
    <div className="bg-white rounded p-4 shadow-md">
      <div className="flex justify-center">
        <EventCalendar events={formattedEvents} />
      </div>

      <div className="flex flex-col gap-4 mt-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            Événements à venir
          </h2>
          <Image src="/moreDark.png" alt="Options" width={14} height={14} />
        </div>

        <EventList dateParam={selectedDate} />
      </div>
    </div>
  );
};

export default EventCalendarContainer;
