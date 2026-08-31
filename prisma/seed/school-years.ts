import { PrismaClient } from "@prisma/client";

export async function seedSchoolYears(schoolId: string, prisma: PrismaClient) {
    const currentYear = new Date().getFullYear();
    const name = `${currentYear}-${currentYear + 1}`;

    // ✅ Scoper la recherche par école
    const existing = await prisma.schoolYear.findFirst({
        where: { name, schoolId: schoolId },
    });

    if (existing) {
        console.log("SchoolYear déjà existante :", name);
        return existing;
    }

    const schoolYear = await prisma.schoolYear.create({
        data: {
            name,
            isActive: true,
            schoolId: schoolId,
        },
    });

    console.log("✅ SchoolYear créée :", schoolYear.name);
    return schoolYear;
}
