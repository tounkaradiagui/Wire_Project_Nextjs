"use server";

import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import Image from "next/image";
import {
  Attendance,
  Prisma,
  Student,
  Lesson,
  Class,
  Teacher,
} from "generated/prisma/client";
import { ITEM_PER_PAGE } from "@/lib/settings";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

type AttendanceList = Attendance & {
  student: Student;
  lesson: Lesson & {
    class: Class;
    teacher: Teacher;
  };
};

const AttendanceListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { page, ...queryParams } = await searchParams;
  const p = page ? parseInt(page) : 1;

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  /* ================= COLUMNS ================= */
  const columns = [
    { header: "Élève", accessor: "student" },
    { header: "Classe", accessor: "class", className: "hidden md:table-cell" },
    { header: "Cours", accessor: "lesson", className: "hidden md:table-cell" },
    { header: "Date", accessor: "date" },
    { header: "Statut", accessor: "status" },
    { header: "Justificatif", accessor: "proof" },
    ...(role === "admin" || role === "teacher"
      ? [{ header: "Actions", accessor: "actions" }]
      : []),
  ];

  /* ================= ROW ================= */
  const renderRow = (item: AttendanceList) => (
    <tr
      key={item.id}
      className="border-b even:bg-slate-50 hover:bg-blue-100"
    >
      <td className="p-4 font-medium">
        {item.student.name} {item.student.surname}
      </td>

      <td className="hidden md:table-cell">
        {item.lesson.class.name}
      </td>

      <td className="hidden md:table-cell">
        {item.lesson.name}
      </td>

      <td>
        {new Intl.DateTimeFormat("fr-FR").format(item.date)}
      </td>

      {/* STATUS BADGE */}
      <td>
        <span
          className={`px-2 py-1 rounded text-xs font-semibold
            ${item.status === "ABSENT"
              ? "bg-red-100 text-red-700"
              : item.status === "LATE"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-green-100 text-green-700"
            }`}
        >
          {item.status}
        </span>
      </td>

      {/* PROOF */}
      <td>
        {item.proofUrl ? (
          <a
            href={item.proofUrl}
            target="_blank"
            className="text-blue-600 underline text-sm"
          >
            Voir
          </a>
        ) : (
          <span className="text-gray-400 text-sm">—</span>
        )}
      </td>

      {/* ACTIONS */}
      <td>
        {(role === "admin" || role === "teacher") && (
          <div className="flex gap-2">
            <FormContainer table="attendance" type="update" data={item} />
            <FormContainer table="attendance" type="delete" id={item.id} />
          </div>
        )}
      </td>
    </tr>
  );

  /* ================= QUERY ================= */
  const query: Prisma.AttendanceWhereInput = {
    status: "ABSENT", // 🔴 ABSENCES UNIQUEMENT
  };

  /* ---- Role rules ---- */
  switch (role) {
    case "teacher":
      query.lesson = { teacherId: userId! };
      break;

    case "parent":
      query.student = {
        parentId: userId!,
      };
      break;

    case "student":
      query.studentId = userId!;
      break;

    default:
      break;
  }

  /* ---- Filters ---- */
  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (!value) continue;

      switch (key) {
        case "classId":
          query.lesson = {
            ...query.lesson,
            classId: parseInt(value),
          };
          break;

        case "search":
          query.student = {
            ...query.student,
            name: { contains: value, mode: "insensitive" },
          };
          break;
      }
    }
  }

  /* ================= DATA ================= */
  const [data, count] = await prisma.$transaction([
    prisma.attendance.findMany({
      where: query,
      include: {
        student: true,
        lesson: {
          include: {
            class: true,
            teacher: true,
          },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { date: "desc" },
    }),
    prisma.attendance.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          Gestion des absences
        </h1>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          <TableSearch />

          <div className="flex gap-3">
            {/* EXPORT */}
            <button className="bg-green-500 text-white px-3 py-1 rounded text-sm">
              Export Excel
            </button>
            <button className="bg-red-500 text-white px-3 py-1 rounded text-sm">
              Export PDF
            </button>

            {(role === "admin" || role === "teacher" || role === "parent") && (
              <FormContainer table="attendance" type="create" />
            )}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <Table columns={columns} renderRow={renderRow} data={data} />

      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default AttendanceListPage;
