import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🔍 Vérification des seeds...");

    // ✅ Vérifier les Admins
    const admins = await prisma.admin.findMany();
    console.log(`Admins (${admins.length}) :`, admins.map(a => ({ id: a.id, username: a.username })));

    // ✅ Vérifier les Teachers + leurs matières
    const teachers = await prisma.teacher.findMany({
        include: { subjects: true },
    });
    console.log(`Teachers (${teachers.length}) :`);
    teachers.forEach(t => {
        const subjects = t.subjects.map(s => s.subjectId);
        console.log(`- ${t.username} (id: ${t.id}) → Subjects: ${subjects.join(", ") || "aucune"}`);
    });

    // ✅ Vérifier les Parents
    const parents = await prisma.parent.findMany();
    console.log(`Parents (${parents.length}) :`, parents.map(p => ({ id: p.id, username: p.username })));

    // ✅ Vérifier les Students + leur Parent/Classe/Grade
    const students = await prisma.student.findMany({
        include: { parent: true, class: true },
    });
    console.log(`Students (${students.length}) :`);
    students.forEach(s => {
        console.log(`- ${s.username} (id: ${s.id}) → Parent: ${s.parent.username}, Classe: ${s.class.name}`);
    });

    console.log("✅ Vérification terminée");
    // cmd de verification complète des seeds: node --loader ts-node/esm verifySeed.ts

}

main()
    .catch(e => {
        console.error("❌ Erreur de vérification :", e);
    })
    .finally(() => prisma.$disconnect());
