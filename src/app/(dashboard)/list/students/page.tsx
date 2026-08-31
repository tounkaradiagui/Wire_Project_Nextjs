"use server";

import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Prisma, Student, Grade } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { studentRoleFilter } from "@/lib/roleFilters";
import { Eye, IdCard } from "lucide-react";
import TableActions from "@/lib/helpers/TableActions";
import StudentFiltersModal from "@/lib/filters/StudentFiltersModal";
import ActiveFilters from "@/lib/filters/ActiveFilters";
import ResetFiltersButton from "@/lib/filters/ResetFiltersButton";
import { withDB } from "@/lib/helpers/with-db";

type StudentList = Student & {
  class: Class;
  grade: Grade;
};

const StudentListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { page, ...queryParams } = await searchParams;

  const p = page ? parseInt(page) : 1;

  // ============================================================
  // AUTH
  // ============================================================

  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-6">
        <p className="text-red-500">
          Utilisateur non authentifié.
        </p>
      </div>
    );
  }

  const role = (
    sessionClaims?.metadata as {
      role?: string;
    }
  )?.role;

  // ============================================================
  // ACTOR
  // ============================================================

  const actor = await prisma.userProfile.findUnique({
    where: {
      clerkId: userId,
    },
    select: {
      id: true,
      role: true,
      schoolId: true,
    },
  });

  if (!actor) {
    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-6">
        <p className="text-red-500">
          Profil utilisateur introuvable.
        </p>
      </div>
    );
  }

  // Pour les utilisateurs classiques, schoolId est obligatoire.
  if (actor.role !== "SUPER_ADMIN" && !actor.schoolId) {
    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-6">
        <p className="text-red-500">
          Aucune école associée à votre compte.
        </p>
      </div>
    );
  }

  // IMPORTANT :
  // Après cette vérification, on crée une variable locale.
  const schoolId = actor.schoolId;

  // ============================================================
  // COLUMNS
  // ============================================================

  const columns = [
    {
      header: "Infos",
      accessor: "info",
    },
    {
      header: "Identifiant",
      accessor: "studentId",
      className: "hidden md:table-cell",
    },
    {
      header: "Genre",
      accessor: "sex",
      className: "hidden md:table-cell",
    },
    {
      header: "Niveau",
      accessor: "grade",
      className: "hidden md:table-cell",
    },
    {
      header: "Classe",
      accessor: "class",
      className: "hidden md:table-cell",
    },
    {
      header: "Téléphone",
      accessor: "phone",
      className: "hidden md:table-cell",
    },
    {
      header: "Adresse",
      accessor: "address",
      className: "hidden lg:table-cell",
    },
    ...(role === "admin" ||
      role === "teacher" ||
      role === "parent"
      ? [
        {
          header: "Actions",
          accessor: "actions",
        },
      ]
      : []),
  ];

  // ============================================================
  // RENDER ROW
  // ============================================================

  const renderRow = (item: StudentList) => (
    <tr
      key={item.id}
      className="
                border-b
                hover:bg-blue-200
                even:bg-slate-50
                border-t
                border-gray-200
                border-l
                border-r
            "
    >
      <td className="flex items-center gap-4 p-4">
        <Image
          src={item.image || "/noAvatar.png"}
          width={40}
          height={40}
          alt=""
          className="
                        md:hidden
                        xl:block
                        w-10
                        h-10
                        object-cover
                        rounded-full
                    "
        />

        <div className="flex flex-col">
          <h3 className="font-semibold">
            {item.name}
          </h3>

          <h3 className="font-semibold">
            {item.surname}
          </h3>
        </div>
      </td>

      <td className="hidden md:table-cell">
        {item.username}
      </td>

      <td className="hidden md:table-cell">
        {item.sex === "MALE" ? "M" : "F"}
      </td>

      <td className="hidden md:table-cell">
        {item.grade.cycle === "FIRST"
          ? "1er Cycle"
          : "2ème Cycle"}
      </td>

      <td className="hidden md:table-cell">
        {item.class.name}
      </td>

      <td className="hidden md:table-cell">
        {item.phone}
      </td>

      <td className="hidden lg:table-cell">
        {item.address}
      </td>

      {role === "admin" && (
        <td>
          <div className="flex items-center gap-2">
            <Link
              href={`/list/students/${item.id}`}
            >
              <button
                title="Voir le profil"
                className="
                                    bg-blue-500
                                    hover:bg-blue-600
                                    p-2
                                    cursor-pointer
                                    rounded
                                    text-white
                                "
              >
                <Eye size={16} />
              </button>
            </Link>

            <Link
              href={`/list/students/${item.id}/card`}
            >
              <button
                title="Voir la carte d'identité"
                className="
                                    bg-purple-500
                                    hover:bg-purple-600
                                    p-2
                                    cursor-pointer
                                    rounded
                                    text-white
                                    transition
                                "
              >
                <IdCard size={16} />
              </button>
            </Link>

            <div title="Supprimer l'élève">
              <FormContainer
                table="student"
                type="delete"
                id={item.id}
              />
            </div>
          </div>
        </td>
      )}
    </tr>
  );

  // ============================================================
  // FILTER
  // ============================================================

  const query: Prisma.StudentWhereInput = {
    ...studentRoleFilter(role, userId),
    isDeleted: false,

    // Si ce n'est pas un SUPER_ADMIN,
    // on limite à son école.
    ...(actor.role !== "SUPER_ADMIN" && schoolId
      ? {
        schoolId,
      }
      : {}),
  };

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (!value) continue;

      switch (key) {
        case "search":
          query.OR = [
            {
              name: {
                contains: value,
                mode: "insensitive",
              },
            },
            {
              surname: {
                contains: value,
                mode: "insensitive",
              },
            },
            {
              username: {
                contains: value,
                mode: "insensitive",
              },
            },
          ];
          break;

        case "classId": {
          const classId = Number(value);

          if (!Number.isNaN(classId)) {
            query.classId = classId;
          }

          break;
        }

        case "gradeId": {
          const gradeId = Number(value);

          if (!Number.isNaN(gradeId)) {
            query.gradeId = gradeId;
          }

          break;
        }

        case "sex":
          if (
            value === "MALE" ||
            value === "FEMALE"
          ) {
            query.sex = value;
          }
          break;

        default:
          break;
      }
    }
  }

  // ============================================================
  // SORT
  // ============================================================

  const allowedSortFields = [
    "name",
    "surname",
    "username",
    "createdAt",
  ];

  const sortBy = allowedSortFields.includes(
    queryParams.sortBy || ""
  )
    ? queryParams.sortBy
    : "createdAt";

  const sortOrder =
    queryParams.sortOrder === "asc"
      ? "asc"
      : "desc";

  const orderBy: Prisma.StudentOrderByWithRelationInput = {
    [sortBy!]: sortOrder,
  };

  // ============================================================
  // QUERY
  // ============================================================

  const [data, count, classes, grades] = await withDB(() =>
    prisma.$transaction([
      // ----------------------------------------------------
      // STUDENTS
      // ----------------------------------------------------

      prisma.student.findMany({
        where: query,

        orderBy,

        include: {
          class: true,
          grade: true,
        },

        take: ITEM_PER_PAGE,

        skip: ITEM_PER_PAGE * (p - 1),
      }),

      // ----------------------------------------------------
      // COUNT
      // ----------------------------------------------------

      prisma.student.count({
        where: query,
      }),

      // ----------------------------------------------------
      // CLASSES
      // ----------------------------------------------------

      prisma.class.findMany({
        where:
          actor.role === "SUPER_ADMIN"
            ? {}
            : {
              schoolId: schoolId!,
            },

        select: {
          id: true,
          name: true,
        },

        orderBy: {
          name: "asc",
        },
      }),

      // ----------------------------------------------------
      // GRADES
      // ----------------------------------------------------

      prisma.grade.findMany({
        where:
          actor.role === "SUPER_ADMIN"
            ? {}
            : {
              schoolId: schoolId!,
            },

        select: {
          id: true,
          level: true,
        },

        orderBy: {
          level: "asc",
        },
      }),
    ])
  );

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-6">
      {/* TOP SECTION */}

      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          Liste des élèves
        </h1>

        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
          <TableSearch />

          <div className="flex items-center gap-4 self-end">
            <ResetFiltersButton />

            <ActiveFilters
              classes={classes}
              grades={grades}
            />

            <StudentFiltersModal
              classes={classes}
              grades={grades}
            />

            <TableActions />

            {role === "admin" && (
              <FormContainer
                table="student"
                type="create"
              />
            )}
          </div>
        </div>
      </div>

      {/* LISTE */}

      <Table
        columns={columns}
        renderRow={renderRow}
        data={data}
      />

      {/* PAGINATION */}

      <Pagination
        page={p}
        count={count}
      />
    </div>
  );
};

export default StudentListPage;