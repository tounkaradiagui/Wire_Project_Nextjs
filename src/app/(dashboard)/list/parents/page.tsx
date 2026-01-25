"use server";

import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { ITEM_PER_PAGE } from "@/lib/settings";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { Parent, Prisma, Student } from "generated/prisma/client";
import { auth } from "@clerk/nextjs/server";
import { parentRoleFilter } from "@/lib/roleFilters";


type ParentList = Parent & { students: Student[] };


const ParentListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { page, ...queryParams } = await searchParams;

  const p = page ? parseInt(page) : 1;

  const search = (searchParams?.search || "").trim();

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const columns = [
    { header: "Infos", accessor: "info" },
    {
      header: "Nom des élèves",
      accessor: "students",
      className: "hidden md:table-cell ",
    },
    { header: "Téléphone", accessor: "phone", className: "hidden md:table-cell" },
    { header: "Adresse", accessor: "address", className: "hidden md:table-cell" },
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
      <td className="hidden lg:table-cell">
        {Array.isArray(item.students)
          ? item.students.map((c) => c.name).join(", ")
          : item.students || "—"}
      </td>
      <td className="hidden lg:table-cell">{item.phone}</td>
      <td className="hidden lg:table-cell">{item.address}</td>
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

  let query: Prisma.ParentWhereInput = {
    ...parentRoleFilter(role, userId),
  };

  // Recherche
  if (queryParams?.search) {
    query.name = {
      contains: queryParams.search,
      mode: "insensitive",
    };
  }

  if (search) {
    query = {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { surname: { contains: search, mode: "insensitive" } },
        { username: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    };
  }

  const [data, count] = await prisma.$transaction([
    prisma.parent.findMany({
      where: query,
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
            <button className="bg-blue-300 text-white w-8 h-8 items-center justify-center rounded-full flex">
              <Image
                src="/filter.png"
                alt="filter"
                width={14}
                height={14}
                className="cursor-pointer"
              />
            </button>
            <button className="bg-yellow-300 text-white w-8 h-8 items-center justify-center rounded-full flex">
              <Image
                src="/sort.png"
                alt="sort"
                width={14}
                height={14}
                className="cursor-pointer"
              />
            </button>
            {role === "admin" && <FormContainer table="parent" type="create" />}
          </div>
        </div>
      </div>

      {/* List of Students */}
      <Table columns={columns} renderRow={renderRow} data={data} />

      {/* Pagination */}
      <Pagination page={p} count={count} />
    </div>
  );
};
export default ParentListPage;
