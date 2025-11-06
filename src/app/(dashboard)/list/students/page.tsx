"use server";

import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { role } from "@/lib/data";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Student } from "generated/prisma/client";
import Image from "next/image";
import prisma from "@/lib/prisma";

type StudentList = Student & { class: Class[] };

const columns = [
  { header: "Infos", accessor: "info" },
  {
    header: "Identifiant",
    accessor: "studentId",
    className: "hidden md:table-cell ",
  },
  {
    header: "Niveau",
    accessor: "grade",
    className: "hidden md:table-cell",
  },
  { header: "Téléphone", accessor: "phone", className: "hidden md:table-cell" },
  { header: "Adresse", accessor: "address", className: "hidden md:table-cell" },
  { header: "Actions", accessor: "actions" },
];

const renderRow = (item: StudentList) => (
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
        {/* <p className="text-xs text-gray-500">{item?.class.name}</p> */}
      </div>
    </td>
    <td className="hidden md:table-cell">{item.username}</td>
    <td className="hidden md:table-cell">{item.class.name}</td>
    <td className="hidden lg:table-cell">{item.phone}</td>
    <td className="hidden lg:table-cell">{item.address}</td>
    <td>
      <div className="flex items-center gap-2">
        {role === "admin" && (
          <>
            <FormModal table="student" type="update" data={item} />
            <FormModal table="student" type="delete" id={item.id} />
          </>
        )}
      </div>
    </td>
  </tr>
);

const StudentListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const params = searchParams;

  const page = params?.page ? Math.max(1, parseInt(params.page, 10) || 1) : 1;
  const search = (params?.search || "").trim();

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { surname: { contains: search, mode: "insensitive" } },
          { username: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { class: { name: { contains: search, mode: "insensitive" } } },
        ],
      }
    : {};

  const [data, count] = await prisma.$transaction([
    prisma.student.findMany({
      where,
      include: { class: true },
      skip: (page - 1) * ITEM_PER_PAGE,
      take: ITEM_PER_PAGE,
      orderBy: { id: "asc" },
    }),
    prisma.student.count({ where }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP SECTION */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          Liste des élèves
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
            {role === "admin" && <FormModal table="student" type="create" />}
          </div>
        </div>
      </div>

      {/* List of Students */}
      <Table columns={columns} renderRow={renderRow} data={data} />

      {/* Pagination */}
      <Pagination page={page} count={count} />
    </div>
  );
};
export default StudentListPage;
