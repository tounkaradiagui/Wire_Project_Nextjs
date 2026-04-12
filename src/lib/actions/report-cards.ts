"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { ReportCardStatus } from "@prisma/client"

// TYPES

type SubjectReportInput = {
  subjectId: number
  teacherId: string
  coefficient: number
  classAverage: number | null
  examScore: number | null
  assignmentScore: number | null
  continuousScore: number | null
  finalAverage: number
  product: number
  appreciation?: string | null
}

// HELPERS

function avg(scores: number[]): number | null {
  if (!scores.length) return null
  return scores.reduce((a, b) => a + b, 0) / scores.length
}

// GÉNÉRER LES BULLETINS D'UNE CLASSE
// 
export async function generateReportCards(
    classId: number,
    termId: number
    ): Promise<{ success: boolean; message: string; count?: number }> {
  try {
    // 1. Récupérer les élèves de la classe
    const students = await prisma.student.findMany({
      where: { classId, isDeleted: false },
    })

    if (!students.length) {
      return { success: false, message: "Aucun élève dans cette classe." }
    }

    // 2. Récupérer le trimestre + schoolYear
    const term = await prisma.term.findUniqueOrThrow({
      where: { id: termId },
    })

    // 3. Récupérer toutes les matières avec coefficient
    const subjects = await prisma.subject.findMany({
      where: { isDeleted: false },
      include: {
        teachers: {
          include: { teacher: true },
        },
      },
    })

    // 4. Récupérer tous les résultats de la classe pour ce trimestre en 1 requête
    const allResults = await prisma.result.findMany({
      where: {
        termId,
        isDeleted: false,
        student: { classId },
      },
    })

    // 5. Pour chaque élève → calculer et upsert
    const upsertPromises = students.map(async (student) => {
      const studentResults = allResults.filter(
        (r) => r.studentId === student.id
      )

      // Calculer les SubjectReports
      const subjectReports: SubjectReportInput[] = subjects
        .map((subject) => {
          const subjectResults = studentResults.filter(
            (r) => r.subjectId === subject.id
          )

          const examScore = avg(
            subjectResults.filter((r) => r.examId !== null).map((r) => r.score)
          )

          const assignmentScores = subjectResults
            .filter((r) => r.assignmentId !== null)
            .map((r) => r.score)

          const continuousScore = avg(assignmentScores)  // même calcul
          const assignmentScore = continuousScore

          // const continuousScore = avg(
          //   subjectResults
          //     .filter((r) => r.assignmentId !== null)
          //     .map((r) => r.score)
          // )

          // Règle : si les deux existent → (exam + continuous) / 2
          const finalAverage =
            examScore !== null && continuousScore !== null
              ? (examScore + continuousScore) / 2
              : examScore ?? continuousScore ?? 0

          // const product = finalAverage * subject.coefficient

          // ✅ Après — fallback à 1 si coefficient null
          const coef = subject.coefficient ?? 1
          const product = finalAverage * coef

          // Trouver le teacher principal de la matière
          const teacherId = subject.teachers[0]?.teacherId ?? null

          if (!teacherId) return null

          if (coef === 0) return null

          return {
            subjectId: subject.id,
            teacherId,
            coefficient: coef,
            classAverage: null,                   
            examScore,
            continuousScore,
            assignmentScore,
            finalAverage,
            product,
            appreciation: null,
          } satisfies SubjectReportInput
        })
        .filter(Boolean) as SubjectReportInput[]

      const totalCoefficients = subjectReports.reduce(
        (a, s) => a + s.coefficient,
        0
      )
      const totalPoints = subjectReports.reduce((a, s) => a + s.product, 0)
      const generalAverage =
        totalCoefficients > 0 ? totalPoints / totalCoefficients : 0

      const createSubjectReports = subjectReports.map((sr) => ({
        coefficient:      sr.coefficient,
        classAverage:     sr.classAverage,
        examScore:        sr.examScore,
        continuousScore:  sr.continuousScore,
        assignmentScore:  sr.assignmentScore,
        finalAverage:     sr.finalAverage,
        product:          sr.product,
        appreciation:     sr.appreciation ?? null,
        subject:  { connect: { id: sr.subjectId } },
        teacher:  { connect: { id: sr.teacherId } },
      }))

      // Upsert ReportCard
      await prisma.reportCard.upsert({
        where: {
          studentId_termId: { studentId: student.id, termId },
        },
        create: {
          student:      { connect: { id: student.id } },
          class:        { connect: { id: classId } },
          term:         { connect: { id: termId } },
          schoolYear:   { connect: { id: term.schoolYearId } },
          totalCoefficients,
          totalPoints,
          generalAverage,
          totalStudents: students.length,
          rank: 0,
          status: "GENERATED",
          generatedAt: new Date(),
          subjectReports: { create: createSubjectReports },
        },
        update: {
          totalCoefficients,
          totalPoints,
          generalAverage,
          totalStudents: students.length,
          status: "GENERATED",
          generatedAt: new Date(),
          subjectReports: {
            deleteMany: {},
            create: createSubjectReports,
          },
        },
      })
      
    })

    await Promise.all(upsertPromises)

    // 6. Calculer rangs + stats classe + classAverage par matière
    await computeRanksAndClassStats(classId, termId)

    revalidatePath(`/(dashboardsss)/report-cards/${classId}/${termId}`)

    return {
      success: true,
      message: `${students.length} bulletins générés avec succès.`,
      count: students.length,
    }
  } catch (error) {
    console.error("[generateReportCards]", error)
    return { success: false, message: "Erreur lors de la génération." }
  }
}


