import Announcements from "@/components/Announcements";
import EventCalendar from "@/components/EventCalendar";
import BigCalendar from "@/components/BigCalendar";
import { getParentStudents } from "@/lib/actions";
import Image from "next/image";
import Link from "next/link";


const ParentPage = async () => {
  const students = await getParentStudents();

  if (!Array.isArray(students)) {
    return (
      <div className="p-4">
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          {students.error || "Impossible de charger les enfants"}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-4 flex gap-4 flex-col xl:flex-row">
      {/* Left */}
      <div className="w-full xl:w-2/3 flex flex-col gap-8 teacher-calendar-container">
        <div className="h-full bg-gray-200 p-4 rounded-md">
          <div className="p-4 flex flex-col gap-6">
            <h1 className="text-xl font-semibold">Mes enfants</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="bg-white p-4 rounded-md shadow-sm flex gap-4"
                >
                  <Image
                    src={student.image || "/avatar.png"}
                    alt={student.name}
                    width={64}
                    height={64}
                    className="rounded-full object-cover"
                  />

                  <div className="flex flex-col flex-1">
                    <h2 className="font-semibold">
                      {student.name} {student.surname}
                    </h2>
                    <p className="text-sm text-gray-600">
                      Classe : {student.class.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Niveau : {student.grade.level}
                    </p>

                    <div className="flex gap-2 mt-3 flex-wrap">
                      <Link href={`/parent/children/${student.id}/absences`} className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded">
                        Absences
                      </Link>
                      <Link href={`/parent/children/${student.id}/results`} className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded">
                        Notes
                      </Link>
                      <Link href={`/parent/children/${student.id}/assignments`} className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded">
                        Devoirs
                      </Link>
                      <Link href={`/parent/children/${student.id}/exams`} className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded">
                        Trimestres
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* Right */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <Announcements />
      </div>
    </div>
  );
};

export default ParentPage;
