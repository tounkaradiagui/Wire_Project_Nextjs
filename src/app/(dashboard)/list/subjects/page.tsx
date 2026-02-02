"use server";

import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { Prisma } from "@/generated/prisma";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import FormContainer from "@/components/FormContainer";


type SubjectList = Prisma.SubjectGetPayload<{
  include: {
    teachers: {
      include: {
        teacher: true;
      };
    };
  };
}>;


const SubjectListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const params = await searchParams;

  const page = params.page ? Math.max(1, parseInt(params.page, 10) || 1) : 1;
  const search = (params.search || "").trim();

  const columns = [
    { header: "Nom de la matière", accessor: "info" },
    {
      header: "Enseignants",
      accessor: "subjects",
      className: "hidden md:table-cell ",
    },
    { header: "Actions", accessor: "actions" },
  ];

  const renderRow = (item: SubjectList) => (
    <tr
      key={item.id}
      className="border-b hover:bg-blue-200 even:bg-slate-50 border-t border-gray-200 border-l border-r"
    >
      <td className="flex items-center gap-4 p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.name}</h3>
        </div>
      </td>
      <td className="hidden lg:table-cell">
        {item.teachers.length > 0
          ? item.teachers.map((t) => t.teacher.name).join(", ")
          : "—"}
      </td>
      <td>
        <div className="flex items-center gap-2">
          <>
            <FormContainer table="subject" type="update" data={item} />
            <FormContainer table="subject" type="delete" id={item.id} />
          </>
        </div>
      </td>
    </tr>
  );

  let query: Prisma.SubjectWhereInput = {};

  if (search) {
    query = {
      OR: [{ name: { contains: search, mode: "insensitive" } }],
    };
  }

  const [data, count] = await prisma.$transaction([
    prisma.subject.findMany({
      where: query,
      include: {
        teachers: {
          include: {
            teacher: true,
          },
        },
      },
      skip: (page - 1) * ITEM_PER_PAGE,
      take: ITEM_PER_PAGE,
      orderBy: { id: "asc" },
    }),
    prisma.subject.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP SECTION */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          Liste des matières
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
            <FormContainer table="subject" type="create" />
          </div>
        </div>
      </div>

      <Table<SubjectList> columns={columns} renderRow={renderRow} data={data} />

      <Pagination page={page} count={count} />
    </div>
  );
};

export default SubjectListPage;
