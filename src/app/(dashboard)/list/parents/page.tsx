"use server";

import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { ITEM_PER_PAGE } from "@/lib/settings";
import prisma from "@/lib/prisma";
import { Parent, Prisma, Student } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import {
  Eye,
  Filter,
  ArrowUpDown
} from "lucide-react";
import { parentRoleFilter } from "@/lib/roleFilters";
import ResetFiltersButton from "@/lib/filters/ResetFiltersButton";
import ActiveFilters from "@/lib/filters/ActiveFilters";
import ParentFiltersModal from "@/lib/filters/ParentFiltersModal";
import TableActions from "@/lib/helpers/TableActions";


type ParentList = Parent & { students: Student[] };


const ParentListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { page, ...queryParams } = await searchParams;

  const p = page ? parseInt(page) : 1;

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const columns = [
    { header: "Infos", accessor: "info" },
    {
      header: "Enfants",
      accessor: "students",
      className: ""
    },
    { header: "Téléphone", accessor: "phone", className: "" },
    { header: "Adresse", accessor: "address", className: "" },
    ...(role === "admin" ? [{ header: "Actions", accessor: "actions" }] : []),
  ];

  const renderRow = (item: ParentList) => (
    <tr
      key={item.id}
      className="border-b hover:bg-blue-200 even:bg-slate-50 border-t border-gray-200 border-l border-r"
    >
      <td className="flex items-center gap-4 p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.name}  {item.surname} </h3>
          <p className="text-xs text-gray-500">{item?.email}</p>
        </div>
      </td>
      <td className="">
        {Array.isArray(item.students)
          ? item.students.map((c) => c.name).join(", ")
          : item.students || "—"}
      </td>
      <td className="">{item.phone}</td>
      <td className="">{item.address}</td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormContainer table="parent" type="update" data={item} />
              <FormContainer table="parent" type="delete" id={item.id} />
            </>
          )}
          {/* Add parent details button here to fetch each parent details page (admin & teacher role)*/}
        </div>
      </td>
    </tr>
  );

  // ----------------------
  // BASE QUERY
  // ----------------------

  const query: Prisma.ParentWhereInput = {
    ...parentRoleFilter(role, userId),
    isDeleted: false,
  };

  // ----------------------
  // FILTERS + SEARCH
  // ----------------------

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
          query.students = {
            some: {
              classId: parseInt(value),
            },
          };
          break;

        case "studentName":
          query.students = {
            some: {
              name: {
                contains: value,
                mode: "insensitive",
              },
            },
          };
          break;

        default:
          break;
      }
    }
  }

  const allowedSortFields = [
    "name",
    "surname",
    "username",
    "createdAt",
  ];

  // Déterminer le champ de tri et l'ordre de tri en fonction des paramètres d'URL, avec des valeurs par défaut
  const sortBy = allowedSortFields.includes(queryParams.sortBy || "")
    ? queryParams.sortBy
    : "createdAt";

  const sortOrder =
    queryParams.sortOrder === "asc" ? "asc" : "desc";

  const orderBy: Prisma.ParentOrderByWithRelationInput = {
    [sortBy!]: sortOrder,
  };

  // Récupérer les parents avec pagination
  const [data, count, classes] = await prisma.$transaction([
    prisma.parent.findMany({
      where: query,
      orderBy,
      include: {
        students: {
          include: {
            class: true,
          },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),

    prisma.parent.count({ where: query }),

    prisma.class.findMany({
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP SECTION */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          Liste des parents
        </h1>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <ResetFiltersButton />
            <ActiveFilters classes={classes} />
            <ParentFiltersModal classes={classes} />
            <TableActions />
            {role === "admin" && <FormContainer table="parent" type="create" />}
          </div>
        </div>
      </div>

      {/* List des élèves */}
      <Table columns={columns} renderRow={renderRow} data={data} />

      {/* Pagination */}
      <Pagination page={p} count={count} />
    </div>
  );
};
export default ParentListPage;
