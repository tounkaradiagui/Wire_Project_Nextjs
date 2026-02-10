"use server";
import { EventSchemaInput, AnnouncementSchemaInput, AttendanceSchemaInput, ResultSchemaInput, ExamSchemaInput, AssignmentSchemaInput, LessonSchemaInput, ClassSchemaInput, SubjectSchemaInput, TeacherSchemaInput, StudentSchemaInput, ParentSchemaInput } from "./formValidationSchemas";
import prisma from '@/lib/prisma';
import { createClerkClient } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";


type currentState = { success: boolean; error: string | null; };

function timeToDate(time: string) {
    const [hours, minutes] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
}


// Create Subject Action
export const createSubject = async (currentState: currentState, data: SubjectSchemaInput) => {
    try {
        await prisma.subject.create({
            data: {
                name: data.name,
                ...(data.teachers?.length && {
                    teachers: {
                        create: data.teachers.map((teacherId: string) => ({
                            teacher: {
                                connect: { id: teacherId },
                            },
                        })),
                    },
                }),
            },
        });

        return { success: true, error: null };

    } catch (error) {
        console.log(error)
        return { success: false, error: "Une erreur est survenue lors de la création de la matière" };
    }
};

export const updateSubject = async (
    currentState: currentState,
    data: SubjectSchemaInput
) => {
    try {
        if (!data.id) {
            return { success: false, error: "ID de la matière manquant" };
        }

        await prisma.$transaction(async (tx) => {
            // 1️⃣ Update subject name
            await tx.subject.update({
                where: { id: data.id },
                data: { name: data.name },
            });

            // 2️⃣ Remove old teacher relations
            await tx.teacherSubject.deleteMany({
                where: { subjectId: data.id },
            });

            // 3️⃣ Recreate relations
            if (data.teachers?.length) {
                await tx.teacherSubject.createMany({
                    data: data.teachers.map((teacherId: string) => ({
                        teacherId,
                        subjectId: data.id!,
                    })),
                });
            }
        });

        return { success: true, error: null };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            error: "Une erreur est survenue lors de la mise à jour de la matière",
        };
    }
};

export const deleteSubject = async (currentState: currentState, data: FormData) => {
    const id = data.get("id") as string;
    try {
        await prisma.subject.delete({
            where: {
                id: parseInt(id)
            }
        });
        return { success: true, error: null }

    } catch (error) {
        console.log(error)
        return { success: false, error: "Erreur de suppression de la matière" };
    }
}

// Create Class Action 
export const createClass = async (
    currentState: currentState,
    data: ClassSchemaInput
) => {
    try {
        // 1️⃣ Vérifier le grade
        const grade = await prisma.grade.findUnique({
            where: { id: data.gradeId },
        })
        if (!grade) {
            return { success: false, error: "Niveau introuvable" }
        }

        // 2️⃣ Vérifier le supervisor si fourni
        if (data.supervisorId) {
            const teacher = await prisma.teacher.findUnique({
                where: { id: data.supervisorId },
            })
            if (!teacher) {
                // throw new Error("Supervisor (Teacher) does not exist")
                return { success: false, error: "Enseignant superviseur introuvable" }
            }
        }

        // 3️⃣ Créer la classe
        await prisma.class.create({
            data: {
                name: data.name,
                capacity: data.capacity,
                gradeId: data.gradeId,
                supervisorId: data.supervisorId ?? null,
            },
        })

        return { success: true, error: null }
    } catch (error) {
        console.log("createClass error:", error)
        return { success: false, error: "Erreur de création de la classe" }
    }
}

export const updateClass = async (currentState: currentState, data: ClassSchemaInput) => {
    try {
        await prisma.class.update({
            where: {
                id: data.id
            },

            data
        });
        return { success: true, error: null }

    } catch (error) {
        console.log(error)
        return { success: false, error: "Erreur de mise à jour de la classe" };
    }
};

export const deleteClass = async (currentState: currentState, data: FormData) => {
    const id = data.get("id") as string;
    try {
        await prisma.class.delete({
            where: {
                id: parseInt(id)
            }
        });
        return { success: true, error: null }

    } catch (error) {
        return { success: false, error: "Erreur de suppression de la classe" };
    }
}

