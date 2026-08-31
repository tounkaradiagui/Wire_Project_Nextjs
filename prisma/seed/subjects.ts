import { PrismaClient } from "@prisma/client";

const SUBJECTS = [
    "Mathématiques",
    "Physique / Chimie",
    "Histoire / Géographie",
    "Anglais",
    "EPS",
    "Biologie",
    "Informatique",
    "Chant",
    "Français",
    "Lecture",
    "Calcul",
    "Éducation civique",
    "Dessin",
];

export async function seedSubjects(schoolId: string, prisma: PrismaClient) {
    for (const name of SUBJECTS) {
        // upsert sur le compound unique (name + schoolId) pour idempotence
        await prisma.subject.upsert({
            where: {
                name_schoolId: {
                    name,
                    schoolId: schoolId,
                },
            },
            update: {},
            create: {
                name,
                schoolId: schoolId,
            },
        });
    }

    console.log("✅ Matières seedées.");
}
