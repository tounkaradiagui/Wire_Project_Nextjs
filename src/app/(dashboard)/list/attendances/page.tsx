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
import { auth } from "@clerk/nextjs/server";
import AttendanceFiltersModal from "@/lib/filters/AttendanceFiltersModal";
import TableActions from "@/lib/helpers/TableActions";
import ResetFiltersButton from "@/lib/filters/ResetFiltersButton";
import ActiveFilters from "@/lib/filters/ActiveFilters";


type AttendanceList = Prisma.AttendanceGetPayload<{
  select: {
    id: true;
    createdAt: true;
    createdBy: true;
    updatedAt: true;
    status: true;
    proofUrl: true;
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
    { header: "Classe", accessor: "class" },
    { header: "Cours", accessor: "lesson" },
    { header: "Séance", accessor: "session" },
    { header: "Statut", accessor: "status" },
    { header: "Date", accessor: "date", className: "hidden md:table-cell " },
    { header: "Mise à jour", accessor: "miseajour", className: "hidden lg:table-cell " },
    { header: "Justificatif", accessor: "proofUrl", className: "hidden lg:table-cell " },
    ...(role === "admin" || role === "teacher" || role === "super_admin"
      ? [{ header: "Signaler par", accessor: "createdBy", className: "hidden lg:table-cell " }, { header: "Actions", accessor: "actions" }]

      : []),
  ];

  /* ================= ROW ================= */
  const renderRow = (item: AttendanceList) => (
    <tr
      key={item.id}
      className="border-b even:bg-slate-50 hover:bg-blue-100"
    >
      <td className="p-4 font-medium">
        {item.student?.name} {item.student?.surname}
      </td>

      <td>
        {item.session?.lesson?.class?.name ?? "Classe inconnue"}
      </td>

      <td>
        {item.session?.lesson?.name ?? "Cours inconnu"}
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
          {item.status === "ABSENT" ? "Absent" : "Retard"}
        </span>
      </td>

      <td className="hidden md:table-cell ">
        {item.createdAt ? (
          `${new Date(item.createdAt).toLocaleDateString("fr-FR")}`
        ) : (
          "—"
        )}
      </td>
      <td className="hidden lg:table-cell ">

        {item.updatedAt ? (
          `${new Date(item.updatedAt).toLocaleDateString("fr-FR")}`
        ) : (
          "—"
        )}
      </td>

      {/* PROOF */}
      <td className="hidden lg:table-cell ">
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
            <a href={item.proofUrl} target="_blank" title="Afficher l'image" rel="noopener noreferrer">
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
        <td className="hidden lg:table-cell">
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
    // status: AttendanceStatus.ABSENT,
    isDeleted: false,
    AND: [],
  };

  // ----------------------
  // ROLE FILTER
  // ----------------------
  switch (role) {
    case "teacher":
      (query.AND as Prisma.AttendanceWhereInput[]).push({
        session: {
          lesson: {
            teacherId: userId!,
          },
        },
      });
      break;

    case "parent":
      (query.AND as Prisma.AttendanceWhereInput[]).push({
        student: {
          parentId: userId!,
        },
      });
      break;

    case "student":
      (query.AND as Prisma.AttendanceWhereInput[]).push({
        studentId: userId!,
      });
      break;
  }

  // ----------------------
  // FILTERS
  // ----------------------

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (!value) continue;

      switch (key) {
        case "search": {
          query.student = {
            ...(query.student as Prisma.StudentWhereInput),
            OR: [
              { name: { contains: value, mode: "insensitive" } },
              { surname: { contains: value, mode: "insensitive" } },
            ],
          };
          break;
        }

        case "status": {
          query.status = value as AttendanceStatus;
          break;
        }       

        case "classId":{
          (query.AND as Prisma.AttendanceWhereInput[]).push({
            session: {
              lesson: {
                classId: parseInt(value),
              },
            },
          });
          break;
        }

        case "teacherId":{
          (query.AND as Prisma.AttendanceWhereInput[]).push({
            session: {
              lesson: {
                teacherId: value,
              },
            },
          });
          break;
        }

        case "sessionId": {
          if (!value || value === "NaN") break;

          (query.AND as Prisma.AttendanceWhereInput[]).push({
            sessionId: value, 
          });

          break;
        }

        case "date": {
          const start = new Date(value);
          const end = new Date(value);
          end.setHours(23, 59, 59);

          query.createdAt = {
            gte: start,
            lte: end,
          };
          break;
        }

        default:
          break;
      }
    }
  }

  const allowedSortFields = [
    "createdAt",
    "updatedAt",
    "status",
  ];

  const sortBy = allowedSortFields.includes(queryParams.sortBy || "")
    ? queryParams.sortBy
    : "createdAt";

  const sortOrder =
    queryParams.sortOrder === "asc" ? "asc" : "desc";

  const orderBy: Prisma.AttendanceOrderByWithRelationInput = {
    [sortBy!]: sortOrder,
  };

  /* ================= DATA ================= */
  const [data, count, classes, sessions, teachers] = await 
    prisma.$transaction([
      prisma.attendance.findMany({
        where: query,
        orderBy,
        select: {
          id: true,
          status: true,
          proofUrl: true,
          createdBy: true,
          createdAt: true,
          updatedAt: true,
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
      }),

      prisma.attendance.count({ where: query }),

      prisma.class.findMany({
        select: { id: true, name: true },
      }),

      prisma.session.findMany({
        where: {
          isDeleted: false,
          lesson: {
            isDeleted: false,
          },
        },
        select: {
          id: true,
          date: true,
          lesson: {
            select: { name: true },
          },
        },
      }),

      prisma.teacher.findMany({
        select: { id: true, name: true },
      }),
    ]);

  const serializedData = data.map((item) => ({
    ...item,
    createdAt: item.createdAt ? item.createdAt.toISOString() : null,
    updatedAt: item.updatedAt ? item.updatedAt.toISOString() : null,
    session: item.session ? {
      ...item.session,
      date: item.session.date ? item.session.date.toISOString() : null,
      startTime: item.session.startTime ? item.session.startTime.toISOString() : null,
      endTime: item.session.endTime ? item.session.endTime.toISOString() : null,
    } : null,
  }));

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          {queryParams.sessionId
            ? "Absences de la séance"
            : "Gestion des absences"}
        </h1>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          <TableSearch />

          <div className="flex gap-3">
            {/* EXPORT */}
            {(role === "admin" || role === "teacher" || role === "super_admin") && (
              <>
                <button className="bg-green-500 text-white px-3 py-1 rounded text-sm">
                  Export Excel
                </button>
              </>
            )}
            <ResetFiltersButton />
            <ActiveFilters classes={classes} teachers={teachers} sessions={sessions}/>
            <AttendanceFiltersModal classes={classes} teachers={teachers} sessions={sessions} />
            <TableActions />
            {(role === "admin" || role === "teacher" || role === "parent") && (
              <FormContainer table="attendance" type="create" />
            )}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <Table<AttendanceList>
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

export default AttendanceListPage;