// Create Teacher Action
export const createTeacher = async (
    currentState: { success: boolean; error: string | null },
    data: TeacherSchemaInput
) => {
    let userId: string | null = null;

    const clerk = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY!,
    });

    try {
        const user = await clerk.users.createUser({
            username: data.username,
            password: data.password,
            firstName: data.name,
            lastName: data.surname,
            publicMetadata: { role: "teacher" },
        });

        userId = user.id;

        const subjects = await prisma.subject.findMany({
            where: { name: { in: data.subjects ?? [] } },
            select: { id: true },
        });

        await prisma.teacher.create({
            data: {
                id: user.id,
                username: data.username,
                name: data.name,
                surname: data.surname,
                email: data.email || null,
                phone: data.phone || null,
                address: data.address,
                image: data.image || null,
                bloodType: data.bloodType,
                sex: data.sex,
                birthday: data.birthday ?? null,

                subjects: {
                    create: subjects.map((s) => ({
                        subject: { connect: { id: s.id } },
                    })),
                },
            },
        });

        return { success: true, error: null };
    } catch (error) {
        if (userId) {
            await clerk.users.deleteUser(userId);
        }

        console.error("CREATE TEACHER ERROR 👉", error);
        return {
            success: false,
            error: "Une erreur est survenue lors de la création du professeur.",
        };
    }
};
// End Create Teacher Action

// Update Teacher Action
export const updateTeacher = async (
    currentState: currentState,
    data: TeacherSchemaInput
) => {
    const clerk = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY!,
    });

    try {
        if (!data.id) {
            return { success: false, error: "ID manquant" };
        }

        await clerk.users.updateUser(data.id, {
            username: data.username,
            ...(data.password && { password: data.password }),
            firstName: data.name,
            lastName: data.surname,
            publicMetadata: { role: "teacher" },
        });

        const subjects = await prisma.subject.findMany({
            where: { name: { in: data.subjects ?? [] } },
            select: { id: true },
        });

        await prisma.teacher.update({
            where: { id: data.id },
            data: {
                username: data.username,
                name: data.name,
                surname: data.surname,
                email: data.email || null,
                phone: data.phone || null,
                address: data.address,
                image: data.image || null,
                bloodType: data.bloodType,
                sex: data.sex,
                birthday: data.birthday ?? null,

                subjects: {
                    deleteMany: {}, // 🔥 supprime toutes les relations existantes
                    create: subjects.map((s) => ({
                        subject: { connect: { id: s.id } },
                    })),
                },
            },
        });

        return { success: true, error: null };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            error: "Une erreur est survenue lors de la mise à jour du professeur.",
        };
    }
};
// End Update Teacher Action

// Delete Teacher Action
export const deleteTeacher = async (id: string) => {
    const clerk = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY!,
    });

    try {
        await prisma.$transaction(async (tx) => {
            const teacher = await tx.teacher.findUnique({
                where: { id },
            });

            if (!teacher) {
                throw new Error("Enseignat introuvable");
            }

            // 1️⃣ Supprimer les relations
            await tx.teacherSubject.deleteMany({
                where: { teacherId: id },
            });

            // 2️⃣ Supprimer le teacher Prisma
            await tx.teacher.delete({
                where: { id },
            });

            // 3️⃣ Supprimer le user Clerk
            await clerk.users.deleteUser(teacher.id);
        });

        return { success: true };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            error: "Erreur lors de la suppression du professeur",
        };
    }
};
// End Delete Teacher Action

// Create Student Action
export const createStudent = async (
    currentState: { success: boolean; error: string | null },
    data: StudentSchemaInput
) => {
    let userId: string | null = null;

    // Create Clerk user
    const clerk = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY!,
    });

    try {

        const { parentId, classId, gradeId } = data;

        // Validation
        if (!parentId) throw new Error("Parent is required");
        if (!classId) throw new Error("Class is required");
        if (!gradeId) throw new Error("Grade is required");

        console.log("FORM DATA OK:", { parentId, classId, gradeId });

        // Vérifiez la capacité de classe pour pouvoir ajouter un élève
        const classsItem = await prisma.class.findUnique({
            where: { id: data.classId },
            include: {
                _count: { select: { students: true } }
            }
        });

        if (classsItem && classsItem.capacity === classsItem._count.students) {
            return { success: false, error: "La classe est pleine" }
        }

        const user = await clerk.users.createUser({
            username: data.username,
            password: data.password,
            firstName: data.name,
            lastName: data.surname,
            publicMetadata: { role: "student" },
        });

        // Clerk user Id
        userId = user.id;

        // Create student
        await prisma.student.create({
            data: {
                id: user.id,
                username: data.username,
                name: data.name,
                surname: data.surname,
                email: data.email || null,
                phone: data.phone || null,
                address: data.address,
                image: data.image || null,
                bloodType: data.bloodType,
                sex: data.sex,
                birthday: data.birthday ?? null,
                parent: { connect: { id: parentId } },
                class: { connect: { id: classId } },
                grade: { connect: { id: gradeId } },
            },
        });

        return { success: true, error: null };
    } catch (error) {
        // delete user from clerk
        if (userId) {
            await clerk.users.deleteUser(userId);
        };
        // console.error("Create Student errror ❌", error);
        return { success: false, error: "Une erreur est survenue lors de la création de l'élève." };
    }
};

