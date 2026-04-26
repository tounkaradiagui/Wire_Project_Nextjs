import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import FormContainer from "@/components/FormContainer";
import Performance from "@/components/Performance";
import Image from "next/image";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation"
import { auth } from "@clerk/nextjs/server";

type TeacherWithCount = Prisma.TeacherGetPayload<{
  include: {
    _count: {
      select: {
        subjects: true;
        lessons: true;
        teacherClasses: true;
      };
    };
  };
}>;

const TeacherDetailPage = async (props: {
  params: Promise<{ id: string }>;
}) => {

  const { id } = await props.params;

  const teacher: TeacherWithCount | null =
    await prisma.teacher.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            subjects: true,
            lessons: true,
            teacherClasses: true
          },
        },
      },
    });

  if (!teacher) {
    return notFound();
  }

  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

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
                src={teacher.image || "/noAvatar.png"}
                alt=""
                width={144}
                height={144}
                className="w-36 h-36 rounded-full object-cover"
              />
            </div>
            <div className="w-2/3 flex flex-col justify-between gap-4">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">{teacher.name + " " + teacher.surname}</h1>
                {/* Update user infos */}
                {role === "admin" && (<FormContainer
                  table="teacher"
                  type="update"
                  data={teacher}
                />)}
              </div>
              <p className="text-sm text-gray-500">
                Enseignant de mathématiques avec plus de 10 ans d'expérience
                dans l'enseignement secondaire. Passionné par la pédagogie et
                l'innovation éducative.
              </p>
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/blood.png" alt="" width={14} height={14} />
                  <span>{teacher.bloodType}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/date.png" alt="" width={14} height={14} />
                  <span>{teacher?.birthday && (
                    <span>
                      {new Intl.DateTimeFormat("fr-FR").format(teacher.birthday)}
                    </span>
                  )}
                  </span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/mail.png" alt="" width={14} height={14} />
                  <span>{teacher.email || "-"}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/phone.png" alt="" width={14} height={14} />
                  <span>{teacher.phone || "-"}</span>
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
              </div>
              <div>
                <h1 className="text-2xl font-semibold">90%</h1>
                <span className="text-sm opacity-90">Présence</span>
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
                <h1 className="text-2xl font-semibold">{teacher._count.subjects}</h1>
                <span className="text-sm opacity-90">Matières enseignées</span>
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
                <h1 className="text-2xl font-semibold">{teacher._count.lessons}</h1>
                <span className="text-sm opacity-90">Leçons données</span>
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
                <h1 className="text-2xl font-semibold">{teacher._count.teacherClasses}</h1>
                <span className="text-sm opacity-90">Classes assignées</span>
              </div>
            </div>
          </div>
        </div>
        {/* Bottom */}
        <div className="mt-4 bg-white p-4 rounded-md shadow-md h-200 teacher-calendar-container">
          <h1>Programme de l'Enseignant</h1>
          <BigCalendarContainer type="teacherId" id={teacher.id} />
        </div>
      </div>
      {/* Right */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <div className="bg-white p-4 rounded-md">
          {/* Shortcuts */}
          <h2 className="text-xl font-semibold mb-4">Raccourcis</h2>
          <div className="mt-4 gap-4 flex flex-wrap text-xs text-gray-700">
            <Link
              href={`/list/classes?teacherId=${teacher.id}`}
              className="p-3 rounded-md bg-amber-200"
            >
              Classes
            </Link>
            <Link href={`/list/subjects?teacherId=${teacher.id}`} className="p-3 rounded-md bg-lime-200">
              Matières
            </Link>
            <Link href={`/list/exams?teacherId=${teacher.id}`} className="p-3 rounded-md bg-lime-200">
              Examens
            </Link>
            <Link href={`/list/assignments?teacherId=${teacher.id}`} className="p-3 rounded-md bg-lime-200">
              Devoirs
            </Link>
            <Link href={`/list/lessons?teacherId=${teacher.id}`} className="p-3 rounded-md bg-cyan-200">
              Leçons
            </Link>
            <Link href={`/list/attendances?teacherId=${teacher.id}`} className="p-3 rounded-md bg-pink-200">
              Présence
            </Link>
            <Link
              href={`/list/students?teacherId=${teacher.id}`}
              className="p-3 rounded-md bg-violet-200"
            >
              Elèves
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

export default TeacherDetailPage;
