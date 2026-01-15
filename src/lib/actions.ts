"use server";
import { ResultSchemaInput, ExamSchemaInput, AssignmentSchemaInput, LessonSchemaInput, ClassSchemaInput, SubjectSchemaInput, TeacherSchemaInput, StudentSchemaInput, ParentSchemaInput } from "./formValidationSchemas";
import prisma from '@/lib/prisma';
import { createClerkClient } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";


type currentState = { success: boolean; error: boolean };

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
                teachers: {
                    connect: data.teachers.map((teacherId) => ({ id: teacherId }))
                }
            }
        });
        return { success: true, error: false }

    } catch (error) {
        console.log(error)
        return { success: false, error: true };
    }
};

export const updateSubject = async (currentState: currentState, data: SubjectSchemaInput) => {
    try {
        await prisma.subject.update({
            where: {
                id: data.id
            },

            data: {
                name: data.name,
                teachers: {
                    set: data.teachers.map((teacherId) => ({ id: teacherId }))
                }
            }
        });
        return { success: true, error: false }

    } catch (error) {
        console.log(error)
        return { success: false, error: true };
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
        return { success: true, error: false }

    } catch (error) {
        console.log(error)
        return { success: false, error: true };
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
            return { success: false, error: true }
        }

        // 2️⃣ Vérifier le supervisor si fourni
        if (data.supervisorId) {
            const teacher = await prisma.teacher.findUnique({
                where: { id: data.supervisorId },
            })
            if (!teacher) {
                // throw new Error("Supervisor (Teacher) does not exist")
                return { success: false, error: true }
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

        return { success: true, error: false }
    } catch (error) {
        console.log("createClass error:", error)
        return { success: false, error: true }
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
        return { success: true, error: false }

    } catch (error) {
        console.log(error)
        return { success: false, error: true };
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
        return { success: true, error: false }

    } catch (error) {
        return { success: false, error: true };
    }
}

// Create Teacher Action 
export const createTeacher = async (currentState: { success: boolean; error: boolean }, data: TeacherSchemaInput) => {
    let userId: string | null = null;
    try {

        // CLERK CLIENT
        const clerk = createClerkClient({
            secretKey: process.env.CLERK_SECRET_KEY!,
        });

        const user = await clerk.users.createUser({
            username: data.username,
            password: data.password,
            firstName: data.name,
            lastName: data.surname,
            publicMetadata: { role: "teacher" },
        });

        // Clerk user Id
        userId = user.id;

        const subjectIds = await prisma.subject.findMany({
            where: { name: { in: data.subjects } },
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
                    connect: subjectIds.map(s => ({ id: s.id })),
                },

            },
        });

        return { success: true, error: false };

    } catch (error) {

        if (userId) {
            await clerk.users.deleteUser(userId);
        };

        return { success: false, error: true };
    }
};

export const updateTeacher = async (currentState: currentState, data: TeacherSchemaInput) => {
    try {
        // CLERK CLIENT
        const clerk = createClerkClient({
            secretKey: process.env.CLERK_SECRET_KEY!,
        });

        if (!data.id) {
            return { success: false, error: true };
        }
        const user = await clerk.users.updateUser(data.id, {
            username: data.username,
            ...(data.password !== "" && { password: data.password }),
            firstName: data.name,
            lastName: data.surname,
            publicMetadata: { role: "teacher" },
        });

        const subjectIds = await prisma.subject.findMany({
            where: { name: { in: data.subjects } },
            select: { id: true },
        });

        await prisma.teacher.update({
            where: { id: data.id },
            data: {
                ...(data.password !== "" && { password: data.password }),
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
                    set: subjectIds.map(s => ({ id: s.id })),
                },

            },
        });

        console.log("Teacher data: ", data);

        return { success: true, error: false }

    } catch (error) {
        console.log(error)
        return { success: false, error: true };
    }
};

export const deleteTeacher = async (currentState: currentState, data: FormData) => {
    const id = data.get("id") as string;
    try {
        const clerk = createClerkClient({
            secretKey: process.env.CLERK_SECRET_KEY!,
        });

        await clerk.users.deleteUser(id);

        await prisma.teacher.delete({
            where: {
                id: id
            }
        });
        return { success: true, error: false }

    } catch (error) {
        return { success: false, error: true };
    }
}

// Create Student Action
export const createStudent = async (
    currentState: { success: boolean; error: boolean },
    data: StudentSchemaInput
) => {
    let userId: string | null = null;
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
            return { success: false, error: true }
        }

        // Create Clerk user
        const clerk = createClerkClient({
            secretKey: process.env.CLERK_SECRET_KEY!,
        });

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

        return { success: true, error: false };
    } catch (error) {
        // delete user from clerk
        if (userId) {
            await createClerkClient.users.deleteUser(userId);
        };
        // console.error("Create Student errror ❌", error);
        return { success: false, error: true };
    }
};