export const updateStudent = async (
    currentState: { success: boolean; error: string | null },
    data: StudentSchemaInput
) => {

    // Clerk update
    const clerk = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY!,
    });

    try {
        const { parentId, classId, gradeId } = data;

        if (!data.id) throw new Error("Student ID is required");
        if (!parentId) throw new Error("Parent is required");
        if (!classId) throw new Error("Class is required");
        if (!gradeId) throw new Error("Grade is required");

        // Fetch existing student
        const existingStudent = await prisma.student.findUnique({
            where: { id: data.id },
            select: { classId: true },
        });

        // Check class capacity ONLY if class changes
        const classItem = await prisma.class.findUnique({
            where: { id: classId },
            include: { _count: { select: { students: true } } },
        });

        if (
            existingStudent?.classId !== classId &&
            classItem &&
            classItem.capacity === classItem._count.students
        ) {
            return { success: false, error: "La classe est pleine" };
        }


        await clerk.users.updateUser(data.id, {
            username: data.username,
            ...(data.password && { password: data.password }),
            firstName: data.name,
            lastName: data.surname,
        });

        // Prisma update
        await prisma.student.update({
            where: { id: data.id },
            data: {
                username: data.username,
                name: data.name,
                surname: data.surname,
                email: data.email || null,
                phone: data.phone || null,
                address: data.address,
                image: data.image || null,
                bloodType: data.bloodType,
                sex: data.sex,
                birthday: data.birthday ?? null,
                parent: { connect: { id: parentId } },
                class: { connect: { id: classId } },
                grade: { connect: { id: gradeId } },
            },
        });

        return { success: true, error: null };

    } catch (error) {
        console.error("Update Student error ❌", error);
        return { success: false, error: "Une erreur est survenue lors de la mise à jour de l'élève." };
    }
};

export const deleteStudent = async (currentState: currentState, data: FormData) => {
    const id = data.get("id") as string;
    try {
        const clerk = createClerkClient({
            secretKey: process.env.CLERK_SECRET_KEY!,
        });

        await clerk.users.deleteUser(id);

        await prisma.student.delete({
            where: {
                id: id
            }
        });
        return { success: true, error: null }

    } catch (error) {
        return { success: false, error: "Une erreur est survenue lors de la suppression de l'élève." };
    }
}

// Create Exam Action
export const createExam = async (currentState: currentState, data: ExamSchemaInput) => {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    try {
        if (role === "teacher") {
            const teacherLesson = await prisma.lesson.findFirst({
                where: {
                    teacherId: userId!,
                    id: data.lessonId
                }
            })

            if (!teacherLesson) {
                return { success: false, error: null };
            }
        }

        await prisma.exam.create({
            data: {
                title: data.title,
                startTime: data.startTime,
                endTime: data.endTime,
                lessonId: data.lessonId
                // lessons:{
                //     connect:data.lessons.map((teacherId) => ({id: teacherId}))
                // }
            }
        });
        return { success: true, error: null }

    } catch (error) {
        console.log(error)
        return { success: false, error: "Une erreur est survenue lors de la création de l'examen." };
    }
};

export const updateExam = async (currentState: currentState, data: ExamSchemaInput) => {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    try {
        if (role === "teacher") {
            const teacherLesson = await prisma.lesson.findFirst({
                where: {
                    teacherId: userId!,
                    id: data.lessonId
                }
            })

            if (!teacherLesson) {
                return { success: false, error: "Vous n'êtes pas autorisé à modifier cet examen." };
            }
        }

        await prisma.exam.update({
            where: {
                id: data.id,
            },
            data: {
                title: data.title,
                startTime: data.startTime,
                endTime: data.endTime,
                lessonId: data.lessonId
            }
        });
        return { success: true, error: null }

    } catch (error) {
        console.log(error)
        return { success: false, error: "Une erreur est survenue lors de la mise à jour de l'examen." };
    }
};

export const deleteExam = async (currentState: currentState, data: FormData) => {
    const id = data.get("id") as string;

    try {
        await prisma.exam.delete({
            where: {
                id: parseInt(id),
            },
            select: {
                id: true,
                title: true,
            }
        });
        return { success: true, error: null }

    } catch (error) {
        console.log(error)
        return { success: false, error: "Une erreur est survenue lors de la suppression de l'examen." };
    }
};

