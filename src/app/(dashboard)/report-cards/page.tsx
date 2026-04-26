import prisma from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"

export default async function ReportCardsListPage() {
  const clerkUser = await currentUser()
  if (!clerkUser) redirect("/")

  // Récupérer le profil de l'utilisateur connecté
  const userProfile = await prisma.userProfile.findUnique({
    where: { clerkId: clerkUser.id },
    include: {
      teacher: { include: { teacherClasses: true } },
    },
  })

  if (!userProfile) notFound()

  // STUDENT et PARENT → redirige vers /bulletins
  if (userProfile.role === "STUDENT" || userProfile.role === "PARENT") {
    redirect("/bulletins")
  }

  // Récupérer les trimestres actifs
  const terms = await prisma.term.findMany({
    include: { schoolYear: true },
    orderBy: [
      { schoolYear: { id: "desc" } },
      { order: "asc" },
    ],
  })

  // Récupérer les classes
  // Teacher → seulement ses classes, Admin → toutes
  const classes = await prisma.class.findMany({
    where:
      userProfile.role === "TEACHER" && userProfile.teacher
        ? {
          teacherClasses: {
            some: { teacherId: userProfile.teacher.id },
          },
        }
        : undefined,
    include: {
      grade: true,
      _count: { select: { students: true } },
    },
    orderBy: { name: "asc" },
  })

  // Récupérer les stats de bulletins par classe+terme
  const reportCardStats = await prisma.reportCard.groupBy({
    by: ["classId", "termId", "status"],
    _count: { id: true },
  })

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bulletins scolaires</h1>
        <p className="text-sm text-gray-500 mt-1">
          Sélectionnez une classe et un trimestre pour gérer les bulletins
        </p>
      </div>

      {terms.map((term) => {
        const ordinal = ["", "1er", "2ème", "3ème"][term.order] ?? `${term.order}ème`

        return (
          <div key={term.id} className="space-y-3">
            {/* Header trimestre */}
            <div className="flex items-center gap-3">
              <h2 className="text-base font-semibold text-gray-700">
                {ordinal} Trimestre — {term.schoolYear.name}
              </h2>
              {term.isClosed && (
                <span className="text-xs bg-orange-100 text-orange-600
                                 px-2 py-0.5 rounded-full font-medium">
                  Clôturé
                </span>
              )}
            </div>

            {/* Grille des classes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {classes.map((cls) => {
                // Stats pour cette classe + ce trimestre
                const stats = reportCardStats.filter(
                  (s) => s.classId === cls.id && s.termId === term.id
                )

                const countByStatus = {
                  GENERATED: stats.find((s) => s.status === "GENERATED")?._count.id ?? 0,
                  VALIDATED: stats.find((s) => s.status === "VALIDATED")?._count.id ?? 0,
                  PUBLISHED: stats.find((s) => s.status === "PUBLISHED")?._count.id ?? 0,
                }

                // Calcul du total de bulletins générés (tous statuts confondus) pour cette classe+trimestre, et vérification si tous sont publiés
                const totalGenerated =
                  countByStatus.GENERATED +
                  countByStatus.VALIDATED +
                  countByStatus.PUBLISHED

                // Si le professeur n'a pas de bulletins générés pour cette classe+trimestre, on affiche "0 généré" et pas de barre de progression. Si des bulletins sont générés, 
                // on affiche la barre de progression même si aucun n'est publié (dans ce cas la barre sera à 0% et il y aura une étiquette "0 publié")
                const allPublished =
                  totalGenerated > 0 &&
                  countByStatus.PUBLISHED === cls._count.students

                return (
                  <Link
                    key={cls.id}
                    href={`/report-cards/${cls.id}/${term.id}`}
                    className="group block rounded-xl border border-gray-200
                               hover:border-gray-900 hover:shadow-sm
                               transition-all p-4 bg-white space-y-3"
                  >
                    {/* Classe + Grade */}
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900 group-hover:underline">
                          {cls.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {cls.grade.name} · {cls._count.students} élèves
                        </p>
                      </div>
                      {allPublished && (
                        <span className="text-xs bg-green-100 text-green-700
                                         px-2 py-0.5 rounded-full font-medium">
                          ✓ Publié
                        </span>
                      )}
                    </div>

                    {/* Barre de progression */}
                    {cls._count.students > 0 && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>{totalGenerated} / {cls._count.students} bulletins</span>
                          <span>{countByStatus.PUBLISHED} publiés</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full transition-all"
                            style={{
                              width: `${cls._count.students > 0
                                ? (countByStatus.PUBLISHED / cls._count.students) * 100
                                : 0
                                }%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Statuts détaillés */}
                    <div className="flex gap-2 flex-wrap">
                      {countByStatus.GENERATED > 0 && (
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                          {countByStatus.GENERATED} générés
                        </span>
                      )}
                      {countByStatus.VALIDATED > 0 && (
                        <span className="text-xs bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded">
                          {countByStatus.VALIDATED} validés
                        </span>
                      )}
                      {countByStatus.PUBLISHED > 0 && (
                        <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded">
                          {countByStatus.PUBLISHED} publiés
                        </span>
                      )}
                      {totalGenerated === 0 && (
                        <span className="text-xs text-gray-300">
                          Aucun bulletin généré
                        </span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )
      })}

      {classes.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-200 py-16
                        text-center text-sm text-gray-400">
          Aucune classe disponible.
        </div>
      )}
    </div>
  )
}