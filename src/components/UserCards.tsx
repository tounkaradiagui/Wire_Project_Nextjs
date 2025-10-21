"use client";
import { FC } from "react";
import { Users, GraduationCap, User, CalendarX2, Book, MessageSquare, Mail } from "lucide-react";

interface UserCardsProps {
  type:
    | "staff"
    | "student"
    | "teacher"
    | "parent"
    | "absence"
    | "subject"
    | "message"
    | "conversation";
}

const cardData = {
  staff: {
    title: "Staffs",
    count: 10,
    icon: <Users size={40} className="opacity-50" />,
    color: "bg-blue-600",
  },
  student: {
    title: "Élèves inscrits",
    count: 2760,
    icon: <GraduationCap size={40} className="opacity-50" />,
    color: "bg-green-600",
  },
  teacher: {
    title: "Enseignants",
    count: 85,
    icon: <User size={40} className="opacity-50" />,
    color: "bg-yellow-500",
  },
  parent: {
    title: "Parents",
    count: 2340,
    icon: <Users size={40} className="opacity-50" />,
    color: "bg-green-700",
  },
  absence: {
    title: "Absences",
    count: 0,
    icon: <CalendarX2 size={40} className="opacity-50" />,
    color: "bg-red-600",
  },
  subject: {
    title: "Matières",
    count: 1,
    icon: <Book size={40} className="opacity-50" />,
    color: "bg-blue-700",
  },
  message: {
    title: "Messages",
    count: 1,
    icon: <MessageSquare size={40} className="opacity-50" />,
    color: "bg-green-500",
  },
  conversation: {
    title: "Conversations",
    count: 1,
    icon: <Mail size={40} className="opacity-50" />,
    color: "bg-yellow-500",
  },
};

const UserCards: FC<UserCardsProps> = ({ type }) => {
  const data = cardData[type];

  return (
    <div
      className={`${data.color} text-white flex flex-col justify-between p-4 rounded-xl shadow-md w-full md:w-56 h-32 mb-2`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold">{data.count}</h2>
          <p className="text-sm">{data.title}</p>
        </div>
        {data.icon}
      </div>

      <button className="mt-4 text-sm bg-white/10 hover:bg-white/20 cursor-pointer transition-colors duration-300 rounded-md px-3 py-1 flex items-center justify-center">
        Voir plus →
      </button>
    </div>
  );
};

export default UserCards;
