"use server";

import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import { Prisma, RequestStatus } from "@prisma/client";
import {
    Filter,
    ArrowUpDown,
    Eye,
} from "lucide-react";
import Link from "next/link";

type SchoolRequestList = Prisma.SchoolRegistrationRequestGetPayload<{
    include: {
        createdSchool: true;
    };
}>;

const SchoolRequestListPage = async ({
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
            header: "École",
            accessor: "school",
        },
        {
            header: "Responsable",
            accessor: "contact",
            className: "hidden md:table-cell",
        },
        {
            header: "Ville",
            accessor: "city",
            className: "hidden lg:table-cell",
        },
        {
            header: "Pays",
            accessor: "country",
            className: "hidden lg:table-cell",
        },
        {
            header: "Élèves",
            accessor: "students",
            className: "hidden xl:table-cell",
        },
        {
            header: "Statut",
            accessor: "status",
            className: "hidden xl:table-cell",
        },
        {
            header: "Date",
            accessor: "createdAt",
            className: "hidden xl:table-cell",
        },
        ...(role === "super_admin"
            ? [{ header: "Actions", accessor: "actions" }]
            : []),
    ];

    const renderRow = (item: SchoolRequestList) => (
        <tr
            key={item.id}
            className="border-b even:bg-slate-50 hover:bg-blue-50"
        >
            {/* ECOLE */}
            <td className="p-4">
                <div className="flex flex-col">
                    <span className="font-semibold">{item.schoolName}</span>
                    <span className="text-xs text-gray-500">{item.email}</span>
                </div>
            </td>

            {/* RESPONSABLE */}
            <td className="hidden md:table-cell">
                <div className="flex flex-col">
                    <span>{item.contactName}</span>
                    <span className="text-xs text-gray-500">
                        {item.phone || "-"}
                    </span>
                </div>
            </td>

            {/* VILLE */}
            <td className="hidden lg:table-cell">
                {item.city}
            </td>

            {/* PAYS */}
            <td className="hidden lg:table-cell">
                {item.country}
            </td>

            {/* NB ELEVES */}
            <td className="hidden xl:table-cell">
                {item.studentsCount ?? "-"}
            </td>

            {/* STATUS */}
            <td className="hidden xl:table-cell">
                <span
                    className={`px-2 py-1 rounded-full text-xs font-medium
            ${item.status === RequestStatus.PENDING
                            ? "bg-yellow-100 text-yellow-700"
                            : item.status === RequestStatus.VALIDATED
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                        }
          `}
                >
                    {item.status === "VALIDATED" ? "Approuvée" : item.status === "REJECTED" ? "Rejetée" : "En attente"}
                </span>
            </td>

            {/* DATE */}
            <td className="hidden xl:table-cell">
                {item.createdAt.toLocaleDateString()}
            </td>

            {/* ACTIONS */}
            <td>
                {role === "super_admin" && (
                    <div className="flex items-center gap-2">

                        <Link
                            href={`/super_admin/schools-request/${item.id}`}
                        >
                            <button
                                title="Voir la demande"
                                className="bg-blue-500 hover:bg-blue-600 text-white rounded p-2 cursor-pointer"
                            >
                                <Eye size={16} />
                            </button>
                        </Link>

                        <FormContainer
                            table="schoolRequest"
                            type="update"
                            data={item}
                        />

                        <FormContainer
                            table="schoolRequest"
                            type="delete"
                            id={item.id}
                        />

                    </div>
                )}
            </td>
        </tr>
    );

    const query: Prisma.SchoolRegistrationRequestWhereInput = {};

    if (queryParams.search) {
        query.OR = [
            {
                schoolName: {
                    contains: queryParams.search,
                    mode: "insensitive",
                },
            },
            {
                contactName: {
                    contains: queryParams.search,
                    mode: "insensitive",
                },
            },
            {
                email: {
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
        prisma.schoolRegistrationRequest.findMany({
            where: query,
            include: {
                createdSchool: true,
            },
            orderBy: {
                createdAt: "desc",
            },
            take: ITEM_PER_PAGE,
            skip: ITEM_PER_PAGE * (p - 1),
        }),

        prisma.schoolRegistrationRequest.count({
            where: query,
        }),
    ]);

    return (
        <div className="bg-white rounded-md flex-1 m-4 p-4">

            {/* HEADER */}

            <div className="flex items-center justify-between">

                <h1 className="hidden md:block text-lg font-semibold">
                    Demandes de création d'espace école
                </h1>

                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">

                    <TableSearch />

                    <div className="flex items-center gap-4 self-end">

                        <button
                            className="flex items-center gap-1 rounded-md bg-gray-100 hover:bg-gray-200 px-3 py-1.5"
                        >
                            <Filter size={16} />
                            <span className="text-sm">
                                Filtrer
                            </span>
                        </button>

                        <button
                            className="flex items-center gap-1 rounded-md bg-gray-100 hover:bg-gray-200 px-3 py-1.5"
                        >
                            <ArrowUpDown size={16} />
                            <span className="text-sm">
                                Trier
                            </span>
                        </button>

                    </div>
                </div>
            </div>

            {/* TABLE */}

            <Table<SchoolRequestList>
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

export default SchoolRequestListPage;