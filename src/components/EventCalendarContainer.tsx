import Image from "next/image";
import EventList from "./EventList";
import EventCalendar from "./EventCalendar";

const EventCalendarContainer = async ({
  searchParams,
}: {
  searchParams: { [keys: string]: string | undefined };
}) => {
  // --- 1. Récupérer les événements depuis la base de données ---

  const { date } = searchParams;

  return (
    <div className="bg-white rounded p-4 shadow-md">
      {/* Calendrier */}
      <div className="flex justify-center">
        <EventCalendar />
      </div>
      {/* Événements */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center mt-4">
          <h2 className="text-lg font-semibold">Événements à venir</h2>
          <Image
            src="/moreDark.png"
            alt="Options d'événements"
            width={14}
            height={14}
            className="cursor-pointer"
          />
        </div>
        {/* Events */}
        <EventList dateParam={date} />
      </div>
    </div>
  );
};

export default EventCalendarContainer;
