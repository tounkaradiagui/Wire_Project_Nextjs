import { PrismaClient } from "@prisma/client";

export async function seedTerms(
    prisma: PrismaClient,
    schoolYearId: number
) {
    const existingTerms = await prisma.term.findMany({
        where: { schoolYearId },
    });

    if (existingTerms.length > 0) {
        console.log("Terms already exist for this school year");
        return existingTerms;
    }

    const year = new Date().getFullYear();

    const termsData = [
        {
            name: "Trimestre 1",
            order: 1,
            startDate: new Date(`${year}-10-01`),
            endDate: new Date(`${year}-12-31`),
        },
        {
            name: "Trimestre 2",
            order: 2,
            startDate: new Date(`${year + 1}-01-01`),
            endDate: new Date(`${year + 1}-03-31`),
        },
        {
            name: "Trimestre 3",
            order: 3,
            startDate: new Date(`${year + 1}-04-01`),
            endDate: new Date(`${year + 1}-06-30`),
        },
    ];

    const terms = await Promise.all(
        termsData.map((term) =>
            prisma.term.create({
                data: {
                    ...term,
                    schoolYearId,
                },
            })
        )
    );

    console.log("Created Terms:", terms.map((t) => t.name));

    return terms;
}