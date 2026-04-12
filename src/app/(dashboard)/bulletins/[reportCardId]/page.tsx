import prisma from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"
import { notFound, redirect } from "next/navigation"
import { BulletinView } from "@/components/cards/BulletinView"
import { DownloadPdfButton } from "@/components/cards/DownloadPdfButton"
import { getTermAverages } from "@/lib/actions/report-cards"
import Link from "next/link"

type Props = {
  params: Promise<{ reportCardId: string }>
}

export default async function BulletinDetailPage({ params }: Props) {
  const { reportCardId: reportCardIdStr } = await params
  const reportCardId = Number(reportCardIdStr)

  const user = await currentUser()
  if (!user) redirect("/")

  if (isNaN(reportCardId)) notFound()

  const profile = await prisma.userProfile.findUnique({
    where: { clerkId: user.id },
    include: {
      student: true,
      parent: { include: { students: true } },
      teacher: { include: { teacherClasses: true } },
    },
  })

  if (!profile) notFound()

  const reportCard = await prisma.reportCard.findUnique({
    where: { id: reportCardId },
    include: {
      student: true,
      class: true,
      term: { include: { schoolYear: true } },
      subjectReports: {
        include: {
          subject: true,
          teacher: true,
        },
        orderBy: { subject: { name: "asc" } },
      },
    },
  })

  if (!reportCard) notFound()

  // ── Guards d'accès ──
  const isAdmin =
    profile.role === "ADMIN" || profile.role === "SUPER_ADMIN"

  const isOwnerStudent =
    profile.role === "STUDENT" &&
    profile.student?.id === reportCard.studentId

  const isParentOfStudent =
    profile.role === "PARENT" &&
    profile.parent?.students.some((s) => s.id === reportCard.studentId)

  const isTeacherOfClass =
    profile.role === "TEACHER" &&
    profile.teacher?.teacherClasses.some(
      (tc) => tc.classId === reportCard.classId
    )

  if (!isAdmin && !isOwnerStudent && !isParentOfStudent && !isTeacherOfClass) {
    notFound()
  }

  // ── Bulletin non publié → seul l'admin peut voir ──
  if (reportCard.status !== "PUBLISHED" && !isAdmin) {
    return (
      <div className="p-6 text-center space-y-2">
        <p className="text-gray-500 font-medium">
          Ce bulletin n'est pas encore disponible.
        </p>
        <p className="text-sm text-gray-400">
          Il sera visible dès qu'il sera publié par l'établissement.
        </p>
      </div>
    )
  }

  const termAverages = await getTermAverages(
    reportCard.studentId,
    reportCard.term.schoolYearId
  )

  // Dans bulletins/[reportCardId]/page.tsx

  const data = {
    generalAverage: reportCard.generalAverage,
    totalCoefficients: reportCard.totalCoefficients ?? 0,
    totalPoints: reportCard.totalPoints ?? 0,
    rank: reportCard.rank,
    totalStudents: reportCard.totalStudents,
    classHighest: reportCard.classHighest,
    classAverage: reportCard.classAverage,
    classLowest: reportCard.classLowest,
    appreciation: reportCard.appreciation,
    decision: reportCard.decision,
    student: {
      name: reportCard.student.name,
      surname: reportCard.student.surname,
      cardNumber: reportCard.student.cardNumber,
      sex: reportCard.student.sex,
      birthday: reportCard.student.birthday,
    },
    class: { name: reportCard.class.name },
    term: {
      name: reportCard.term.name,
      order: reportCard.term.order,
      schoolYear: { name: reportCard.term.schoolYear.name },
    },
    subjectReports: reportCard.subjectReports.map((sr) => ({
      id: sr.id,
      coefficient: sr.coefficient,
      classAverage: sr.classAverage,
      assignmentScore: sr.assignmentScore,
      examScore: sr.examScore,
      continuousScore: sr.continuousScore,
      finalAverage: sr.finalAverage,
      product: sr.product,        // number | null → OK
      appreciation: sr.appreciation,
      subject: { name: sr.subject.name },
      teacher: { name: sr.teacher.name, surname: sr.teacher.surname },
    })),
    termAverages,
  }
  //const data = { ...reportCard, termAverages }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        {/* Retour adapté selon le rôle */}
        <Link
          href={isAdmin ? `/report-cards/${reportCard.classId}/${reportCard.termId}` : "/bulletins"}
          className="text-sm text-gray-500 hover:text-gray-800 transition-colors
                     flex items-center gap-1"
        >
          ← Retour
        </Link>

        <DownloadPdfButton reportCardId={reportCardId} />
      </div>

      <BulletinView data={data} />
    </div>
  )
}