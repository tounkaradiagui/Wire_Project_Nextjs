import { PrismaClient } from "@prisma/client";

export async function seedTerms(prisma: PrismaClient, schoolYearId: number) {
    const existing = await prisma.term.findMany({ where: { schoolYearId } });

    if (existing.length > 0) {
        console.log("Trimestres déjà existants pour cette année scolaire.");
        return existing;
    }

    const year = new Date().getFullYear();

    const terms = await Promise.all([
        prisma.term.create({
            data: {
                name: "Trimestre 1", order: 1, schoolYearId,
                startDate: new Date(`${year}-10-01`),
                endDate: new Date(`${year}-12-31`),
            },
        }),
        prisma.term.create({
            data: {
                name: "Trimestre 2", order: 2, schoolYearId,
                startDate: new Date(`${year + 1}-01-01`),
                endDate: new Date(`${year + 1}-03-31`),
            },
        }),
        prisma.term.create({
            data: {
                name: "Trimestre 3", order: 3, schoolYearId,
                startDate: new Date(`${year + 1}-04-01`),
                endDate: new Date(`${year + 1}-06-30`),
            },
        }),
    ]);

    console.log("Trimestres créés :", terms.map((t) => t.name).join(", "));
    return terms;
}
