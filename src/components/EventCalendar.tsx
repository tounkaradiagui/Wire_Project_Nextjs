"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

// const events = [
//   {
//     id: 1,
//     title: "Réunion de l'équipe",
//     time: "10-05-2025 ",
//     description: "Discussion des objectifs du trimestre.",
//   },
//   {
//     id: 2,
//     title: "Atelier de formation",
//     time: "15-05-2025 ",
//     description: "Formation sur les nouvelles technologies.",
//   },
//   {
//     id: 3,
//     title: "Conférence annuelle",
//     time: "20-05-2025",
//     description: "Présentation des réalisations de l'année.",
//   },
// ];

const EventCalendar = () => {
  const [value, onChange] = useState<Value>(new Date());
  const router = useRouter();

  useEffect(() => {
    // Logique pour gérer les changements de date
    if (value instanceof Date) {
      router.push(`?date=${value.toLocaleDateString("fr-FR")}`); // Met à jour l'URL avec la date sélectionnée
    }
  }, [value, router]);

  return <Calendar onChange={onChange} value={value} />;
};

export default EventCalendar;
