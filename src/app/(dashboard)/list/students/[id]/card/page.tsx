import SchoolIDCard from "@/components/cards/SchoolIDCard"
import prisma from "@/lib/prisma"

const StudentCardPage = async ({
    params,
}: {
    params: Promise<{ id: string }>
}) => {
    const { id } = await params

    // ── Récupérer l'élève + l'année scolaire active en parallèle ──
    const [student, activeSchoolYear] = await Promise.all([
        prisma.student.findUnique({
            where: { id },
            include: { class: true },
        }),
        prisma.schoolYear.findFirst({
            where: { isActive: true },
            orderBy: { id: "desc" },
        }),
    ])

    if (!student) return <div>Student not found</div>

    // Calcul de la date de validité (fin juin de l'année en cours)
    const schoolYearName = activeSchoolYear?.name ?? "2026-2027"
    const endYear = schoolYearName.split("-")[1] ?? "2027"
    const validite = `30/06/${endYear}`

    return (
        <div className="flex justify-center items-center min-h-screen">
            <SchoolIDCard
                student={{
                    id: student.id,
                    cardNumber: student.cardNumber,
                    prenom: student.name,
                    nom: student.surname,
                    sexe: student.sex,
                    verificationToken: student.verificationToken,
                    naissance: student.birthday
                        ? new Date(student.birthday).toLocaleDateString("fr-FR")
                        : "",
                    validite,
                    schoolYear: schoolYearName,
                    adresse: student.address,
                    rue: "Non défini",
                    classe: student.class?.name || "",
                    ecole: "Ecole Privé Bianson Dembélé",
                    telephone: student.phone || "Aucun numéro",
                    email: student.email || "Non défini",
                    photo: student.image || "",
                }}
            />
        </div>
    )
}

export default StudentCardPage