import { PrismaClient, CycleEnum } from "@prisma/client";


export async function seedGradesAndClasses(
    schoolId: string, prisma: PrismaClient) {
    const getCycle = (level: number): CycleEnum =>
        level <= 6 ? CycleEnum.FIRST : CycleEnum.SECOND;

    for (let level = 1; level <= 9; level++) {
        // ✅ where utilise le compound unique (level + schoolId)
        const grade = await prisma.grade.upsert({
            where: {
                level_schoolId: {
                    level,
                    schoolId: schoolId,
                },
            },
            update: {
                cycle: getCycle(level),
            },
            create: {
                level,
                name: `${level}ème Année`,
                cycle: getCycle(level),
                schoolId: schoolId,
            },
        });

        // ✅ Class : ajout de schoolId
        await prisma.class.upsert({
            where: {
                name_gradeId: {
                    name: `${level}ème Année`,
                    gradeId: grade.id,
                },
            },
            update: {},
            create: {
                name: `${level}ème Année`,
                capacity: 60,
                gradeId: grade.id,
                schoolId: schoolId,
            },
        });
    }

    console.log("✅ Grades et classes seedés.");
}
