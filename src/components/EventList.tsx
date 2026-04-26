"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// Validation de la date
function safeDate(value: any) {
  const d = new Date(value);
  return d instanceof Date && !isNaN(d.getTime()) ? d : null;
}

// Filtrer les events avec le role
export async function getEventsByDay(dateParam?: string) {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const baseDate = safeDate(dateParam) ?? new Date();

  const startOfDay = new Date(baseDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(baseDate);
  endOfDay.setHours(23, 59, 59, 999);

  // Filtrer les roles
  const roleConditions: Record<string, any> = {
    teacher: {
      class: {
        lessons: {
          some: { teacherId: userId! }
        }
      }
    },

    student: {
      class: {
        students: {
          some: { id: userId! }
        }
      }
    },

    parent: {
      class: {
        students: {
          some: { parentId: userId! }
        }
      }
    },
  };

  return prisma.event.findMany({
    where: {
      ...(role !== "admin" && {
        OR: [
          { classId: null },
          { class: roleConditions[role as keyof typeof roleConditions] || {} },
        ],
      }),
      startTime: {
        gte: startOfDay,
        lte: endOfDay
      }
    },
    orderBy: { startTime: "asc" }
  });
}

const EventList = async ({ dateParam }: { dateParam?: string }) => {
  const events = await getEventsByDay(dateParam);

  if (!events || events.length === 0) {
    return (
      <p className="text-gray-600 text-sm">Aucun événement pour cette date.</p>
    );
  }

  return (
    <div className="flex flex-col gap-4 mt-4">
      {events.map((event) => (
        <div
          key={event.id}
          className="p-5 rounded-md border-2 border-gray-100 border-t-4 odd:border-t-lamaSky even:border-t-lamaPurple"
        >
          <div className="flex items-center justify-between">
            <h1 className="font-semibold text-gray-600">{event.title}</h1>

            <span className="text-gray-300 text-xs">
              {event.startTime.toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false
              })}
            </span>
          </div>

          <p className="mt-2 text-gray-400 text-sm">{event.description}</p>
        </div>
      ))}
    </div>
  );
};

export default EventList;
