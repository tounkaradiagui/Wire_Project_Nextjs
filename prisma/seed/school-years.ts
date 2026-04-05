import { PrismaClient } from "@prisma/client";

export async function seedSchoolYears(prisma: PrismaClient) {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;

    const name = `${currentYear}-${nextYear}`;

    const existing = await prisma.schoolYear.findFirst({
        where: { name },
    });

    if (existing) {
        console.log("SchoolYear already exists:", name);
        return existing;
    }

    const schoolYear = await prisma.schoolYear.create({
        data: {
            name,
            isActive: true,
        },
    });

    console.log("Created SchoolYear:", schoolYear.name);

    return schoolYear;
}