export const updateStudent = async (
    currentState: { success: boolean; error: boolean },
    data: StudentSchemaInput
) => {
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
            throw new Error("Class is full");
        }

        // Clerk update
        const clerk = createClerkClient({
            secretKey: process.env.CLERK_SECRET_KEY!,
        });

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

        return { success: true, error: false };
    } catch (error) {
        console.error("Update Student error ❌", error);
        return { success: false, error: true };
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
        return { success: true, error: false }

    } catch (error) {
        return { success: false, error: true };
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
                return { success: false, error: true };
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
        return { success: true, error: false }

    } catch (error) {
        console.log(error)
        return { success: false, error: true };
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
                return { success: false, error: true };
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
        return { success: true, error: false }

    } catch (error) {
        console.log(error)
        return { success: false, error: true };
    }
};

export const deleteExam = async (currentState: currentState, data: FormData) => {
    const id = data.get("id") as string;

    // const { userId, sessionClaims } = await auth();
    // const role = (sessionClaims?.metadata as { role?: string })?.role;

    try {
        await prisma.exam.delete({
            where: {
                id: parseInt(id),
                // ...(role === "teacher" ? {teacherId: userId!} : {}),
            },
            select: {
                id: true,
                title: true,
            }
        });
        return { success: true, error: false }

    } catch (error) {
        console.log(error)
        return { success: false, error: true };
    }
};

// Create Parent Action
export const createParent = async (
    _currentState: { success: boolean; error: boolean },
    data: ParentSchemaInput
) => {
    let userId: string | null = null;
    try {

        // Create Clerk user
        const clerk = createClerkClient({
            secretKey: process.env.CLERK_SECRET_KEY!,
        });

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
                phone: data.phone || null,
                address: data.address,
                image: data.image || null,
                sex: data.sex,
                birthday: data.birthday ?? null,
            },
        });

        return { success: true, error: false };
    } catch (error) {
        // delete user from clerk
        if (userId) {
            await createClerkClient.users.deleteUser(userId);
        };
        // console.error("Create Parent errror ❌", error);
        return { success: false, error: true };
    }
};

export const updateParent = async (
    currentState: { success: boolean; error: boolean },
    data: ParentSchemaInput
) => {
    try {
        // Clerk update
        const clerk = createClerkClient({
            secretKey: process.env.CLERK_SECRET_KEY!,
        });

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
                phone: data.phone || null,
                address: data.address,
                image: data.image || null,
                sex: data.sex,
                birthday: data.birthday ?? null,
            },
        });

        return { success: true, error: false };
    } catch (error) {
        console.error("Update Parent error ❌", error);
        return { success: false, error: true };
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
        return { success: true, error: false }

    } catch (error) {
        return { success: false, error: true };
    }
}

// Create Lesson Action
export const createLesson = async (
    _currentState: { success: boolean; error: boolean; message?: string },
    data: LessonSchemaInput
) => {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    try {
        if (!userId) {
            return { success: false, error: true };
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
                error: true,
                message:
                    "Conflit d’horaire : l’enseignant ou la classe est déjà occupé(e).",
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

        return { success: true, error: false };
    } catch (error) {
        console.error("Create lesson error:", error);
        return { success: false, error: true };
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
                    id: data.lessonId
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
                lessonId: data.lessonId
            }
        });
        return { success: true, error: false }

    } catch (error) {
        console.log(error)
        return { success: false, error: true };
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
        return { success: true, error: false }

    } catch (error) {
        console.log(error)
        return { success: false, error: true };
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
            return { success: false, error: true };
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

        return { success: true, error: false };
    } catch (error) {
        console.error("Create Assignment Error ❌", error);
        return { success: false, error: true };
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
            return { success: false, error: true };
        }

        // 🆔 ID obligatoire
        if (!data.id) {
            return { success: false, error: true };
        }

        // 🕒 Validation des dates
        const startDate = new Date(data.startDate);
        const dueDate = new Date(data.dueDate);

        if (isNaN(startDate.getTime()) || isNaN(dueDate.getTime())) {
            return { success: false, error: true };
        }

        if (dueDate <= startDate) {
            return { success: false, error: true };
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

        return { success: true, error: false };
    } catch (error) {
        console.error("Update Assignment Error ❌", error);
        return { success: false, error: true };
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
        return { success: true, error: false }

    } catch (error) {
        console.log(error)
        return { success: false, error: true };
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
            error: "Vous n'êtes pas autorisé à enregistrer une note",
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

        return { success: true, error: false };
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

        return { success: true, error: false };
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
                title: true,
            }
        });
        return { success: true, error: false }

    } catch (error) {
        console.log(error)
        return { success: false, error: true };
    }
};