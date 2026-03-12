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


type ResultList = {
  id: number;
  title: string;
  studentName: string;
  studentSurname: string;
  teacherName: string;
  teacherSurname: string;
  score: number;
  className: string;
  date: Date;
  type: "Exam" | "Assignment";
};

const ResultListPage = async ({
  searchParams,
}: {
  searchParams: {
    [key: string]: string | undefined
  };
}) => {
  const { page, ...queryParams } = await searchParams;

  const p = page ? parseInt(page) : 1;

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const columns = [
    { header: "Titre", accessor: "title" },

    { header: "Elève", accessor: "student" },
    { header: "Note", accessor: "score", className: "hidden md:table-cell " },
    {
      header: "Enseignant",
      accessor: "teacher",
      className: "hidden md:table-cell ",
    },
    {
      header: "Classe",
      accessor: "class",
      className: "hidden md:table-cell ",
    },
    { header: "Type", accessor: "type", className: "hidden md:table-cell " },

    {
      header: "Date",
      accessor: "date",
      className: "hidden md:table-cell ",
    },
    ...(role === "admin" || role === "teacher"
      ? [{ header: "Actions", accessor: "actions" }]
      : []),
  ];

  const renderRow = (item: ResultList) => (
    <tr
      key={item.id}
      className="border-b hover:bg-blue-200 even:bg-slate-50 border-t border-gray-200 border-l border-r"
    >
      <td className="flex items-center gap-4 p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.title}</h3>
        </div>
      </td>
      <td>{item.studentName + " " + item.studentSurname}</td>
      <td className="hidden md:table-cell">{item.score}</td>
      <td className="hidden md:table-cell">
        {item.teacherName + " " + item.teacherSurname}
      </td>
      <td className="hidden md:table-cell">{item.className}</td>
      <td className="hidden md:table-cell">
        {item.type === "Exam" ? (
          <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700">
            Trimestre
          </span>
        ) : (
          <span className="px-2 py-1 text-xs rounded bg-purple-100 text-purple-700">
            Dévoir
          </span>
        )}
      </td>
      <td className="hidden md:table-cell">
        {new Intl.DateTimeFormat("fr-FR").format(item.date)}
      </td>
      <td>
        <div className="flex items-center gap-2">
          {(role === "admin" || role === "teacher") && (
            <>
              <FormContainer table="result" type="update" data={item} />
              <FormContainer table="result" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  // URL PARAMS CONDITION
  const where: Prisma.ResultWhereInput = {
    AND: [],
  };

  // Fetch data accoording to user role
  // 🔐 Role filter
  switch (role) {
    case "teacher":
      (where.AND as Prisma.ResultWhereInput[]).push({
        OR: [
          { exam: { lesson: { teacherId: userId! } } },
          { assignment: { lesson: { teacherId: userId! } } },
        ],
      });
      break;

    case "student":
      (where.AND as Prisma.ResultWhereInput[]).push({
        studentId: userId!,
      });
      break;

    case "parent":
      (where.AND as Prisma.ResultWhereInput[]).push({
        student: {
          parentId: userId!,
        },
      });
      break;

    default:
      break;
  }

  if (queryParams.search) {
    (where.AND as Prisma.ResultWhereInput[]).push({
      OR: [
        { exam: { title: { contains: queryParams.search, mode: "insensitive" } } },
        { student: { name: { contains: queryParams.search, mode: "insensitive" } } },
        { student: { surname: { contains: queryParams.search, mode: "insensitive" } } },
      ],
    });
  }

  if (queryParams.studentId) {
    (where.AND as Prisma.ResultWhereInput[]).push({
      studentId: queryParams.studentId,
    });
  }

  const [dataRes, count] = await prisma.$transaction([
    prisma.result.findMany({
      where,
      include: {
        student: { select: { name: true, surname: true } },
        exam: {
          include: {
            lesson: {
              select: {
                class: { select: { name: true } },
                teacher: { select: { name: true, surname: true } },
              },
            },
          },
        },
        assignment: {
          include: {
            lesson: {
              select: {
                class: { select: { name: true } },
                teacher: { select: { name: true, surname: true } },
              },
            },
          },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { id: "desc" },
    }),
    prisma.result.count({ where }),
  ]);

  const data: ResultList[] = dataRes
    .map((item) => {
      const assessment = item.exam ?? item.assignment;
      if (!assessment) return null;

      const isExam = !!item.exam;

      return {
        id: item.id,
        title: assessment.title,
        studentName: item.student.name,
        studentSurname: item.student.surname,
        teacherName: assessment.lesson.teacher.name,
        teacherSurname: assessment.lesson.teacher.surname,
        score: item.score,
        className: assessment.lesson.class.name,
        date: isExam
          ? item.exam!.startTime
          : item.assignment!.startDate,
        type: isExam ? "Exam" : "Assignment",
      };
    })
    .filter((item): item is ResultList => item !== null);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP SECTION */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          Liste des résultats
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
            {(role === "admin" || role === "teacher") && (
              <FormContainer table="result" type="create" />
            )}
          </div>
        </div>
      </div>

      {/* List of Results */}
      <Table columns={columns} renderRow={renderRow} data={data} />

      {/* Pagination */}
      <Pagination page={p} count={count} />
    </div>
  );
};
export default ResultListPage;
