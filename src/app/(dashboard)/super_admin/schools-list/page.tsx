"use server";

import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import { School, Prisma } from "@prisma/client";
import Image from "next/image";
import {
    Filter,
    ArrowUpDown,
    Eye,
} from "lucide-react";
import Link from "next/link";


type SchoolList = School;


const SchoolListPage = async ({
    searchParams,
}: {
    searchParams: { [key: string]: string | undefined };
}) => {
    const { page, ...queryParams } = await searchParams;

    const p = page ? parseInt(page) : 1;

    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    const columns = [
        {
            header: "Ecole",
            accessor: "school",
        },
        {
            header: "Ville",
            accessor: "city",
            className: "hidden md:table-cell",
        },
        {
            header: "Pays",
            accessor: "country",
            className: "hidden md:table-cell",
        },
        {
            header: "Plan",
            accessor: "plan",
            className: "hidden lg:table-cell",
        },
        {
            header: "Statut",
            accessor: "status",
            className: "hidden lg:table-cell",
        },
        {
            header: "Vérifiée",
            accessor: "verified",
            className: "hidden lg:table-cell",
        },
        {
            header: "Créée le",
            accessor: "createdAt",
            className: "hidden xl:table-cell",
        },
        ...(role === "super_admin"
            ? [{ header: "Actions", accessor: "actions" }]
            : []),
    ];

    const renderRow = (item: SchoolList) => (
        <tr
            key={item.id}
            className="border-b hover:bg-blue-50 even:bg-slate-50"
        >
            <td className="flex items-center gap-3 p-4">
                <Image
                    src={item.logoUrl || "/noAvatar.png"}
                    alt=""
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                />

                <div className="flex flex-col">
                    <span className="font-semibold">{item.name}</span>
                    <span className="text-xs text-gray-500">
                        {item.email}
                    </span>
                </div>
            </td>

            <td className="hidden md:table-cell">
                {item.city}
            </td>

            <td className="hidden md:table-cell">
                {item.country}
            </td>

            <td className="hidden lg:table-cell">
                {item.plan}
            </td>

            <td className="hidden lg:table-cell">
                <span
                    className={`px-2 py-1 rounded-full text-xs font-medium
            ${item.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : item.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                        }`}
                >
                    {item.status}
                </span>
            </td>

            <td className="hidden lg:table-cell">
                {item.isVerified ? "✅" : "❌"}
            </td>

            <td className="hidden xl:table-cell">
                {item.createdAt.toLocaleDateString()}
            </td>

            <td>
                {role === "super_admin" && (
                    <div className="flex items-center gap-2">
                        
                        <Link href={`/super_admin/schools-list/${item.id}`}>
                            <button title="Voir les details" className="bg-blue-500 hover:bg-blue-600 p-2 cursor-pointer rounded text-white">
                                <Eye size={16} />
                            </button>
                        </Link>

                        <FormContainer
                            table="school"
                            type="delete"
                            id={item.id}
                        />
                    </div>
                )}
            </td>
        </tr>
    );

    const query: Prisma.SchoolWhereInput = {
        isDeleted: false,
    };

    if (queryParams.search) {
        query.OR = [
            {
                name: {
                    contains: queryParams.search,
                    mode: "insensitive",
                },
            },
            {
                city: {
                    contains: queryParams.search,
                    mode: "insensitive",
                },
            },
            {
                country: {
                    contains: queryParams.search,
                    mode: "insensitive",
                },
            },
        ];
    }

    const [data, count] = await prisma.$transaction([
        prisma.school.findMany({
            where: query,
            orderBy: {
                createdAt: "desc",
            },
            take: ITEM_PER_PAGE,
            skip: ITEM_PER_PAGE * (p - 1),
        }),

        prisma.school.count({
            where: query,
        }),
    ]);

    return (
        <div className="bg-white p-4 rounded-md flex-1 m-4 mt-4">
            <div className="flex items-center justify-between">
                <h1 className="hidden md:block text-lg font-semibold">
                    Liste des écoles
                </h1>

                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
                    <TableSearch />

                    <div className="flex items-center gap-4 self-end">
                        <button className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200">
                            <Filter size={16} />
                            <span className="text-sm">Filtrer</span>
                        </button>

                        <button className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200">
                            <ArrowUpDown size={16} />
                            <span className="text-sm">Trier</span>
                        </button>

                        {role === "super_admin" && (
                            <FormContainer
                                table="school"
                                type="create"
                            />
                        )}
                    </div>
                </div>
            </div>

            <Table
                columns={columns}
                renderRow={renderRow}
                data={data}
            />

            <Pagination
                page={p}
                count={count}
            />
        </div>
    );
};

export default SchoolListPage;