// Create Parent Action
export const createParent = async (
    _currentState: { success: boolean; error: string | null },
    data: ParentSchemaInput
) => {

    let userId: string | null = null;

    // Create Clerk user
    const clerk = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY!,
    });

    try {


        const user = await clerk.users.createUser({
            username: data.username,
            password: data.password,
            firstName: data.name,
            lastName: data.surname,
            publicMetadata: { role: "parent" },
        });

        // Clerk user Id
        userId = user.id;

        // Create parent
        await prisma.parent.create({
            data: {
                id: userId,
                username: data.username,
                name: data.name,
                surname: data.surname,
                email: data.email || null,
                phone: data.phone,
                address: data.address,
                image: data.image || null,
                sex: data.sex,
                birthday: data.birthday ?? null,
            },
        });

        return { success: true, error: null };
    } catch (error) {
        // delete user from clerk
        if (userId) {
            await clerk.users.deleteUser(userId);
        };
        // console.error("Create Parent errror ❌", error);
        return { success: false, error: "Une erreur est survenue lors de la création du parent." };
    }
};

export const updateParent = async (
    currentState: { success: boolean; error: string | null },
    data: ParentSchemaInput
) => {

    // Clerk update
    const clerk = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY!,
    });

    try {
        if (!data.id) {
            return { success: false, error: "ID manquant" };
        }

        await clerk.users.updateUser(data.id, {
            username: data.username,
            ...(data.password && { password: data.password }),
            firstName: data.name,
            lastName: data.surname,
        });

        // Prisma update
        await prisma.parent.update({
            where: { id: data.id },
            data: {
                username: data.username,
                name: data.name,
                surname: data.surname,
                email: data.email || null,
                phone: data.phone,
                address: data.address,
                image: data.image || null,
                sex: data.sex,
                birthday: data.birthday ?? null,
            },
        });

        return { success: true, error: null };
    } catch (error) {
        console.error("Update Parent error ❌", error);
        return { success: false, error: "Une erreur est survenue lors de la mise à jour du parent." };
    }
};

export const deleteParent = async (currentState: currentState, data: FormData) => {
    const id = data.get("id") as string;
    try {
        const clerk = createClerkClient({
            secretKey: process.env.CLERK_SECRET_KEY!,
        });

        await clerk.users.deleteUser(id);

        await prisma.parent.delete({
            where: {
                id: id
            }
        });
        return { success: true, error: null }

    } catch (error) {
        return { success: false, error: "Une erreur est survenue lors de la suppression du parent." };
    }
}

// Create Lesson Action
export const createLesson = async (
    _currentState: { success: boolean; error: string | null; },
    data: LessonSchemaInput
) => {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    try {
        if (!userId) {
            return { success: false, error: "Utilisateur non authentifié" };
        }

        const teacherId = role === "teacher" ? userId : data.teacherId;

        // 🔎 Vérification conflit
        const conflict = await prisma.lesson.findFirst({
            where: {
                day: data.day,
                AND: [
                    { startTime: { lt: data.endTime } },
                    { endTime: { gt: data.startTime } },
                ],
                OR: [
                    { teacherId },
                    { classId: data.classId },
                ],
            },
        });

        if (conflict) {
            return {
                success: false,
                error: "Conflit d’horaire : l’enseignant ou la classe est déjà occupé(e)."
            };
        }

        await prisma.lesson.create({
            data: {
                name: data.name,
                day: data.day,
                startTime: data.startTime,
                endTime: data.endTime,
                subjectId: data.subjectId,
                classId: data.classId,
                teacherId,
            },
        });

        return { success: true, error: null };
    } catch (error) {
        console.error("Create lesson error:", error);
        return { success: false, error: "Une erreur est survenue lors de la création du cours." };
    }
};

export const updateLesson = async (currentState: currentState, data: LessonSchemaInput) => {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    try {
        if (role === "teacher") {
            const teacherLesson = await prisma.lesson.findFirst({
                where: {
                    teacherId: userId!,
                    id: data.subjectId
                }
            })

            if (!teacherLesson) {
                return { success: false, error: "Ce cours ne vous appartient pas" };
            }
        }

        await prisma.lesson.update({
            where: {
                id: data.id,
            },
            data: {
                name: data.name,
                startTime: data.startTime,
                endTime: data.endTime,
                subjectId: data.subjectId
            }
        });
        return { success: true, error: null }

    } catch (error) {
        console.log(error)
        return { success: false, error: "Une erreur est survenue lors de la mise à jour du cours." };
    }
};

