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
  Eye,
  Filter,
  ArrowUpDown
} from "lucide-react";

type ClassList = Prisma.ClassGetPayload<{
  include: {
    grade: true;
  };
}>;

const ClassListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { page, ...queryParams } = await searchParams;

  const p = page ? parseInt(page) : 1;

  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const columns = [
    { header: "Nom de la classe", accessor: "info" },
    {
      header: "Capacité",
      accessor: "capacity",
    },
    {
      header: "Niveau",
      accessor: "grade",
      className: "hidden md:table-cell ",
    },
    ...(role === "admin" ? [{ header: "Actions", accessor: "actions" }] : []),
  ];

  const renderRow = (item: ClassList) => (
    <tr
      key={item.id}
      className="border-b hover:bg-blue-200 even:bg-slate-50 border-t border-gray-200 border-l border-r"
    >
      <td className="flex items-center gap-4 p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.name}</h3>
        </div>
      </td>
      <td>{item.capacity}</td>
      <td className="hidden md:table-cell">{item.grade.cycle === "FIRST" ? "1er Cycle" : "2ème Cycle"}</td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormContainer table="class" type="update" data={item} />
              <FormContainer table="class" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const teacherId = searchParams.teacherId;

  // URL PARAMS CONDITION

  const query: Prisma.ClassWhereInput = {};

  if (teacherId) {
    query.teacherClasses = {
      some: {
        teacherId,
      },
    };
  }

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "search":
            query.name = { contains: value, mode: "insensitive" };
            break;
          default:
            break;
        }
      }
    }
  }

  const [data, count] = await prisma.$transaction([
    prisma.class.findMany({
      where: query,
      include: {
        grade: true,
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.class.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-4">
      {/* TOP SECTION */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          Liste des classes
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
            {role === "admin" && <FormContainer table="class" type="create" />}
          </div>
        </div>
      </div>

      {/* List of Classes */}
      <Table<ClassList> columns={columns} renderRow={renderRow} data={data} />

      {/* Pagination */}
      <Pagination page={p} count={count} />
    </div>
  );
};
export default ClassListPage;
