"use server";

import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { Prisma } from "@prisma/client";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import {
  Eye,
  Filter,
  ArrowUpDown
} from "lucide-react";

// type TeacherList = Teacher & { subjects: Subject[] } & { classes: Class[] };
type TeacherList = Prisma.TeacherGetPayload<{
  include: {
    subjects: {
      include: {
        subject: true;
      };
    };
    teacherClasses: {
      include: { class: true },
    },
  };
}>;

const TeacherListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { page, ...queryParams } = await searchParams;

  const p = page ? parseInt(page) : 1;

  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const columns = [
    { header: "Infos", accessor: "info" },
    {
      header: "Identifiant",
      accessor: "teacherId",
      className: "hidden md:table-cell",
    },
    {
      header: "Matière",
      accessor: "subjects",
      className: "hidden md:table-cell",
    },
    {
      header: "Classes",
      accessor: "classes",
      className: "hidden lg:table-cell",
    },
    {
      header: "Téléphone",
      accessor: "phone",
      className: "hidden lg:table-cell",
    },
    {
      header: "Adresse",
      accessor: "address",
      className: "hidden lg:table-cell",
    },
    ...(role === "admin" ? [{ header: "Actions", accessor: "actions" }] : []),
  ];

  const renderRow = (item: TeacherList) => (
    <tr
      key={item.id}
      className="border-b hover:bg-blue-200 even:bg-slate-50 border-t border-gray-200 border-l border-r"
    >
      <td className="flex items-center gap-4 p-4">
        <Image
          src={item.image || "/noAvatar.png"}
          width={40}
          height={40}
          alt=""
          className="md:hidden xl:block w-10 h-10 object-cover rounded-full"
        />
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-xs text-gray-600">{item?.email}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.username}</td>
      <td className="hidden md:table-cell">
        {Array.isArray(item.subjects)
          ? item.subjects.map((s) => s.subject.name).join(", ")
          : item.subjects || "—"}
      </td>
      <td className="hidden md:table-cell">
        {Array.isArray(item.teacherClasses) && item.teacherClasses.length > 0
          ? item.teacherClasses.map((tc) => tc.class.name).join(", ")
          : "—"}
      </td>
      <td className="hidden lg:table-cell">{item.phone}</td>
      <td className="hidden lg:table-cell">{item.address}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/teachers/${item.id}`}>
            <button className="bg-blue-500 hover:bg-blue-600 p-2 cursor-pointer rounded text-white">
              <Eye size={16} />
            </button>
          </Link>
          {role === "admin" && (
            <>
              <FormContainer table="teacher" type="update" data={item} />
              <FormContainer table="teacher" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  // URL PARAMS CONDITION

  const query: Prisma.TeacherWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "classId":
            query.lessons = {
              some: {
                classId: parseInt(value),
              },
            };
            break;
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
    prisma.teacher.findMany({
      where: {
        deletedAt: null
      },
      include: {
        subjects: {
          include: {
            subject: true, // SUBJECT Model
          },
        },
        teacherClasses: {
          include: { class: true },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.teacher.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          Liste des enseignants
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
            {role === "admin" && (
              <FormContainer table="teacher" type="create" />
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

export default TeacherListPage;