export const deleteLesson = async (currentState: currentState, data: FormData) => {
    const id = data.get("id") as string;

    // const { userId, sessionClaims } = await auth();
    // const role = (sessionClaims?.metadata as { role?: string })?.role;

    try {
        await prisma.lesson.delete({
            where: {
                id: parseInt(id),
                // ...(role === "teacher" ? {teacherId: userId!} : {}),
            },
            select: {
                id: true,
                name: true,
            }
        });
        return { success: true, error: null }

    } catch (error) {
        console.log(error)
        return { success: false, error: "Une erreur est survenue lors de la suppression du cours." };
    }
};

// Create Assignment Action
export const createAssignment = async (
    currentState: currentState,
    data: AssignmentSchemaInput
) => {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    try {
        // 🔐 Autorisation
        if (!["teacher", "admin"].includes(role ?? "")) {
            return { success: false, error: "Vous n’êtes pas autorisé à effectuer cette action." };
        }

        // 🕒 Validation des dates
        const startDate = new Date(data.startDate);
        const dueDate = new Date(data.dueDate);

        if (isNaN(startDate.getTime()) || isNaN(dueDate.getTime())) {
            return { success: false, error: null };
        }

        if (dueDate <= startDate) {
            return { success: false, error: "La date de remise doit être postérieure à la date de début." };
        }

        // 👨‍🏫 Vérifier que le prof possède la leçon
        if (role === "teacher") {
            const teacherLesson = await prisma.lesson.findFirst({
                where: {
                    id: data.lessonId,
                    teacherId: userId!,
                },
            });

            if (!teacherLesson) {
                return { success: false, error: "Ce cours ne vous appartient pas" };
            }
        }

        // ✅ Création
        await prisma.assignment.create({
            data: {
                title: data.title,
                startDate,
                dueDate,
                lessonId: data.lessonId,
            },
        });

        return { success: true, error: null };
    } catch (error) {
        console.error("Create Assignment Error ❌", error);
        return { success: false, error: "Erreur lors de la création" };
    }
};

export const updateAssignment = async (
    currentState: currentState,
    data: AssignmentSchemaInput
) => {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    try {
        // 🔐 Autorisation
        if (!["teacher", "admin"].includes(role ?? "")) {
            return { success: false, error: "Vous n’êtes pas autorisé à effectuer cette action." };
        }

        // 🆔 ID obligatoire
        if (!data.id) {
            return { success: false, error: "ID requis" };
        }

        // 🕒 Validation des dates
        const startDate = new Date(data.startDate);
        const dueDate = new Date(data.dueDate);

        if (isNaN(startDate.getTime()) || isNaN(dueDate.getTime())) {
            return { success: false, error: null };
        }

        if (dueDate <= startDate) {
            return { success: false, error: "La date de remise doit être postérieure à la date de début." };
        }

        // 👨‍🏫 Vérifier que le prof possède la leçon
        if (role === "teacher") {
            const teacherLesson = await prisma.lesson.findFirst({
                where: {
                    id: data.lessonId,
                    teacherId: userId!,
                },
            });

            if (!teacherLesson) {
                return { success: false, error: "Ce cours ne vous appartient pas" };
            }
        }

        // ✅ Mise à jour
        await prisma.assignment.update({
            where: {
                id: data.id,
            },
            data: {
                title: data.title,
                startDate,
                dueDate,
                lessonId: data.lessonId,
            },
        });

        return { success: true, error: null };
    } catch (error) {
        console.error("Update Assignment Error ❌", error);
        return { success: false, error: "Erreur lors de la mise à jour" };
    }
};

export const deleteAssignment = async (currentState: currentState, data: FormData) => {
    const id = data.get("id") as string;

    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    try {
        await prisma.assignment.delete({
            where: {
                id: parseInt(id),
                ...(role === "teacher" ? { teacherId: userId! } : {}),
            },
            select: {
                id: true,
                title: true,
            }
        });
        return { success: true, error: null }

    } catch (error) {
        console.log(error)
        return { success: false, error: "Une erreur est survenue lors de la suppression du devoir." };
    }
};

