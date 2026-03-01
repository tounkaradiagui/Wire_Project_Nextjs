"use server";

import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { Prisma } from "@prisma/client";
import { ITEM_PER_PAGE } from "@/lib/settings";
import prisma from "@/lib/prisma";
import { Filter, ArrowUpDown } from "lucide-react";
import { auth } from "@clerk/nextjs/server";

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
  const { page, ...queryParams } = await searchParams;
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
    ...(role === "admin" || role === "super_admin"
      ? [{ header: "Actions", accessor: "actions" }]
      : []),
  ];

  /* ================= ROW ================= */

  const renderRow = (item: SessionList) => (
    <tr
      key={item.id}
      className="border-b even:bg-slate-50 hover:bg-blue-50"
    >
      <td className="p-4">{item.lesson.class.name}</td>

      <td>{item.lesson.name}</td>

      <td>
        {new Intl.DateTimeFormat("fr-FR").format(item.date)}
      </td>

      <td>
        {new Intl.DateTimeFormat("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        }).format(item.startTime)}
        {" - "}
        {new Intl.DateTimeFormat("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        }).format(item.endTime)}
      </td>

      <td>{item.room ?? "—"}</td>

      {(role === "admin" || role === "super_admin") && (
        <td>
          <div className="flex gap-2">
            <FormContainer table="session" type="update" data={item} />
            <FormContainer table="session" type="delete" id={item.id} />
          </div>
        </td>
      )}
    </tr>
  );

  /* ================= QUERY ================= */

  const query: Prisma.SessionWhereInput = {
    isDeleted: false,
  };

  // 🔐 RBAC
  if (role === "teacher") {
    query.lesson = {
      teacherId: userId!,
    };
  }

  /* ================= DATA ================= */

  const [data, count] = await prisma.$transaction([
    prisma.session.findMany({
      // where: query,
      where: {
        // deletedAt: null,
        isDeleted: false
      },
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
      orderBy: {
        date: "desc",
      },
    }),

    prisma.session.count({
      where: query,
    }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          Gestion des séances
        </h1>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          <TableSearch />

          <div className="flex gap-3">
            <button className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition">
              <Filter size={16} />
              <span className="text-sm">Filtrer</span>
            </button>

            <button className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition">
              <ArrowUpDown size={16} />
              <span className="text-sm">Trier</span>
            </button>

            {(role === "admin" || role === "super_admin") && (
              <FormContainer table="session" type="create" />
            )}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <Table
        columns={columns}
        renderRow={renderRow}
        data={data}
      />

      {/* PAGINATION */}
      <div className="w-full flex justify-center">
        <Pagination page={p} count={count} />
      </div>
    </div>
  );
};

export default SessionListPage;