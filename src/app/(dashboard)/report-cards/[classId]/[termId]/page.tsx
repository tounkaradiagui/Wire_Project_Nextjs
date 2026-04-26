import prisma from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"
import { notFound, redirect } from "next/navigation"
import { ReportCardHeader } from "@/components/cards/ReportCardHeader"
import { ReportCardTable } from "@/components/cards/ReportCardTable"

type Props = {
  params: Promise<{ classId: string; termId: string }>
  searchParams: Promise<{ status?: string }>
}

export default async function ReportCardsPage({ params, searchParams }: Props) {
  const { classId: classIdStr, termId: termIdStr } = await params
  const { status: statusFilter = "ALL" } = await searchParams

  // Recuperer le profil utilisateur
  const user = await currentUser()
  if (!user) redirect("/")

  const profile = await prisma.userProfile.findUnique({
    where: { clerkId: user.id },
  })

  // Constants pour les stats
  const classId = Number(classIdStr)
  const termId = Number(termIdStr)

  if (isNaN(classId) || isNaN(termId)) notFound()

  // 1. Récupérer la classe + le trimestre
  const [cls, term] = await Promise.all([
    prisma.class.findUnique({
      where: { id: classId },
      include: { grade: true },
    }),
    prisma.term.findUnique({
      where: { id: termId },
      include: { schoolYear: true },
    }),
  ])

  if (!cls || !term) notFound()

  // 2. Récupérer tous les élèves de la classe
  const students = await prisma.student.findMany({
    where: { classId, isDeleted: false },
    orderBy: { surname: "asc" },
  })

  // 3. Récupérer les bulletins existants pour ce trimestre
  const reportCards = await prisma.reportCard.findMany({
    where: { classId, termId },
    select: {
      id: true,
      studentId: true,
      status: true,
      generalAverage: true,
      rank: true,
      generatedAt: true,
      publishedAt: true,
    },
  })

  // 4. Merger élèves + bulletins
  const reportCardMap = new Map(reportCards.map((rc) => [rc.studentId, rc]))

  const rows = students.map((student) => ({
    student,
    reportCard: reportCardMap.get(student.id) ?? null,
  }))

  // 5. Stats globales pour le header
  const stats = {
    total: students.length,
    generated: reportCards.filter((r) => r.status === "GENERATED").length,
    validated: reportCards.filter((r) => r.status === "VALIDATED").length,
    published: reportCards.filter((r) => r.status === "PUBLISHED").length,
  }

  // 6. Filtre par statut (depuis searchParams)
  const filteredRows =
    statusFilter === "ALL"
      ? rows
      : rows.filter((r) =>
        statusFilter === "PENDING"
          ? r.reportCard === null
          : r.reportCard?.status === statusFilter
      )

  return (
    <div className="p-6 space-y-6">
      <ReportCardHeader
        cls={cls}
        term={term}
        classId={classId}
        termId={termId}
        stats={stats}
        termClosed={term.isClosed}
      />
      <ReportCardTable
        rows={filteredRows}
        classId={classId}
        termId={termId}
        currentFilter={statusFilter}
        role={profile?.role ?? "ADMIN"}
      />
    </div>
  )
}