// Create Result Action
export const createResult = async (
    currentState: currentState,
    data: ResultSchemaInput
) => {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    // 🔒 Sécurité : seul l'enseignant peut enregister un note
    if (!userId || role !== "teacher") {
        return {
            success: false,
            error: "Seul un enseignant peut enregistrer une note",
        };
    }

    // Vérifier que la leçon appartient bien à l’enseignant
    const lesson = await prisma.lesson.findFirst({
        where: {
            teacherId: userId!,
            OR: [
                { exams: { some: { id: data.examId ?? undefined } } },
                { assignments: { some: { id: data.assignmentId ?? undefined } } },
            ],
        },
    });

    if (!lesson) {
        return {
            success: false,
            error: "Accès refusé à cette leçon",
        };
    }

    try {
        await prisma.result.create({
            data: {
                score: data.score,
                examId: data.examId ?? null,
                assignmentId: data.assignmentId ?? null,
                studentId: data.studentId,
            },
        });

        return { success: true, error: null };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            error: "Erreur lors de l'enregistrement de la note",
        };
    }
};

export const updateResult = async (
    currentState: currentState,
    data: ResultSchemaInput
) => {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    // 🔒 Sécurité : seul l'enseignant peut modifier une note
    if (!userId || role !== "teacher") {
        return {
            success: false,
            error: "Vous n'êtes pas autorisé à modifier une note",
        };
    }

    try {
        await prisma.result.update({
            where: { id: data.id },
            data: {
                score: data.score,
                examId: data.examId ?? null,
                assignmentId: data.assignmentId ?? null,
                studentId: data.studentId,
            },
        });

        return { success: true, error: null };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            error: "Erreur lors de la modification de la note",
        };
    }
};


export const deleteResult = async (currentState: currentState, data: FormData) => {
    const id = data.get("id") as string;

    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    // 🔒 Sécurité : seul l'enseignant peut supprimer une note
    if (!userId || role !== "teacher") {
        return {
            success: false,
            error: "Vous n'êtes pas autorisé à supprimer une note",
        };
    }

    try {
        await prisma.result.delete({
            where: {
                id: parseInt(id),
                ...(role === "teacher" ? { teacherId: userId! } : {}),
            },
            select: {
                id: true,
                score: true,
            }
        });
        return { success: true, error: null }

    } catch (error) {
        console.log(error)
        return { success: false, error: "Une erreur est survenue lors de la suppression de la note." };
    }
};

// Create Attendance Action
export const createAttendance = async (
    currentState: currentState,
    data: AttendanceSchemaInput
): Promise<currentState> => {

    try {
        const { userId, sessionClaims } = await auth();
        const role = (sessionClaims?.metadata as { role?: string })?.role;

        if (!userId || !role) {
            return { success: false, error: "Non autorisé." };
        }

        if (!["admin", "teacher", "parent"].includes(role)) {
            return { success: false, error: "Rôle interdit." };
        }

        // 🔒 INTERDIT AUX STUDENTS
        if (role === "student") {
            return { success: false, error: "Accès refusé" };
        }

        // 🔍 Vérifier l'élève
        const student = await prisma.student.findUnique({
            where: { id: data.studentId },
            select: { parentId: true },
        });

        if (!student) {
            return { success: false, error: "Élève introuvable" };
        }

        if (role === "admin") {
            // admin peut tout faire → pas de restriction
        }

        // 🔒 Parent → seulement ses enfants
        if (role === "parent" && student.parentId !== userId) {
            return { success: false, error: "Accès interdit" };
        }
        if (role === "parent") {
            if (data.status !== "ABSENT") {
                return {
                    success: false,
                    error: "Un parent peut uniquement signaler une absence.",
                };
            }

            if (!data.comment && !data.proofUrl) {
                return {
                    success: false,
                    error: "Une justification est obligatoire.",
                };
            }
        }

        /** 🔐 ENSEIGNANT */
        if (role === "teacher") {
            const lesson = await prisma.lesson.findFirst({
                where: {
                    id: data.lessonId,
                    teacherId: userId,
                },
            });

            if (!lesson) {
                return {
                    success: false,
                    error: "Vous ne pouvez pas gérer cette leçon.",
                };
            }
        }

        if (data.proofUrl && !data.proofUrl.includes("res.cloudinary.com")) {
            return {
                success: false,
                error: "Fichier invalide",
            };
        }


        const attendanceDate =
            data.date instanceof Date ? data.date : new Date(data.date);

        await prisma.attendance.create({
            data: {
                studentId: data.studentId,
                lessonId: data.lessonId,
                date: attendanceDate,
                status: data.status,
                comment: data.comment,
                proofUrl: data.proofUrl,
                createdBy:
                    role === "parent"
                        ? "PARENT"
                        : role === "teacher"
                            ? "TEACHER"
                            : "ADMIN",
            },
        });
        console.log("proofUrl reçu:", data.proofUrl);

        return { success: true, error: null };
    } catch (error: any) {
        console.error("createAttendance error:", error);

        if (error.code === "P2002") {
            return {
                success: false,
                error: "La présence existe déjà pour ce jour.",
            };
        }

        return {
            success: false,
            error: "Erreur serveur.",
        };
    }
};


