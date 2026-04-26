"use client";
import { Calendar, momentLocalizer, View, Views } from "react-big-calendar";
import moment from "moment";
import "moment/locale/fr";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState } from "react";

// Configurer moment pour la localisation en français
moment.locale("fr");
const localizer = momentLocalizer(moment);

const BigCalendar = ({ data }: { data: { title: string; start: Date; end: Date }[] }) => {
  const [view, setView] = useState<View>(Views.WORK_WEEK);

  const handleViewChange = (selectedView: View) => {
    setView(selectedView);
  };

  // Traduction complète des libellés
  const messages = {
    today: "Aujourd’hui",
    previous: "Précédent",
    next: "Suivant",
    month: "Mois",
    week: "Semaine",
    work_week: "Semaine",
    day: "Jour",
    agenda: "Agenda",
    date: "Date",
    time: "Heure",
    event: "Événement",
    allDay: "Toute la journée",
    noEventsInRange: "Aucun événement dans cette période",
    showMore: (total: number) => `+ ${total} de plus`,
  };

  return (
    <Calendar
      culture="fr"
      localizer={localizer}
      events={data}
      startAccessor="start"
      endAccessor="end"
      views={[Views.WORK_WEEK, Views.DAY]}
      view={view}
      onView={handleViewChange}
      defaultView={Views.WORK_WEEK}
      defaultDate={new Date()}
      style={{ height: 550 }}
      min={new Date(0, 0, 0, 8, 0)}
      max={new Date(0, 0, 0, 17, 0)}
      messages={messages}
    />

  );
};

export default BigCalendar;
