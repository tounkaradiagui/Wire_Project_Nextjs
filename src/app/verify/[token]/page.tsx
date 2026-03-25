import prisma from "@/lib/prisma";
import Image from "next/image";

export default async function VerifyStudentPage({
    params,
}: {
    params: Promise<{ token: string }>;
}) {
    const { token } = await params;

    const student = await prisma.student.findUnique({
        where: { verificationToken: token },
        include: { class: true },
    });

    //  Vérification de la validité
    if (!student) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-red-50">
                <div className="bg-white p-6 rounded-xl shadow text-center">
                    <h1 className="text-xl font-bold text-red-600">
                        ❌ Carte invalide
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Aucun élève trouvé avec cet identifiant
                    </p>
                </div>
            </div>
        );
    }

    // Vérification expiration
    const now = new Date();
    const isExpired = student.cardExpiresAt < now;

    if (isExpired) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-yellow-50">
                <div className="bg-white p-6 rounded-xl shadow text-center">
                    <h1 className="text-xl font-bold text-yellow-600">
                        ⚠️ Carte expirée
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Cette carte n'est plus valide
                    </p>

                    <div className="mt-4 text-sm">
                        Expirée le :{" "}
                        <span className="font-medium">
                            {new Date(student.cardExpiresAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">

                {/* HEADER */}
                <div className="text-center mb-4">
                    <h1 className="text-lg font-bold text-green-600">
                        ✅ Carte vérifiée
                    </h1>
                    <p className="text-xs text-gray-500">
                        Élève reconnu par le système
                    </p>
                </div>

                {/* PHOTO */}
                {/* <div className="flex justify-center mb-4">
                    {student.image ? (
                        <Image
                            src={student.image}
                            alt="student"
                            width={100}
                            height={120}
                            className="rounded-md object-cover"
                        />
                    ) : (
                        <div className="w-25 h-30] bg-gray-200 rounded-md" />
                    )}
                </div> */}

                {/* INFOS */}
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Nom</span>
                        <span className="font-medium">{student.name}</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-gray-500">Prénom</span>
                        <span className="font-medium">{student.surname}</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-gray-500">Classe</span>
                        <span>{student.class?.name || "—"}</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-gray-500">Sexe</span>
                        <span>{student.sex === "MALE" ? "M" : "F"}</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-gray-500">Token</span>
                        <span>{student?.verificationToken}</span>
                    </div>
                </div>

                {/* STATUS */}
                <div className="mt-6 bg-green-50 text-green-700 text-center p-3 rounded-lg text-sm">
                    Cette carte est authentique ✔️
                </div>
            </div>
        </div>
    );
}