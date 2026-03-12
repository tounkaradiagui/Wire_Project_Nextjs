"use server";

import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import Image from "next/image";
import { AttendanceStatus } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { ITEM_PER_PAGE } from "@/lib/settings";
import prisma from "@/lib/prisma";
import {
  Filter,
  ArrowUpDown
} from "lucide-react";
import { auth } from "@clerk/nextjs/server";


type AttendanceList = Prisma.AttendanceGetPayload<{
  select: {
    id: true;
    createdAt: true;
    status: true;
    proofUrl: true;
    createdBy: true;
    student: true;
    session: {
      include: {
        lesson: {
          include: {
            class: true,
            teacher: true,
          },
        },
      },
    },
  };
}>;

const AttendanceListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { page, ...queryParams } = await searchParams;
  const p = page ? parseInt(page) : 1;

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const isPdf = (url: string) =>
    url.toLowerCase().includes(".pdf");

  const isImage = (url: string) =>
    /\.(jpg|jpeg|png|webp|gif)$/i.test(url);

  /* ================= COLUMNS ================= */
  const columns = [
    { header: "Élève", accessor: "student" },
    { header: "Classe", accessor: "class", className: "hidden md:table-cell" },
    { header: "Cours", accessor: "lesson", className: "hidden md:table-cell" },
    { header: "Séance", accessor: "session" },
    { header: "Statut", accessor: "status" },
    { header: "Justificatif", accessor: "proofUrl" },
    ...(role === "admin" || role === "teacher" || role === "super_admin"
      ? [{ header: "Signaler par", accessor: "createdBy" }, { header: "Actions", accessor: "actions" }]

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
        {item.session?.lesson.class.name}
      </td>

      <td className="hidden md:table-cell">
        {item.session?.lesson.name}
      </td>

      <td>
        {item.session?.startTime && item.session?.endTime ? (
          `${new Date(item.session.startTime).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })} - ${new Date(item.session.endTime).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })}`
        ) : (
          "—"
        )}
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
          isPdf(item.proofUrl) ? (
            <a
              href={item.proofUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline text-sm"
            >
              📄 Télécharger le PDF
            </a>
          ) : isImage(item.proofUrl) ? (
            <a href={item.proofUrl} target="_blank" rel="noopener noreferrer">
              <Image
                src={item.proofUrl}
                alt="Justificatif"
                width={40}
                height={40}
                className="rounded border"
              />
            </a>
          ) : (
            <span className="text-xs text-gray-400">Fichier non supporté</span>
          )
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )}

      </td>


      {(role === "admin" || role === "teacher" || role === "super_admin") && (
        <td className="hidden md:table-cell">
          {item.createdBy === "PARENT" ? "Parent" : item.createdBy === "TEACHER" ? "Enseignant" : "Administration"}
        </td>
      )}

      {/* ACTIONS */}
      <td>
        {(role === "admin" || role === "teacher" || role === "super_admin") && (
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
    status: AttendanceStatus.ABSENT,
    isDeleted: false,
  };

  /* ---- Role rules ---- */
  switch (role) {
    case "teacher":
      query.session = {
        lesson: {
          teacherId: userId!,
        },
      };
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
          query.session = {
            lesson: {
              ...(query.session as any)?.lesson,
              classId: parseInt(value),
            },
          };
          break;

        case "search":
          query.student = {
            ...(query.student as Prisma.StudentWhereInput),
            name: {
              contains: value,
              mode: "insensitive",
            },
          };
          break;
      }
    }
  }

  /* ================= DATA ================= */
  const [data, count] = await prisma.$transaction([
    prisma.attendance.findMany({
      where: query,
      select: {
        id: true,
        status: true,
        proofUrl: true,
        createdBy: true,
        createdAt: true,
        student: true,
        session: {
          include: {
            lesson: {
              include: {
                class: true,
                teacher: true,
              },
            },
          },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.attendance.count({
      where: query,
    }),
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

            {(role === "admin" || role === "teacher" || role === "parent") && (
              <FormContainer table="attendance" type="create" />
            )}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <Table<AttendanceList>
        columns={columns}
        data={data}
        renderRow={renderRow}
      />

      {/* PAGINATION */}
      <div className="w-full flex justify-center">
        <Pagination page={p} count={count} />
      </div>
    </div>
  );
};

export default AttendanceListPage;
