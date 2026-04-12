import prisma from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"
import { notFound, redirect } from "next/navigation"
import { AppreciationForm } from "@/components/forms/AppreciationForm"

type Props = {
  params: Promise<{ classId: string; termId: string }>
}

export default async function AppreciationsPage({ params }: Props) {
  const { classId: classIdStr, termId: termIdStr } = await params
  const classId = Number(classIdStr)
  const termId  = Number(termIdStr)

  const user = await currentUser()
  if (!user) redirect("/")

  const profile = await prisma.userProfile.findUnique({
    where: { clerkId: user.id },
    include: { teacher: true },
  })

  if (!profile || profile.role !== "TEACHER" || !profile.teacher) {
    notFound()
  }

  const teacherId = profile.teacher.id

  // Récupérer les SubjectReports de ce prof pour cette classe + trimestre
  const subjectReports = await prisma.subjectReport.findMany({
    where: {
      teacherId,
      reportCard: { classId, termId },
    },
    include: {
      subject: true,
      reportCard: {
        include: { student: true },
      },
    },
    orderBy: [
      { reportCard: { student: { surname: "asc" } } },
      { subject: { name: "asc" } },
    ],
  })

  // Grouper par matière
  const bySubject = new Map<string, typeof subjectReports>()
  subjectReports.forEach((sr) => {
    const key = sr.subject.name
    if (!bySubject.has(key)) bySubject.set(key, [])
    bySubject.get(key)!.push(sr)
  })

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Appréciations par matière
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Saisissez vos appréciations pour chaque élève
        </p>
      </div>

      {[...bySubject.entries()].map(([subjectName, reports]) => (
        <div key={subjectName} className="space-y-3">
          <h2 className="text-base font-semibold text-gray-800 uppercase
                         tracking-wide border-b border-gray-200 pb-2">
            {subjectName}
          </h2>

          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    Élève
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">
                    Moyenne
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    Appréciation
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reports.map((sr) => (
                  <tr key={sr.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {sr.reportCard.student.surname}{" "}
                      {sr.reportCard.student.name}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-bold ${
                        sr.finalAverage < 10 ? "text-red-500" : "text-gray-900"
                      }`}>
                        {sr.finalAverage.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <AppreciationForm
                        subjectReportId={sr.id}
                        initialValue={sr.appreciation ?? ""}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}