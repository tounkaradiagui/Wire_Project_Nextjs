"use server";

import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import {
  Filter,
  ArrowUpDown
} from "lucide-react";
import Link from "next/link";
import { CalendarDays } from "lucide-react";


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
  const { page, ...queryParams } = await searchParams;

  const p = page ? parseInt(page) : 1;

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const columns = [
    { header: "Matière", accessor: "info" },

    {
      header: "Cours",
      accessor: "cours",
      className: "hidden md:table-cell ",
    },
    {
      header: "Classe",
      accessor: "class",
      className: "hidden md:table-cell ",
    },
    { header: "Enseignant", accessor: "teacher" },
    { header: "Date de début", accessor: "startDate", className: "hidden md:table-cell " },
    { header: "Date de fin", accessor: "dueDate", className: "hidden md:table-cell " },
    ...(role === "admin" ? [{ header: "Actions", accessor: "actions" }] : []),
  ];

  const renderRow = (item: LessonList) => (
    <tr
      key={item.id}
      className="border-b hover:bg-blue-200 even:bg-slate-50 border-t border-gray-200 border-l border-r"
    >
      <td className="flex items-center gap-4 p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.subject.name}</h3>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.name}</td>
      <td>{item.class.name}</td>
      <td className="hidden md:table-cell">
        {item.teacher.name + " " + item.teacher.surname}
      </td>
      <td className="hidden md:table-cell">
        {item.startDate && new Intl.DateTimeFormat("fr-FR").format(item.startDate)}
      </td>
      <td className="hidden md:table-cell">
        {item.dueDate && new Intl.DateTimeFormat("fr-FR").format(item.dueDate)}
      </td>
      <td>
        <div className="flex items-center gap-2">
          <Link
            href={`/list/sessions?lessonId=${item.id}`}
            className="px-3 py-1 text-xs font-medium rounded-md bg-blue-500 text-white hover:bg-blue-600"
          >
            <CalendarDays size={14} />
            Séances
          </Link>

          {role === "admin" && (
            <>
              <FormContainer table="lesson" type="update" data={item} />
              <FormContainer table="lesson" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );


  // URL PARAMS CONDITION

  const query: Prisma.LessonWhereInput = {};

  // L'enseignant ne peut voir que ses propres leçons
  if (role === "teacher") {
    query.teacherId = userId!;
  }

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "classId":
            query.classId = parseInt(value);
            break;
          case "teacherId":
            query.teacherId = value;
            break;
          case "search":
            query.OR = [
              { subject: { name: { contains: value, mode: "insensitive" } } },
              { teacher: { name: { contains: value, mode: "insensitive" } } },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  const [data, count] = await prisma.$transaction([
    prisma.lesson.findMany({
      where: query,
      include: {
        class: { select: { name: true } },
        subject: { select: { name: true } },
        teacher: { select: { name: true, surname: true } },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.lesson.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP SECTION */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          Liste des leçons
        </h1>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button
              className="flex items-center gap-1 px-3 py-1.5 rounded-md
                bg-gray-100 hover:bg-gray-200 text-gray-700
                transition"
            >
              <Filter size={16} />
              <span className="text-sm">Filtrer</span>
            </button>
            <button
              className="flex items-center gap-1 px-3 py-1.5 rounded-md
                bg-gray-100 hover:bg-gray-200 text-gray-700
                transition"
            >
              <ArrowUpDown size={16} />
              <span className="text-sm">Trier</span>
            </button>
            {role === "admin" && <FormContainer table="lesson" type="create" />}
          </div>
        </div>
      </div>

      {/* List of lessons */}
      <Table columns={columns} renderRow={renderRow} data={data} />

      {/* Pagination */}
      <Pagination page={p} count={count} />
    </div>
  );
};
export default LessonListPage;
