"use server";

import { FC } from "react";
import prisma from "@/lib/prisma";
import {
  Users,
  GraduationCap,
  User,
  CalendarX2,
  Book,
  MessageSquare,
  Mail,
} from "lucide-react";

interface UserCardsProps {
  type:
  | "admin"
  | "student"
  | "teacher"
  | "parent"
  | "absence"
  | "subject"
  | "message"
  | "conversation";
}

const cardData = {
  admin: {
    title: "Admin",
    icon: <Users size={40} className="opacity-50" />,
    color: "bg-blue-600",
  },
  student: {
    title: "Élèves inscrits",
    icon: <GraduationCap size={40} className="opacity-50" />,
    color: "bg-green-600",
  },
  teacher: {
    title: "Enseignants",
    icon: <User size={40} className="opacity-50" />,
    color: "bg-yellow-500",
  },
  parent: {
    title: "Parents",
    icon: <Users size={40} className="opacity-50" />,
    color: "bg-green-700",
  },
  absence: {
    title: "Absences",
    icon: <CalendarX2 size={40} className="opacity-50" />,
    color: "bg-red-600",
  },
  subject: {
    title: "Matières",
    icon: <Book size={40} className="opacity-50" />,
    color: "bg-blue-700",
  },
  message: {
    title: "Messages",
    icon: <MessageSquare size={40} className="opacity-50" />,
    color: "bg-green-500",
  },
  conversation: {
    title: "Conversations",
    icon: <Mail size={40} className="opacity-50" />,
    color: "bg-yellow-500",
  },
};

const UserCards = async ({ type }: UserCardsProps) => {
  // Map dynamic Prisma models
  const prismaModels: any = {
    admin: prisma.admin,
    student: prisma.student,
    teacher: prisma.teacher,
    parent: prisma.parent,
  };


  // Only use Prisma count for the supported types
  // const dynamicCount = prismaModels[type]
  //   ? await prismaModels[type].count()
  //   : 0;


  let dynamicCount = 0;

  try {
    if (prismaModels[type]) {
      dynamicCount = await prismaModels[type].count();
    }
  } catch (error) {
    console.error("Prisma count failed:", error);
  }

  const meta = cardData[type];

  return (
    <div
      className={`${meta.color} text-white flex flex-col justify-between p-2 rounded-xl shadow-md w-full
       md:w-42 h-26 mb-2`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold">{dynamicCount}</h2>
          <p className="text-sm">{meta.title}</p>
        </div>
        {meta.icon}
      </div>

      <button className="mt-2 text-sm bg-white/10 hover:bg-white/20 cursor-pointer transition-colors duration-300 rounded-md px-3 py-1 flex items-center justify-center">
        Voir plus →
      </button>
    </div>
  );
};

export default UserCards;
