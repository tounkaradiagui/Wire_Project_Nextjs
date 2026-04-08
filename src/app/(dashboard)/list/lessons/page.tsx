"use server";

import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import TableActions from "@/lib/helpers/TableActions";
import LessonFiltersModal from "@/lib/filters/LessonFiltersModal";
import ActiveFilters from "@/lib/filters/ActiveFilters";
import ResetFiltersButton from "@/lib/filters/ResetFiltersButton";


type LessonList = Prisma.LessonGetPayload<{
  include: {
    class: { select: { name: true } },
    subject: { select: { name: true } },
    teacher: { select: { name: true, surname: true } },
  },
}>;


const LessonListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {

  const resolvedParams = await searchParams;
  const { page, ...queryParams } = resolvedParams;

  const p = page ? parseInt(page) : 1;

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const columns = [
    { header: "Matière", accessor: "info" },

    {
      header: "Cours",
      accessor: "cours",
    },
    {
      header: "Classe",
      accessor: "class",
    },
    { header: "Enseignant", accessor: "teacher", className: "hidden md:table-cell " },
    { header: "Date de début", accessor: "startDate", className: "hidden md:table-cell " },
    { header: "Date de fin", accessor: "dueDate", className: "hidden md:table-cell " },
    { header: "Statut", accessor: "status", className: "hidden md:table-cell " },
    ...(role === "admin" || role === "teacher" ? [{ header: "Actions", accessor: "actions" }] : []),
  ];

  const getLessonStatus = (item: LessonList) => {
    const today = new Date();

    if (item.dueDate && new Date(item.dueDate) < today) {
      return "finished";
    }

    if (item.startDate && new Date(item.startDate) > today) {
      return "upcoming";
    }

    return "active";
  };

  const renderRow = (item: LessonList & { startDate: string | null; dueDate: string | null }) => {

    const status = getLessonStatus(item);

    return (
      <tr
        key={item.id}
        className="border-b hover:bg-blue-200 even:bg-slate-50 border-t border-gray-200 border-l border-r"
      >
        <td className="flex items-center gap-4 p-4">
          <div className="flex flex-col">
            <h3 className="font-semibold">{item.subject?.name ?? "-"}</h3>
          </div>
        </td>
        <td>{item.name}</td>
        <td>{item.class?.name}</td>
        <td className="hidden md:table-cell ">
          {item.teacher?.name + " " + item.teacher?.surname}
        </td>
        <td className="hidden md:table-cell">
          {item.startDate && new Intl.DateTimeFormat("fr-FR").format(new Date(item.startDate))}
        </td>
        <td className="hidden md:table-cell">
          {item.dueDate && new Intl.DateTimeFormat("fr-FR").format(new Date(item.dueDate))}
        </td>
        <td>
          {status === "finished" ? (
            <span className="bg-red-100 text-red-700 px-2 py-1 text-xs rounded">
              Cours terminé
            </span>
          ) : status === "upcoming" ? (
            <span className="bg-yellow-100 text-yellow-700 px-2 py-1 text-xs rounded">
              À venir
            </span>
          ) : (
            <span className="bg-green-100 text-green-700 px-2 py-1 text-xs rounded">
              Actif
            </span>
          )}
        </td>
        {(role === "admin" || role === "teacher") && (
          <td>
            <div className="flex items-center gap-2">
              {item.id && ( 
                <Link href={`/list/sessions?lessonId=${item.id}`}>
                  <button
                    title="Voir la séance"
                    className="px-3 py-1 text-xs font-medium cursor-pointer rounded-md bg-blue-500 text-white hover:bg-blue-600"
                  >
                    <CalendarDays size={16} />
                  </button>
                </Link>
              )}
              <FormContainer table="lesson" type="update" data={item} />
              <FormContainer table="lesson" type="delete" id={item.id} />
            </div>
          </td>
        )}
      </tr >
    );
  };


  // URL PARAMS CONDITION
  const query: Prisma.LessonWhereInput = {
    isDeleted: false
  };

  // restriction teacher
  if (role === "teacher") {
    query.teacherId = userId!;
  }

  // filtres dynamiques
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

        case "subjectId":
          const subjectId = Number(value);
          if (!isNaN(subjectId)) {
            query.subjectId = subjectId;
          }
          break;

        case "teacherId":
          query.teacherId = value;
          break;
             
        case "studentId": {
          const student = await prisma.student.findUnique({
            where: { id: value },
            select: { classId: true },
          });

          if (student) {
            query.classId = student.classId;
          }
          break;
        }

        case "subjectId":
          query.subjectId = parseInt(value);
          break;

        case "status": {
          const today = new Date();

          if (value === "finished") {
            query.dueDate = { lt: today };
          }

          if (value === "active") {
            const existing = Array.isArray(query.AND) ? query.AND : query.AND ? [query.AND] : [];
            query.AND = [
              ...existing,
              { startDate: { lte: today } },
              { OR: [{ dueDate: null }, { dueDate: { gte: today } }] },
            ];
          }
          
          if (value === "upcoming") {
            query.startDate = { gt: today };
          }
          break;
        }

        case "date": {
          const start = new Date(value);
          const end = new Date(value);
          end.setHours(23, 59, 59);

          query.startDate = {
            gte: start,
            lte: end,
          };
          break;
        }

        case "search": {
          const existing = Array.isArray(query.AND) ? query.AND : query.AND ? [query.AND] : [];
          query.AND = [
            ...existing,
            {
              OR: [
                { name: { contains: value, mode: "insensitive" } },
                { subject: { name: { contains: value, mode: "insensitive" } } },
                { teacher: { name: { contains: value, mode: "insensitive" } } },
              ],
            },
          ];
          break;
        }       
        
      }
    }
  }

    // Afficher les filtres actifs
    const allowedSortFields = [
      "name",
      "startDate",
      "dueDate",
    ];

    const sortBy = allowedSortFields.includes(queryParams.sortBy || "")
      ? queryParams.sortBy
      : "startDate";

    const sortOrder =
    queryParams.sortOrder === "asc" ? "asc" : "desc";

    const orderBy: Prisma.LessonOrderByWithRelationInput = {
      [sortBy!]: sortOrder,
    };

    const [data, count, classes, teachers, subjects] =
    await prisma.$transaction([

      prisma.lesson.findMany({
        where: query,
        include: {
          class: { select: { name: true } },
          subject: { select: { name: true } },
          teacher: { select: { name: true, surname: true } },
        },
        take: ITEM_PER_PAGE,
        skip: ITEM_PER_PAGE * (p - 1),
        orderBy,
      }),

      prisma.lesson.count({ where: query }),

      prisma.class.findMany({
        select: { id: true, name: true },
      }),

      prisma.teacher.findMany({
        select: { id: true, name: true, surname: true },
      }),

      prisma.subject.findMany({
        select: { id: true, name: true },
      }),
    ]);

    const serializedData = data.map((item) => ({
      ...item,
      startDate: item.startDate ? item.startDate.toISOString() : null,
      dueDate: item.dueDate ? item.dueDate.toISOString() : null,
    }));

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP SECTION */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          Liste de cours
        </h1>

        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <ResetFiltersButton />
            <ActiveFilters
              classes={classes}
              teachers={teachers}
              subjects={subjects} />
            <LessonFiltersModal
              classes={classes}
              teachers={teachers}
              subjects={subjects}
            />
            <TableActions />
            {(role === "admin" || role === "teacher") && (<FormContainer table="lesson" type="create" />)}
          </div>
        </div>
      </div>

      {/* List of lessons */}
      <Table columns={columns} renderRow={renderRow} data={serializedData} />

      {/* Pagination */}
      <Pagination page={p} count={count} />
    </div>
  );
};
export default LessonListPage;
