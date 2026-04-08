"use server";

import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { Prisma } from "@prisma/client";
import { ITEM_PER_PAGE } from "@/lib/settings";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import {
  Filter,
  ArrowUpDown
} from "lucide-react";


type AssignmentList = {
  id: number;
  title: string;
  lessonId: number;
  startDate: string | null;
  dueDate: string | null; 
  lesson: {
    teacher: {
      name: string;
      surname: string;
    };
    class: {
      name: string;
    };
    subject: {
      name: string;
    };
  };
};

const AssignmentListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {

  const { page, ...queryParams } = await searchParams;

  const p = page ? parseInt(page) : 1;

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  const columns = [
    { header: "Matière", accessor: "info" },

    {
      header: "Titre",
      accessor: "title",
    },

    {
      header: "Classe",
      accessor: "class",
    },

    { header: "Enseignant", accessor: "teacher", className: "hidden md:table-cell ", },

    {
      header: "Date de debut",
      accessor: "startDate",
      className: "hidden md:table-cell ",
    },

    {
      header: "Date de rendu",
      accessor: "dueDate",
      className: "hidden md:table-cell ",
    },
    ...(role === "admin" || role === "teacher" || role === "super_admin"
      ? [{ header: "Actions", accessor: "actions" }]
      : []),
  ];

  const renderRow = (item: AssignmentList) => (
    <tr
      key={item.id}
      className="border-b hover:bg-blue-200 even:bg-slate-50 border-t border-gray-200 border-l border-r"
    >
      <td className="flex items-center gap-4 p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.lesson?.subject?.name}</h3>
        </div>
      </td>
      <td>{item.title}</td>
      <td>{item.lesson?.class?.name}</td>
      <td className="hidden md:table-cell">
        {item.lesson?.teacher?.name + " " + item.lesson?.teacher?.surname}
      </td>
      <td className="hidden md:table-cell">
        {item.startDate && new Intl.DateTimeFormat("fr-FR").format(new Date(item.startDate))}
      </td>
      <td className="hidden md:table-cell">
        {item.dueDate && new Intl.DateTimeFormat("fr-FR").format(new Date(item.dueDate))}
      </td>
      <td>
        <div className="flex items-center gap-2">
          {(role === "admin" || role === "teacher") && (
            <>
              <FormContainer table="assignment" type="update" data={item} />
              <FormContainer table="assignment" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  // URL PARAMS CONDITION

  const query: Prisma.AssignmentWhereInput = {};
  if (role === "teacher") {
    query.lesson = {
      teacherId: userId!,
    };
  }

  query.lesson = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "classId":
            query.lesson.classId = parseInt(value);
            break;
          case "teacherId":
            query.lesson.teacherId = value;
            break;
          case "search":
            query.lesson.subject = {
              name: { contains: value, mode: "insensitive" },
            };
            break;
          default:
            break;
        }
      }
    }
  }

  // Fetch data based on role conditions
  switch (role) {
    case "admin":
      break;
    case "teacher":
      query.lesson.teacherId = currentUserId!;
      break;
    case "student":
      query.lesson.class = {
        students: {
          some: {
            id: currentUserId!,
          },
        },
      };
      break;
    case "parent":
      query.lesson.class = {
        students: {
          some: {
            parentId: currentUserId!,
          },
        },
      };
      break;
    default:
      break;
  }

  let data: any[] = [];
  let count = 0;

  try {
    const result = await prisma.$transaction([
      prisma.assignment.findMany({
        where: query,
        include: {
          lesson: {
            include: {
              subject: { select: { name: true } },
              teacher: { select: { name: true, surname: true } },
              class: { select: { name: true } },
            },
          },
        },
        take: ITEM_PER_PAGE,
        skip: ITEM_PER_PAGE * (p - 1),
      }),
      prisma.assignment.count({ where: query }),
    ]);

    data = result[0];
    count = result[1];

  } catch (error) {
    console.error("🔥 ASSIGNMENT ERROR:", error);
    throw error;
  }


  const serializedData = data.map((item) => ({
    ...item,
    startDate: item.startDate ? item.startDate.toISOString() : null,
    dueDate: item.dueDate ? item.dueDate.toISOString() : null,
  }));

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP SECTION */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          Liste des travail à faires
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
              <FormContainer table="assignment" type="create" />
            )}
          </div>
        </div>
      </div>

      {/* List of Assignments */}
      <Table<AssignmentList>
        columns={columns}
        renderRow={renderRow}
        data={serializedData}
      />

      {/* Pagination */}
      <Pagination page={p} count={count} />
    </div>
  );
};
export default AssignmentListPage;
