import prisma from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { StatusBadge } from "@/components/cards/StatusBadge"

export default async function BulletinsIndexPage() {
  const user = await currentUser()
  if (!user) redirect("/")

  // Récupérer le profil de l'utilisateur avec les relations nécessaires     
  const profile = await prisma.userProfile.findUnique({
    where: { clerkId: user.id },
    include: {
      student: true,
      parent: { include: { students: true } },
    },
  })

  // Si pas de profil trouvé, afficher une page 404 ─
  if (!profile) notFound()

  // Récupérer les studentIds selon le rôle
  let studentIds: string[] = []

  // STUDENT → son propre ID
  // PARENT → les IDs de tous ses enfants
  // ADMIN/TEACHER → redirection vers une page dédiée (pas de bulletins à afficher)
  if (profile.role === "STUDENT" && profile.student) {
    studentIds = [profile.student.id]
  } else if (profile.role === "PARENT" && profile.parent) {
    studentIds = profile.parent.students.map((s) => s.id)
  } else {
    // ADMIN, SUPER_ADMIN, TEACHER → page dédiée
    redirect("/report-cards")
  }

  // Récupérer les bulletins publiés
  const reportCards = await prisma.reportCard.findMany({
    where: {
      studentId: { in: studentIds },
      status: "PUBLISHED",
    },
    include: {
      student: true,
      term: { include: { schoolYear: true } },
      class: true,
    },
    orderBy: [
      { term: { schoolYear: { name: "desc" } } },
      { term: { order: "asc" } },
    ],
  })

  // Grouper par élève
  const grouped = studentIds.map((sid) => {
    const studentCards = reportCards.filter((r) => r.studentId === sid)
    const student = studentCards[0]?.student ?? null
    return { student, reportCards: studentCards }
  })

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Mes Bulletins</h1>

      {grouped.map(({ student, reportCards }) => {
        if (!student) return null
        return (
          <div key={student.id} className="space-y-3">
            {profile.role === "PARENT" && (
              <h2 className="text-base font-semibold text-gray-700 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-gray-200 flex items-center
                                 justify-center text-xs font-bold text-gray-600">
                  {student.name[0]}{student.surname[0]}
                </span>
                {student.surname} {student.name}
              </h2>
            )}

            {reportCards.length === 0 ? (
              <p className="text-sm text-gray-400 pl-2">
                Aucun bulletin publié pour le moment.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {reportCards.map((rc) => {
                  const ordinal = ["", "1er", "2ème", "3ème"][rc.term.order]
                  return (
                    <Link
                      key={rc.id}
                      href={`/bulletins/${rc.id}`}
                      className="border border-gray-200 rounded-xl p-4 hover:border-gray-400
                                 hover:shadow-sm transition-all group space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-gray-900 group-hover:text-black">
                            {ordinal} Trimestre
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {rc.term.schoolYear.name} · {rc.class.name}
                          </p>
                        </div>
                        <StatusBadge status={rc.status as any} />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-gray-900">
                            {rc.generalAverage.toFixed(2)}
                            <span className="text-sm font-normal text-gray-400"> /20</span>
                          </p>
                          <p className="text-xs text-gray-400">
                            Rang {rc.rank}e / {rc.totalStudents}
                          </p>
                        </div>
                        <span className="text-xs text-gray-400 group-hover:text-gray-600
                                         transition-colors">
                          Voir →
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}