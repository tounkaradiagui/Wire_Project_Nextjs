"use server";

import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { UserProfile, Prisma } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { studentRoleFilter } from "@/lib/roleFilters";
import {
  Eye,
  Filter,
  ArrowUpDown,
  Ban,
  CheckCircle
} from "lucide-react";
import { toggleUserStatus } from "@/lib/actions";


type UserList = UserProfile;


const UsersListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { page, ...queryParams } = await searchParams;

  const p = page ? parseInt(page) : 1;

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

const columns = [
  { header: "Utilisateur", accessor: "info" },
  { header: "Clerk ID", accessor: "clerkId" },
  {
    header: "Nom d'utilisateur",
    accessor: "username",
    className: "hidden md:table-cell",
  },
  {
    header: "Prénom",
    accessor: "prénom",
    className: "hidden lg:table-cell",
  },
  {
    header: "Nom",
    accessor: "nom",
    className: "hidden md:table-cell",
  },
  { header: "Rôle", accessor: "role" },
  {
    header: "Créé le",
    accessor: "createdAt",
    className: "hidden md:table-cell",
  },
  { header: "Statut", accessor: "isActive" },
  ...(role === "super_admin"
    ? [{ header: "Actions", accessor: "actions" }]
    : []),
];

const renderRow = (item: UserList) => (
  <tr
    key={item.id}
    className="border-b hover:bg-blue-200 even:bg-slate-50 border"
  >
    <td className="flex items-center gap-4 p-4">
      <Image
        src={item.image || "/noAvatar.png"}
        width={40}
        height={40}
        alt=""
        className="w-10 h-10 object-cover rounded-full"
      />
    </td>
    <td className="p-4">{item.clerkId}</td>
    <td className="p-4">{item.username}</td>
    <td className="p-4">{item.firstName}</td>
    <td className="p-4">{item.lastName}</td>
    <td className="hidden md:table-cell font-medium">
      {item.role === "PARENT" ? "Parent" : item.role === "TEACHER" ? "Enseignant" : item.role === "ADMIN" ? "Administrateur" : item.role === "STUDENT" ? "Elève" : "Administration"}
    </td>
    <td className="hidden md:table-cell">
      {new Date(item.createdAt).toLocaleDateString()}
    </td>
    <td>
      <span
        className={`px-2 py-1 text-xs rounded ${
          item.isActive
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {item.isActive ? "Actif" : "Banni"}
      </span>
    </td>

    <td>
      <div className="flex items-center gap-2">
        <Link href={`/list/users/${item.id}`}>
          <button className="bg-blue-500 hover:bg-blue-600 p-2 rounded text-white">
            <Eye size={16} className="cursor-pointer"/>
          </button>
        </Link>

        {role === "super_admin" && (
          <>
            <form action={toggleUserStatus.bind(null, item.id)}>
              <button
                className={`p-2 rounded text-white ${
                  item.isActive
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {/* {item.isActive ? "Ban" : "Activer"} */}
                {item.isActive ? 
                <Ban size={16} className="cursor-pointer"/> 
                : 
                <CheckCircle size={16} className="cursor-pointer"/>}
              </button>
            </form>

            {/* <FormContainer table="user" type="delete" id={item.id} /> */}
          </>
        )}
      </div>
    </td>

  </tr>
);
  // URL PARAMS CONDITION
  const query: Prisma.UserProfileWhereInput = {};

  if (queryParams?.search) {
    query.OR = [
      { username: { contains: queryParams.search, mode: "insensitive" } },
      { firstName: { contains: queryParams.search, mode: "insensitive" } },
      { lastName: { contains: queryParams.search, mode: "insensitive" } },
    ];
  }

  const [data, count] = await prisma.$transaction([
    prisma.userProfile.findMany({
      where: query,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { createdAt: "desc" },
    }),
    prisma.userProfile.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP SECTION */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          Liste des utilisateurs
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
            {role === "admin" || role === "super_admin" && <FormContainer table="user" type="create" />}
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
export default UsersListPage;
