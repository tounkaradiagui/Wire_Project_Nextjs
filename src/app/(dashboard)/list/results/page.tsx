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
  ArrowUpDown,
  IdCard
} from "lucide-react";
import ResetFiltersButton from "@/lib/filters/ResetFiltersButton";
import ActiveFilters from "@/lib/filters/ActiveFilters";
import TableActions from "@/lib/helpers/TableActions";
import ResultFiltersModal from "@/lib/filters/ResultFiltersModal";
import Link from "next/link";
import { withDB } from "@/lib/helpers/with-db";


type ResultList = {
  id: number;
  title: string;

  studentName: string;
  studentSurname: string;

  teacherName: string;
  teacherSurname: string;

  subjectName: string;
  termName: string;   

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
    { header: "Élève", accessor: "student" },
    { header: "Matière", accessor: "subject" },   // 🔥 NEW
    { header: "Note", accessor: "score" },

    {
      header: "Enseignant",
      accessor: "teacher",
      className: "hidden md:table-cell",
    },

    {
      header: "Classe",
      accessor: "class",
      className: "hidden md:table-cell",
    },

    { header: "Trimestre", accessor: "term" }, 
    { header: "Type", accessor: "type" },

    {
      header: "Date",
      accessor: "date",
      className: "hidden md:table-cell",
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
      <td>{item.subjectName}</td>
      <td>{item.score}</td>
      <td className="hidden md:table-cell">
        {item.teacherName + " " + item.teacherSurname}
      </td>
      <td className="hidden md:table-cell">{item.className}</td>
      <td>
        <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">
          {item.termName} 
        </span>
      </td>
      <td>
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
              <Link
                // href={`/api/bulettin/${studentId}`}
                href=""
                target="_blank"
                
              >
                <button
                  title="Voir le bulletin"
                  className="flex items-center gap-1 px-3 py-1 text-xs rounded-md bg-green-600 text-white hover:bg-green-700"
                >
                <IdCard size={16} />
                </button>
                {/* Présences */}
              </Link>
              <FormContainer table="result" type="update" data={item} />
              <FormContainer table="result" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const where: Prisma.ResultWhereInput = {};

  // ----------------------
  // ROLE FILTER
  // ----------------------

  if (role === "teacher") {
    where.OR = [
      { exam: { lesson: { teacherId: userId! } } },
      { assignment: { lesson: { teacherId: userId! } } },
    ];
  }

  if (role === "student") {
    where.studentId = userId!;
  }

  if (role === "parent") {
    where.student = {
      parentId: userId!,
    };
  }

  // ----------------------
  // FILTERS
  // ----------------------

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (!value) continue;

      switch (key) {
        case "search":
          where.AND = [
            ...(Array.isArray(where.AND)
              ? where.AND
              : where.AND
                ? [where.AND]
                : []),
            {
              OR: [
                { exam: { title: { contains: value, mode: "insensitive" } } },
                { assignment: { title: { contains: value, mode: "insensitive" } } },
                { student: { name: { contains: value, mode: "insensitive" } } },
                { student: { surname: { contains: value, mode: "insensitive" } } },
              ],
            },
          ];
          break;

        case "studentId":
          where.studentId = value;
          break;

        case "classId":
          where.AND = [
            ...(Array.isArray(where.AND)
              ? where.AND
              : where.AND
                ? [where.AND]
                : []),
            {
              OR: [
                { exam: { lesson: { classId: parseInt(value) } } },
                { assignment: { lesson: { classId: parseInt(value) } } },
              ],
            },
          ];
          break;

        case "teacherId":
          where.AND = [
            ...(Array.isArray(where.AND)
              ? where.AND
              : where.AND
                ? [where.AND]
                : []),
            {
              OR: [
                { exam: { lesson: { teacherId: value } } },
                { assignment: { lesson: { teacherId: value } } },
              ],
            },
          ];
          break;

        case "type":
          if (value === "Exam") {
            where.examId = { not: null };
          }
          if (value === "Assignment") {
            where.assignmentId = { not: null };
          }
          break;

        case "minScore": {
          const scoreFilter =
            typeof where.score === "object" && where.score !== null
              ? where.score
              : {};

          where.score = {
            ...scoreFilter,
            gte: parseInt(value),
          };
          break;
        }

        case "maxScore": {
          const scoreFilter =
            typeof where.score === "object" && where.score !== null
              ? where.score
              : {};

          where.score = {
            ...scoreFilter,
            lte: parseInt(value),
          };
          break;
        }
      }
    }
  }

  // Tri dynamique
  const allowedSortFields = ["score", "id"];

  const sortBy = allowedSortFields.includes(queryParams.sortBy || "")
    ? queryParams.sortBy
    : "id";

  const sortOrder =
    queryParams.sortOrder === "asc" ? "asc" : "desc";

  const orderBy: Prisma.ResultOrderByWithRelationInput = {
    [sortBy!]: sortOrder,
  };

  // Data & sources filters
  const [dataRes, count, classes, teachers, students] =
  await withDB(() => prisma.$transaction([

      prisma.result.findMany({
        where,
        include: {
          student: { select: { id: true, name: true, surname: true } },
          subject: { select: { id: true, name: true } }, 
          term: { select: { id: true, name: true } },   

          exam: {
            include: {
              lesson: {
                select: {
                  class: { select: { id: true, name: true } },
                  teacher: { select: { id: true, name: true, surname: true } },
                },
              },
            },
          },

          assignment: {
            include: {
              lesson: {
                select: {
                  class: { select: { id: true, name: true } },
                  teacher: { select: { id: true, name: true, surname: true } },
                },
              },
            },
          },
        },
        take: ITEM_PER_PAGE,
        skip: ITEM_PER_PAGE * (p - 1),
        orderBy,
      }),

      prisma.result.count({ where }),

      prisma.class.findMany({ select: { id: true, name: true } }),

      prisma.teacher.findMany({ select: { id: true, name: true, surname: true } }),

      prisma.student.findMany({ select: { id: true, name: true, surname: true } }),
    ])
  );

  // Data
  const data: ResultList[] = dataRes
  .map((item) => {
    const isExam = !!item.exam;

    const lesson = item.exam?.lesson || item.assignment?.lesson;

    if (!lesson) return null;

    return {
      id: item.id,

      title: isExam
        ? item.exam!.title
        : item.assignment!.title,

      studentName: item.student.name,
      studentSurname: item.student.surname,

      teacherName: lesson.teacher.name,
      teacherSurname: lesson.teacher.surname,

      subjectName: item.subject.name, // 🔥
      termName: item.term.name,       // 🔥

      score: item.score,

      className: lesson.class.name,

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
            <ResetFiltersButton />
            <ActiveFilters classes={classes} teachers={teachers} />
            <ResultFiltersModal classes={classes} teachers={teachers} />
            <TableActions />
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