// CALCULER RANGS + STATS CLASSE

async function computeRanksAndClassStats(classId: number, termId: number) {
  const reportCards = await prisma.reportCard.findMany({
    where: { classId, termId },
    include: { subjectReports: true },
    orderBy: { generalAverage: "desc" },
  })

  const averages = reportCards.map((report) => report.generalAverage)
  const classHighest = Math.max(...averages)
  const classLowest = Math.min(...averages)
  const classAverage = averages.reduce((a, b) => a + b, 0) / averages.length

  // Calculer classAverage par matière (moyenne de la matière dans la classe)
  const subjectMap = new Map<number, number[]>()

  for (const rc of reportCards) {
    for (const sr of rc.subjectReports) {
      if (!subjectMap.has(sr.subjectId)) subjectMap.set(sr.subjectId, [])
      subjectMap.get(sr.subjectId)!.push(sr.finalAverage)
    }
  }

  await Promise.all(
    reportCards.map((rc, index) =>
      prisma.reportCard.update({
        where: { id: rc.id },
        data: {
          rank: index + 1,
          classHighest,
          classLowest,
          classAverage,
          subjectReports: {
            updateMany: rc.subjectReports.map((sr) => ({
              where: { id: sr.id },
              data: {
                classAverage: avg(subjectMap.get(sr.subjectId) ?? []),
              },
            })),
          },
        },
      })
    )
  )
}

// VALIDER LES BULLETINS (VALIDATED)

export async function validateReportCards(
    classId: number,
    termId: number
    ): Promise<{ success: boolean; message: string }> {
    try {
        await prisma.reportCard.updateMany({
        where: { classId, termId, status: ReportCardStatus.GENERATED },
        data: { status: ReportCardStatus.VALIDATED },
        })

        revalidatePath(`/admin/report-cards/${classId}/${termId}`)
        return { success: true, message: "Bulletins validés." }
    } catch (error) {
        console.error("[validateReportCards]", error)
        return { success: false, message: "Erreur lors de la validation." }
    }
}

// PUBLIER LES BULLETINS (PUBLISHED)

export async function publishReportCards(
  classId: number,
  termId: number
): Promise<{ success: boolean; message: string }> {
  try {
    await prisma.reportCard.updateMany({
      where: { classId, termId, status: ReportCardStatus.VALIDATED },
      data: {
        status: ReportCardStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    })

    revalidatePath(`/admin/report-cards/${classId}/${termId}`)
    return { success: true, message: "Bulletins publiés." }
  } catch (error) {
    console.error("[publishReportCards]", error)
    return { success: false, message: "Erreur lors de la publication." }
  }
}


// RÉCUPÉRER UN BULLETIN COMPLET (pour PDF)

export async function getReportCardById(reportCardId: number) {
  return prisma.reportCard.findUniqueOrThrow({
    where: { id: reportCardId },
    include: {
      student: true,
      class: true,
      term: {
        include: { schoolYear: true },
      },
      subjectReports: {
        include: {
          subject: true,
          teacher: true,
        },
        orderBy: { subject: { name: "asc" } },
      },
    },
  })
}

// RÉCUPÉRER LES MOYENNES DES AUTRES TRIMESTRES

export async function getTermAverages(
  studentId: string,
  schoolYearId: number
): Promise<{ termOrder: number; average: number | null }[]> {
  const reportCards = await prisma.reportCard.findMany({
    where: {
      studentId,
      schoolYearId,
      status: { in: [ReportCardStatus.VALIDATED, ReportCardStatus.PUBLISHED] },
    },
    include: { term: true },
    orderBy: { term: { order: "asc" } },
  })

  return [1, 2, 3].map((order) => {
    const rc = reportCards.find((r) => r.term.order === order)
    return { termOrder: order, average: rc?.generalAverage ?? null }
  })
}


// Enseignants — ajouter les appréciations par matière
export async function updateSubjectAppreciation(
  subjectReportId: number,
  appreciation: string,
): Promise<{ success: boolean; message: string }> {
  try {
    await prisma.subjectReport.update({
      where: { id: subjectReportId },
      data: { appreciation },
    })
    return { success: true, message: "Appréciation enregistrée." }
  } catch (error) {
    console.error("[updateSubjectAppreciation]", error)
    return { success: false, message: "Erreur lors de la mise à jour." }
  }
}

// Admin — Décision Administratif
export async function updateReportCardAppreciation(
  reportCardId: number,
  decision?: string
): Promise<{ success: boolean; message: string }> {
  try {
    await prisma.reportCard.update({
      where: { id: reportCardId },
      data: {
        ...(decision !== undefined ? { decision } : {}),
      },
    })
    revalidatePath(`/bulletins/${reportCardId}`)
    return { success: true, message: "Mis à jour." }
  } catch (error) {
    console.error("[updateReportCardAppreciation]", error)
    return { success: false, message: "Erreur." }
  }
}