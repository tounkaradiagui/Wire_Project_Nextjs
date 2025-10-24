"use client";

import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { role, studentsData } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";

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

type Student = {
  id: number;
  studentId: string;
  name: string;
  email?: string;
  grade: string;
  class: string;
  phone?: string;
  photo: string;
  address: string;
};

const StudentListPage = () => {
  const renderRow = (item: Student) => (
    <tr
      key={item.id}
      className="border-b hover:bg-blue-200 even:bg-slate-50 border-t border-gray-200 border-l border-r"
    >
      <td className="flex items-center gap-4 p-4">
        <Image
          src={item.photo}
          width={40}
          height={40}
          alt=""
          className="md:hidden xl:block w-10 h-10 object-cover rounded-full"
        />
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-xs text-gray-500">{item?.class}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.studentId}</td>
      <td className="hidden md:table-cell">{item.grade}</td>
      <td className="hidden lg:table-cell">{item.phone}</td>
      <td className="hidden lg:table-cell">{item.address}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/studentss/${item.id}`}>
            <button className="bg-green-500 p-2 rounded-md w-7 h-7 flex items-center justify-center">
              <Image
                src="/view.png"
                alt="view"
                width={16}
                height={16}
                className="cursor-pointer"
              />
            </button>
          </Link>
          {role === "admin" && (
            <button className="bg-gray-600 p-2 rounded-md w-7 h-7 flex items-center justify-center">
              <Image
                src="/delete.png"
                alt="view"
                width={16}
                height={16}
                className="cursor-pointer"
              />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
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
            {role === "admin" && (
              <button className="bg-green-500 text-white w-8 h-8 items-center justify-center rounded-full flex">
                <Image
                  src="/plus.png"
                  alt="plus"
                  width={14}
                  height={14}
                  className="cursor-pointer"
                />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* List of Students */}
      <Table columns={columns} renderRow={renderRow} data={studentsData} />

      {/* Pagination */}
      <Pagination />
    </div>
  );
};
export default StudentListPage;