export const updateAttendance = async (
    currentState: currentState,
    data: AttendanceSchemaInput
): Promise<currentState> => {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    if (!userId || !role || !data.id) {
        return { success: false, error: "Non autorisé." };
    }

    try {
        const attendance = await prisma.attendance.findUnique({
            where: { id: data.id },
            include: {
                lesson: true,
            },
        });

        if (!attendance) {
            return {
                success: false,
                error: "Présence introuvable.",
            };
        }

        const newStatus = data.status ?? attendance.status;

        /** 🚫 Parent ne peut pas modifier */
        if (role === "parent") {
            return {
                success: false,
                error: "Un parent ne peut pas modifier une présence.",
            };
        }

        /** 🔐 Enseignant → seulement ses leçons */
        if (role === "teacher" && attendance.lesson.teacherId !== userId) {
            return {
                success: false,
                error: "Accès refusé.",
            };
        }

        if (
            newStatus === "ABSENT" &&
            !data.comment &&
            !data.proofUrl
        ) {
            return {
                success: false,
                error: "Justification obligatoire pour une absence.",
            };
        }

        await prisma.attendance.update({
            where: { id: data.id },
            data: {
                status: newStatus,
                comment: data.comment,
                proofUrl: data.proofUrl,
            },
        });

        return { success: true, error: null };
    } catch (error) {
        console.error("updateAttendance error:", error);
        return {
            success: false,
            error: "Erreur serveur.",
        };
    }
};


export const deleteAttendance = async (
    currentState: currentState,
    data: FormData
) => {
    const id = Number(data.get("id"));

    if (!id) {
        return { success: false, error: "ID invalide" };
    }

    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    try {
        // 1️⃣ Fetch attendance with lesson → teacher
        const attendance = await prisma.attendance.findUnique({
            where: { id },
            include: {
                lesson: {
                    select: { teacherId: true },
                },
            },
        });

        if (!attendance) {
            return { success: false, error: "Absence introuvable" };
        }

        // 2️⃣ Permission check
        if (role === "teacher" && attendance.lesson.teacherId !== userId) {
            return {
                success: false,
                error: "Vous n'avez pas le droit de supprimer cette absence",
            };
        }

        // (optional) Parents / students restriction
        if (role === "parent" || role === "student") {
            return {
                success: false,
                error: "Action non autorisée",
            };
        }

        // 3️⃣ Delete
        await prisma.attendance.delete({
            where: { id },
        });

        return { success: true, error: null };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            error: "Erreur serveur lors de la suppression",
        };
    }
};

// Fetch parent students
export const getParentStudents = async () => {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    if (!userId || role !== "parent") {
        return { success: false, error: "Accès refusé" };
    }

    return prisma.student.findMany({
        where: {
            parentId: userId,
        },
        include: {
            class: true,
            grade: true,
        },
    });
};

// Fetch Student Attendances For Parent
export const getStudentAttendancesForParent = async (studentId: string) => {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    if (!userId || role !== "parent") {
        return {
            success: false,
            error: "Accès refusé",
            data: [],
        };
    }

    const attendances = await prisma.attendance.findMany({
        where: {
            studentId,
            student: {
                parentId: userId,
            },
        },
        orderBy: {
            date: "desc",
        },
        include: {
            lesson: {
                select: { name: true },
            },
        },
    });

    return {
        success: true,
        data: attendances,
        error: null,
    };
};



// Fetch Student Assignments For Parent
export const getStudentAssignmentsForParent = async (studentId: string) => {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    if (!userId || role !== "parent") {
        return {
            success: false,
            error: "Accès refusé",
            data: [],
        };
    }

    const assignments = await prisma.assignment.findMany({
        where: {
            lesson: {
                class: {
                    students: {
                        some: {
                            id: studentId,
                            parentId: userId,
                        },
                    },
                },
            },
        },
        orderBy: {
            dueDate: "asc",
        },
        include: {
            lesson: {
                select: { name: true },
            },
        },
    });

    return {
        success: true,
        data: assignments,
        error: null,
    };
};


// Fetch Student Exams For Parent
export const getExams = async (studentId?: string) => {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    if (role !== "parent") {
        throw new Error("Accès non autorisé");
    }

    return prisma.exam.findMany({
        where: {
            lesson: {
                class: {
                    students: {
                        some: {
                            ...(studentId ? { id: studentId } : {}),
                            parentId: userId!,
                        },
                    },
                },
            },
        },
        // orderBy: {
        //     startTime: "asc",
        // },
        include: {
            lesson: {
                select: {
                    name: true,
                },
            },
        },
    });
};

