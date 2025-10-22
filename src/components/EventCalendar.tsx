"use client";

import Image from "next/image";
import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const events = [
  {
    id: 1,
    title: "Réunion de l'équipe",
    time: "10-05-2025 ",
    description: "Discussion des objectifs du trimestre.",
  },
  {
    id: 2,
    title: "Atelier de formation",
    time: "15-05-2025 ",
    description: "Formation sur les nouvelles technologies.",
  },
  {
    id: 3,
    title: "Conférence annuelle",
    time: "20-05-2025",
    description: "Présentation des réalisations de l'année.",
  },
];

const EventCalendar = () => {
  const [value, setValue] = useState<Value>(new Date());
  return (
    <div className="bg-white rounded p-4 shadow-md">
      {/* Calendrier */}
      <div className="flex justify-center">
        <Calendar
          value={value}
          onChange={setValue}
          locale="fr-FR"
          className="rounded-lg border-none shadow-sm"
          calendarType="gregory"
        />
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
        {events.map((event) => (
          <div
            className="p-4 rounded-md border-gray-100 border-t-4 odd:border-blue-500 even:border-green-500 shadow-sm"
            key={event.id}
          >
            <div className="flex items-center justify-between">
              <h1 className="font-semibold text-gray-600">{event.title}</h1>
              <span className="text-gray-500 text-xs">{event.time}</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">{event.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventCalendar;
