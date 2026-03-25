import SchoolIDCard from "@/components/cards/SchoolIDCard";
import prisma from "@/lib/prisma";

const StudentCardPage = async ({
    params,
}: {
    params: Promise<{ id: string }>;
}) => {
    const { id } = await params;

    const student = await prisma.student.findUnique({
        where: {
            id: id,
        },
        include: {
            class: true,
        },
    });

    if (!student) return <div>Student not found</div>;
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

                    validite: "30/06/2027",

                    adresse: student.address,
                    rue: "Non défini",

                    classe: student.class?.name || "",
                    ecole: "Ecole Privé Bianson Dembélé",

                    telephone: student.phone || "Aucun numéro",
                    email: student.email || "Non défini",

                    photo: student.image || ""
                }}
            />
        </div>
    );
}

export default StudentCardPage;