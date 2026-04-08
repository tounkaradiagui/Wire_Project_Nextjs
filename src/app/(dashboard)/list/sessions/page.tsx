"use server";

import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { Prisma } from "@prisma/client";
import { ITEM_PER_PAGE } from "@/lib/settings";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
import SessionFiltersModal from "@/lib/filters/SessionFiltersModal";
import ActiveFilters from "@/lib/filters/ActiveFilters";
import ResetFiltersButton from "@/lib/filters/ResetFiltersButton";
import TableActions from "@/lib/helpers/TableActions";

/* ================= TYPE ================= */

type SessionList = Prisma.SessionGetPayload<{
  include: {
    lesson: {
      include: {
        class: true;
        teacher: true;
      };
    };
  };
}>;

const SessionListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { page, lessonId, ...queryParams } = await searchParams;
  const p = page ? parseInt(page) : 1;

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  /* ================= COLUMNS ================= */

  const columns = [
    { header: "Classe", accessor: "class" },
    { header: "Cours", accessor: "lesson" },
    { header: "Date", accessor: "date" },
    { header: "Horaire", accessor: "time" },
    { header: "Salle", accessor: "room" },
    ...(role === "admin" || role === "teacher" || role === "super_admin"
      ? [{ header: "Actions", accessor: "actions" }]
      : []),
  ];

  /* ================= ROW ================= */

  const renderRow = (item: SessionList) => (
    <tr
      key={item.id}
      className="border-b even:bg-slate-50 hover:bg-blue-50"
    >
      <td className="p-4">{item.lesson?.class?.name}</td>

      <td>{item.lesson?.name ?? "-"}</td>

      <td>
        {"Semaine du"} {new Intl.DateTimeFormat("fr-FR").format(new Date(item.date))}
      </td>

      <td>
        {new Intl.DateTimeFormat("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date(item.startTime))
      }
        {" - "}
        {new Intl.DateTimeFormat("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",          
        }).format(new Date(item.endTime))}
      </td>

      <td>{item.room ?? "Non définie"}</td>


      {(role === "admin" || role === "super_admin" || role === "teacher") && (
        <td>
          <div className="flex gap-2 items-center">
              <Link href={`/list/attendances?sessionId=${item.id}`}>
                <button
                  title="Voir les absences de cette séance"
                  className="flex items-center gap-1 cursor-pointer px-3 py-1 text-xs rounded-md bg-green-600 text-white hover:bg-green-700"
                  >
                  <ClipboardCheck size={16} />
                </button>
              </Link>
            {(role === "super_admin") && (
              <>
                <FormContainer table="session" type="update" data={item} />
                <FormContainer table="session" type="delete" id={item.id} />
              </>
            )}
          </div>
        </td>
      )}
    </tr>
  );

  /* ================= QUERY ================= */

  const query: Prisma.SessionWhereInput = {
    isDeleted: false,
  };

  // ----------------
  // FILTER lessonId (déjà présent)
  // ----------------
  if (lessonId) {
    query.lessonId = parseInt(lessonId);
  }

  // ----------------
  // RBAC
  // ----------------
  if (role === "teacher") {
    query.teacherId = userId!;
  }

  // ----------------
  // FILTERS
  // ----------------
  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (!value) continue;

      switch (key) {
        case "classId":
          const classId = Number(value);
          if (!isNaN(classId)) {
            query.classId = classId;
          }
          break;

        case "lessonId":
          const lessonId = Number(value);
          if (!isNaN(lessonId)) {
            query.lessonId = lessonId;
          }
          break;

        case "teacherId":
          query.teacherId = value;
          break;

        case "date":
          query.date = {
            gte: new Date(value),
            lt: new Date(new Date(value).setHours(23, 59, 59)),
          };
          break;

        case "search":
          query.lesson = {
            name: {
              contains: value,
              mode: "insensitive",
            },
          };
          break;
      }
    }
  }

  // Tri dynamique
  const allowedSortFields = ["date", "startTime", "endTime"];

  const sortBy = allowedSortFields.includes(queryParams.sortBy || "")
    ? queryParams.sortBy
    : "date";

  const sortOrder =
    queryParams.sortOrder === "asc" ? "asc" : "desc";

  const orderBy: Prisma.SessionOrderByWithRelationInput = {
    [sortBy!]: sortOrder,
  };


  /* ================= DATA ================= */
  const [data, count, classes, teachers, lessons] =
    await prisma.$transaction([

      prisma.session.findMany({
        where: query,
        include: {
          lesson: {
            include: {
              class: true,
              teacher: true,
            },
          },
        },
        take: ITEM_PER_PAGE,
        skip: ITEM_PER_PAGE * (p - 1),
        orderBy,
      }),

      prisma.session.count({ where: query }),

      prisma.class.findMany({
        select: { id: true, name: true },
      }),

      prisma.teacher.findMany({
        select: { id: true, name: true, surname: true },
      }),

      prisma.lesson.findMany({
        select: { id: true, name: true },
      }),
    ]);
  
  const serializedData = data.map((item) => ({
    ...item,
    date: item.date ? item.date.toISOString() : null,
    startTime: item.startTime ? item.startTime.toISOString() : null,
    endTime: item.endTime ? item.endTime.toISOString() : null,
    lesson: item.lesson ? {
      ...item.lesson,
    } : null,
  })) as unknown as SessionList[];

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          {lessonId
            ? "Séances du cours "
            : "Gestion des séances"}
        </h1>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex gap-3">

            <TableSearch />
            <ResetFiltersButton />
            <ActiveFilters
              classes={classes}
              teachers={teachers}
              lessons={lessons} />
            <SessionFiltersModal
              classes={classes}
              teachers={teachers}
              lessons={lessons}
            />
            <TableActions />

            {(role === "super_admin") && (
              <FormContainer table="session" type="create" />
            )}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <Table
        columns={columns}
        renderRow={renderRow}
        data={serializedData}
      />

      {/* PAGINATION */}
      <div className="w-full flex justify-center">
        <Pagination page={p} count={count} />
      </div>
    </div>
  );
};

export default SessionListPage;