"use server";
import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import FormContainer from "@/components/FormContainer";
import Performance from "@/components/Performance";
import StudentAttendanceCard from "@/components/StudentAttendanceCard";
import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation"
import { auth } from "@clerk/nextjs/server";
import { Suspense } from "react"

const StudentDetailPage = async (props: {
  params: Promise<{ id: string }>;
}) => {

  const { id } = await props.params;

  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      grade: true,
      class: {
        include: {
          _count: { select: { lessons: true } },
        },
      },
    },
  });

  if (!student) {
    return notFound();
  }

  return (
    <div className="flex-1 p-4 flex flex-col xl:flex-row gap-4">
      {/* Left */}
      <div className="w-full xl:w-2/3">
        {/* Top */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* User card infos */}
          <div className="bg-blue-300 py-6 px-4 rounded-md flex-1 flex gap-4">
            <div className="w-1/3">
              <Image
                src={student.image || "/noAvatar.png"}
                alt=""
                width={144}
                height={144}
                className="w-36 h-36 rounded-full object-cover"
              />
            </div>
            <div className="w-2/3 flex flex-col justify-between gap-4">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">{student.name + " " + student.surname}</h1>
                {/* Update user infos */}
                {role === "admin" && (<FormContainer
                  table="student"
                  type="update"
                  data={student}
                />)}
              </div>
              <p className="text-sm text-gray-500">
                Élève en {student.class.name}, avec un taux de présence de 86%.
              </p>
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/blood.png" alt="" width={14} height={14} />
                  <span>{student.bloodType}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/date.png" alt="" width={14} height={14} />
                  <span>
                    {student.birthday
                      ? new Intl.DateTimeFormat("fr-FR").format(student.birthday)
                      : "Date non renseignée"}
                    {/* {new Intl.DateTimeFormat("fr-FR").format(student.birthday)} */}
                  </span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/mail.png" alt="" width={14} height={14} />
                  <span>{student.email || "-"}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/phone.png" alt="" width={14} height={14} />
                  <span>{student.phone || "-"}</span>
                </div>
              </div>
            </div>
          </div>
          {/* Small card */}
          <div className="flex-1 flex flex-wrap gap-4 justify-between">
            {/* Présence */}
            <div className="flex items-center gap-4 bg-blue-500 text-white p-5 rounded-2xl shadow-md flex-1 min-w-45 transition-transform hover:scale-105">
              <div className="bg-white/20 p-3 rounded-xl">
                <Image
                  src="/singleAttendance.png"
                  alt="Présence"
                  width={28}
                  height={28}
                  className="w-7 h-7"
                />
                <Suspense fallback="loading...">
                  <StudentAttendanceCard id={student.id} />
                </Suspense>
              </div>
            </div>

            {/* Matières */}
            <div className="flex items-center gap-4 bg-yellow-400 text-white p-5 rounded-2xl shadow-md flex-1 min-w-45 transition-transform hover:scale-105">
              <div className="bg-white/20 p-3 rounded-xl">
                <Image
                  src="/singleBranch.png"
                  alt="Matières"
                  width={28}
                  height={28}
                  className="w-7 h-7"
                />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">{student.grade.level}</h1>
                <span className="text-sm opacity-90">Niveau</span>
              </div>
            </div>

            {/* Leçons */}
            <div className="flex items-center gap-4 bg-purple-500 text-white p-5 rounded-2xl shadow-md flex-1 min-w-45 transition-transform hover:scale-105">
              <div className="bg-white/20 p-3 rounded-xl">
                <Image
                  src="/singleLesson.png"
                  alt="Leçons"
                  width={28}
                  height={28}
                  className="w-7 h-7"
                />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">{student.class._count.lessons}</h1>
                <span className="text-sm opacity-90">Cours</span>
              </div>
            </div>

            {/* Classes */}
            <div className="flex items-center gap-4 bg-green-500 text-white p-5 rounded-2xl shadow-md flex-1 min-w-45 transition-transform hover:scale-105">
              <div className="bg-white/20 p-3 rounded-xl">
                <Image
                  src="/singleClass.png"
                  alt="Classes"
                  width={28}
                  height={28}
                  className="w-7 h-7"
                />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">{student.class.name}</h1>
                <span className="text-sm opacity-90">Classe</span>
              </div>
            </div>
          </div>
        </div>
        {/* Bottom */}
        <div className="mt-4 bg-white p-4 rounded-md shadow-md h-200 teacher-calendar-container">
          <h1>Emploi du temps</h1>
          <BigCalendarContainer type="classId" id={student.class.id} />
        </div>
      </div>
      {/* Right */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <div className="bg-white p-4 rounded-md">
          {/* Shortcuts */}
          <h2 className="text-xl font-semibold mb-4">Raccourcis</h2>
          <div className="mt-4 gap-4 flex flex-wrap text-xs text-gray-700">
            <Link href={`/list/lessons?classId=${student.class.id}`} className="hover:scale-105 transition-transform p-3 rounded-md bg-amber-200">
              Leçons
            </Link>
            <Link href={`/list/subjects?classId=${student.class.id}`} className="hover:scale-105 transition-transform p-3 rounded-md bg-lime-200">
              Matières
            </Link>
            <Link
              href={`/list/teachers?classId=${student.class.id}`}
              className="p-3 rounded-md bg-cyan-200 hover:scale-105 transition-transform"
            >
              Enseignants
            </Link>
            <Link href={`/list/assignments?classId=${student.class.id}`} className="hover:scale-105 transition-transform p-3 rounded-md bg-rose-200">
              Devoirs
            </Link>
            <Link href={`/list/results?studentId=${student.id}`} className="hover:scale-105 transition-transform p-3 rounded-md bg-violet-200">
              Résultats
            </Link>
            <Link href={`/list/exams?classId=${student.class.id}`} className="hover:scale-105 transition-transformp-3 p-3 rounded-md bg-rose-200">
              Examens
            </Link>
          </div>
        </div>
        {/* Teacher performance */}
        <Performance isAnimationActive={true} />
        {/* Announcement */}
        <Announcements />
      </div>
    </div>
  );
};

export default StudentDetailPage;
