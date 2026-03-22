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
import { Eye } from "lucide-react";
import TableActions from "@/lib/helpers/TableActions";
import TeacherFiltersModal from "@/lib/filters/TeacherFiltersModal";

import ActiveFilters from "@/lib/filters/ActiveFilters";
import ResetFiltersButton from "@/lib/filters/ResetFiltersButton";

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
    {
      header: "Infos",
      accessor: "info",
    },

    {
      header: "Identifiant",
      accessor: "teacherId",
      className: "hidden md:table-cell",
    },

    {
      header: "Genre",
      accessor: "sex",
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
      className: "hidden md:table-cell",
    },

    {
      header: "Téléphone",
      accessor: "phone",
      className: "hidden lg:table-cell",
    },

    // {
    //   header: "Création",
    //   accessor: "createdAt",
    //   className: "hidden lg:table-cell",
    // },

    // {
    //   header: "Mise à jour",
    //   accessor: "updatedAt",
    //   className: "hidden lg:table-cell",
    // },

    {
      header: "Adresse",
      accessor: "address",
      className: "hidden xl:table-cell",
    },

    ...(role === "admin" || role === "super_admin"
      ? [
        {
          header: "Actions",
          accessor: "actions",
          className: "text-right",
        },
      ]
      : []),
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
        {item.sex === "MALE" ? "Masculin" : "Féminin"}
      </td>
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
      {/* <td className="hidden lg:table-cell">{item.createdAt}</td>
      <td className="hidden lg:table-cell">{item.updatedAt}</td> */}
      <td className="hidden lg:table-cell">{item.address}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/teachers/${item.id}`}>
            <button className="bg-blue-500 hover:bg-blue-600 p-2 cursor-pointer rounded text-white">
              <Eye size={16} />
            </button>
          </Link>
          {(role === "admin" || role === "super_admin") && (
            <>
              <FormContainer table="teacher" type="update" data={item} />
              <FormContainer table="teacher" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  // ----------------------
  // FILTERS
  // ----------------------

  const query: Prisma.TeacherWhereInput = {
    isDeleted: false,
  };

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (!value) continue;

      switch (key) {
        case "search":
          query.OR = [
            { name: { contains: value, mode: "insensitive" } },
            { surname: { contains: value, mode: "insensitive" } },
            { username: { contains: value, mode: "insensitive" } },
            { email: { contains: value, mode: "insensitive" } },
          ];
          break;

        case "sex":
          query.sex = value as any;
          break;

        case "classId":
          query.teacherClasses = {
            some: {
              classId: parseInt(value),
            },
          };
          break;

        case "subjectId":
          query.subjects = {
            some: {
              subjectId: parseInt(value),
            },
          };
          break;

        default:
          break;
      }
    }
  }

  // ----------------------
  // SORT (SECURE)
  // ----------------------

  const allowedSortFields = [
    "name",
    "surname",
    "username",
    "createdAt",
  ];

  const sortBy = allowedSortFields.includes(queryParams.sortBy || "")
    ? queryParams.sortBy
    : "createdAt";

  const sortOrder =
    queryParams.sortOrder === "asc" ? "asc" : "desc";

  const orderBy: Prisma.TeacherOrderByWithRelationInput = {
    [sortBy!]: sortOrder,
  };

  // ----------------------
  // QUERY
  // ----------------------

  const [data, count, classes, subjects] = await prisma.$transaction([
    prisma.teacher.findMany({
      where: query,
      orderBy,
      include: {
        subjects: {
          include: {
            subject: true,
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

    prisma.class.findMany({
      select: { id: true, name: true },
    }),

    prisma.subject.findMany({
      select: { id: true, name: true },
    }),
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
            <ResetFiltersButton />
            <ActiveFilters classes={classes} subjects={subjects} />
            <TeacherFiltersModal classes={classes} subjects={subjects} />
            <TableActions />
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