// Create Announcement Action
export const createAnnouncement = async (
    currentState: currentState,
    data: AnnouncementSchemaInput
) => {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    try {
        if (!userId || role !== "admin") {
            return {
                success: false,
                error: "Vous n'êtes pas autorisé à créer une annonce.",
            };
        }

        await prisma.announcement.create({
            data: {
                title: data.title,
                date: data.date,
                description: data.description ?? null,
                ...(data.classId !== undefined && { classId: data.classId }),
            },
        });

        return { success: true, error: null };
    } catch (error) {
        console.error("Create Announcement Error ❌", error);
        return {
            success: false,
            error: "Une erreur est survenue lors de la création de l'annonce.",
        };
    }
};

// Update Announcement Action
export const updateAnnouncement = async (
    currentState: currentState,
    data: AnnouncementSchemaInput
) => {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    try {
        if (!userId || role !== "admin") {
            return {
                success: false,
                error: "Vous n'êtes pas autorisé à modifier une annonce.",
            };
        }

        if (!data.id) {
            return {
                success: false,
                error: "ID de l'annonce manquant.",
            };
        }

        await prisma.announcement.update({
            where: { id: data.id },
            data: {
                title: data.title,
                date: data.date,
                description: data.description ?? null,
                ...(data.classId !== undefined && { classId: data.classId }),
            },
        });

        return { success: true, error: null };
    } catch (error) {
        console.error("Update Announcement Error ❌", error);
        return {
            success: false,
            error: "Une erreur est survenue lors de la mise à jour de l'annonce.",
        };
    }
};

// Delete Announcement Action
export const deleteAnnouncement = async (
    currentState: currentState,
    data: FormData
) => {
    const id = Number(data.get("id"));

    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    try {
        if (!userId || role !== "admin") {
            return {
                success: false,
                error: "Vous n'êtes pas autorisé à supprimer une annonce.",
            };
        }

        if (!id || isNaN(id)) {
            return {
                success: false,
                error: "ID invalide.",
            };
        }

        await prisma.announcement.delete({
            where: { id },
        });

        return { success: true, error: null };
    } catch (error) {
        console.error("Delete Announcement Error ❌", error);
        return {
            success: false,
            error: "Une erreur est survenue lors de la suppression de l'annonce.",
        };
    }
};

// Create Event Action
export const createEvent = async (
    currentState: currentState,
    data: EventSchemaInput
) => {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    try {
        if (!userId || role !== "admin") {
            return {
                success: false,
                error: "Vous n'êtes pas autorisé à créer un événement.",
            };
        }

        await prisma.event.create({
            data: {
                title: data.title,
                startTime: data.startTime,
                endTime: data.endTime,
                description: data.description,
                ...(data.classId !== undefined && { classId: data.classId }),
            },
        });

        return { success: true, error: null };
    } catch (error) {
        console.error("Create Event Error ❌", error);
        return {
            success: false,
            error: "Une erreur est survenue lors de la création de l'annonce.",
        };
    }
};

// Update Event Action
export const updateEvent = async (
    currentState: currentState,
    data: EventSchemaInput
) => {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    try {
        if (!userId || role !== "admin") {
            return {
                success: false,
                error: "Vous n'êtes pas autorisé à modifier une annonce.",
            };
        }

        if (!data.id) {
            return {
                success: false,
                error: "ID de l'événement manquant.",
            };
        }

        await prisma.event.update({
            where: { id: data.id },
            data: {
                title: data.title,
                startTime: data.startTime,
                endTime: data.endTime,
                description: data.description,
                ...(data.classId !== undefined && { classId: data.classId }),
            },
        });

        return { success: true, error: null };
    } catch (error) {
        console.error("Update Event Error ❌", error);
        return {
            success: false,
            error: "Une erreur est survenue lors de la mise à jour de l'annonce.",
        };
    }
};

// Delete Event Action
export const deleteEvent = async (
    currentState: currentState,
    data: FormData
) => {
    const id = Number(data.get("id"));

    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    try {
        if (!userId || role !== "admin") {
            return {
                success: false,
                error: "Vous n'êtes pas autorisé à supprimer une annonce.",
            };
        }

        if (!id || isNaN(id)) {
            return {
                success: false,
                error: "ID invalide.",
            };
        }

        await prisma.event.delete({
            where: { id },
        });

        return { success: true, error: null };
    } catch (error) {
        console.error("Delete Event Error ❌", error);
        return {
            success: false,
            error: "Une erreur est survenue lors de la suppression de l'annonce.",
        };
    }
};
