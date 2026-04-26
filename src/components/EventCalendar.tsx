"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { toLocalISODate } from "@/lib/date";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

export type Event = {
  id: number;
  title: string;
  startDate: string;
};

type Props = {
  events: Event[];
};

const EventCalendar = ({ events }: Props) => {
  const [value, onChange] = useState<Value>(new Date());
  const router = useRouter();

  useEffect(() => {
    if (value instanceof Date) {
      router.push(`?date=${value.toISOString().split("T")[0]}`);
    }
  }, [value, router]);

  return (
    <Calendar
      value={value}
      onChange={onChange}
      locale="fr-FR"
      formatMonthYear={(locale, date) =>
        date
          .toLocaleDateString("fr-FR", {
            month: "long",
            year: "numeric",
          })
          .replace(/^\p{L}/u, (c) => c.toUpperCase())
      }

      tileContent={({ date, view }) => {
        if (view !== "month") return null;

        const day = toLocalISODate(date);
        const dayEvents = events.filter(e => e.startDate === day);

        if (dayEvents.length === 0) return null;

        return (
          <div className="flex flex-col gap-1 mt-1">
            {dayEvents.map(event => (
              <span
                key={event.id}
                className="text-[10px] bg-blue-500 text-white rounded px-1 truncate"
              >
                {event.title}
              </span>
            ))}
          </div>
        );
      }}
    />
  );
};

export default EventCalendar;
