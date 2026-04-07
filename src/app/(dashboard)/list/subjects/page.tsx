"use server";

import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { ITEM_PER_PAGE } from "@/lib/settings";
import FormContainer from "@/components/FormContainer";
import TableActions from "@/lib/helpers/TableActions";
import SubjectFiltersModal from "@/lib/filters/SubjectFiltersModal";
import ActiveFilters from "@/lib/filters/ActiveFilters";
import ResetFiltersButton from "@/lib/filters/ResetFiltersButton";
import { withDB } from "@/lib/helpers/with-db";


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

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const columns = [
    { header: "Nom de la matière", accessor: "info" },
    { header: "Coefficient", accessor: "coef" },
    {
      header: "Enseignants",
      accessor: "teachers",
      className: "hidden md:table-cell ",
    },
    ...(role === "admin" ?
      [{ header: "Actions", accessor: "actions" }]
      : [])
  ];

  const renderRow = (item: SubjectList) => (
    <tr
      key={item.id}
      className="border-b hover:bg-blue-200 even:bg-slate-50 border-t border-gray-200 border-l border-r"
    >
      <td className="flex items-center gap-4 p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-xs text-gray-500">{item.code?.trim() || "Aucun code défini"}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">
       {item.coefficient ?? "Non défini"}
      </td>
      <td className="hidden md:table-cell">
        {item.teachers.length > 0
          ? item.teachers.map((t) => `${t.teacher.name} ${t.teacher.surname}`).join(", ")
          : "—"}
      </td>
      {role === "admin" && (
        <td>
          <div className="flex items-center gap-2">
            <>
              <FormContainer table="subject" type="update" data={item} />
              <FormContainer table="subject" type="delete" id={item.id} />
            </>
          </div>
        </td>
      )}
    </tr>
  );

  // BASE QUERY
  const query: Prisma.SubjectWhereInput = {
    isDeleted: false
  };

  // Restrictions
  if (role === "teacher") {
    query.teachers = {
      some: {
        teacherId: userId!,
      },
    };
  }

  // Filtres coté UI
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (!value) continue;

      switch (key) {
        case "search":
          query.OR = [
            { name: { contains: value, mode: "insensitive" } },
            { code: { contains: value, mode: "insensitive" } },
          ];
          break;      

        case "classId":
          query.lessons = {
            some: {
              classId: parseInt(value),
            },
          };
          break;

        default:
          break;
      }
    }
  }

  // Tri dynamique
  const allowedSortFields = ["name", "code", "id"];

  const sortBy = allowedSortFields.includes(params.sortBy || "")
    ? params.sortBy
    : "id";

  const sortOrder =
    params.sortOrder === "asc" ? "asc" : "desc";

  const orderBy: Prisma.SubjectOrderByWithRelationInput = {
    [sortBy!]: sortOrder,
  };

  // Role basé sur les filtres d'accès (ex: un enseignant ne voit que ses matières) 
  const [data, count, teachers, classes] = await withDB(() =>
    prisma.$transaction([
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
        orderBy,
      }),

      prisma.subject.count({ where: query }),

      prisma.teacher.findMany({
        select: { id: true, name: true, surname: true },
      }),


      prisma.class.findMany({
        select: { id: true, name: true },
      }),
    ])
  );

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
            <ResetFiltersButton />
            <ActiveFilters teachers={teachers} classes={classes} />
            <SubjectFiltersModal teachers={teachers} classes={classes} />
            <TableActions />
            {role === "admin" && (
              <FormContainer table="subject" type="create" />
            )}
          </div>
        </div>
      </div>

      <Table<SubjectList> columns={columns} renderRow={renderRow} data={data} />

      <Pagination page={page} count={count} />
    </div>
  );
};

export default SubjectListPage;
