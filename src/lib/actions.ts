"use server";
import { SessionSchemaInput, UserSchemaInput, EventSchemaInput, AnnouncementSchemaInput, AttendanceSchemaInput, ResultSchemaInput, ExamSchemaInput, AssignmentSchemaInput, LessonSchemaInput, ClassSchemaInput, SubjectSchemaInput, TeacherSchemaInput, StudentSchemaInput, ParentSchemaInput } from "./formValidationSchemas";
import prisma from '@/lib/prisma';
import { createClerkClient } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { logAction } from "@/lib/logs/audit"
import { Role, AuditAction } from "@prisma/client"
import { randomUUID } from "crypto";


type currentState = { success: boolean; error: string | null; };

function timeToDate(time: string) {
    const [hours, minutes] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
}

// Generate a base username
function generateBaseUsername(firstName: string, lastName: string) {
    return `${firstName}_${lastName}`
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9_-]/g, "") // 👈 IMPORTANT
        .slice(0, 30);
}

// Generate a unique username
async function generateUniqueUsername(
    clerk: any,
    firstName: string,
    lastName: string
) {
    const base = generateBaseUsername(firstName, lastName);

    let counter = 0;

    while (counter < 20) {
        const username = counter === 0 ? base : `${base}${counter}`;

        const existing = await clerk.users.getUserList({
            username: [username],
        });

        if (existing.data.length === 0) {
            return username;
        }

        counter++;
    }

    throw new Error("Impossible de générer username unique");
}

// generate student card token
function generateCardData() {
    const token = randomUUID();

    // 📅 fin année scolaire (ex: 30 juin 2027)
    const schoolEnd = new Date("2027-06-30");

    // ⏳ +7 jours
    const expiresAt = new Date(schoolEnd);
    expiresAt.setDate(expiresAt.getDate() + 7);

    return { token, expiresAt };
}

// Generate a random 7-digit card number    
async function generateUniqueCardNumber() {
    let isUnique = false;
    let cardNumber = "";

    while (!isUnique) {
        cardNumber = Math.floor(1000000 + Math.random() * 9000000).toString();

        const existing = await prisma.student.findUnique({
            where: { cardNumber },
        });

        if (!existing) {
            isUnique = true;
        }
    }

    return cardNumber;
}

// Create clerk user Action
export const createUser = async (
    currentState: currentState,
    data: UserSchemaInput
) => {
    const clerk = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY!,
    });

    const baseUsername = generateBaseUsername(
        data.firstName,
        data.lastName
    );

    let attempt = 0;

    while (attempt < 10) {
        const username =
            attempt === 0
                ? (data.username || baseUsername).toLowerCase()
                : `${baseUsername}${attempt}`.toLowerCase();

        try {
            // Conversion propre
            const prismaRole = data.role.toUpperCase();   // ENUM PRISMA
            const metadataRole = data.role.toLowerCase(); // CLERK + URL

            const clerkUser = await clerk.users.createUser({
                firstName: data.firstName,
                lastName: data.lastName,
                username,
                password: data.password,
                publicMetadata: {
                    role: metadataRole,
                    status: "active",
                },
            });

            await prisma.userProfile.create({
                data: {
                    clerkId: clerkUser.id,
                    username: clerkUser.username!,
                    firstName: clerkUser.firstName!,
                    lastName: clerkUser.lastName!,
                    image: clerkUser.imageUrl || null,
                    role: prismaRole as any, // compatible enum
                    isActive: true,
                    isBanned: false,
                    bannedAt: null,
                },
            });

            return { success: true, error: null };

        } catch (error: any) {
            const clerkError = error?.errors?.[0];

            if (clerkError?.code === "form_identifier_exists") {
                attempt++;
                continue;
            }

            return { success: false, error: "Erreur Clerk" };
        }
    }

    return {
        success: false,
        error: "Impossible de générer un username unique",
    };
};

// Update clerk user Action
export const updateUser = async (
    currentState: currentState,
    data: UserSchemaInput & { id: string }
) => {
    try {
        if (!data.id) {
            return { success: false, error: "ID manquant" };
        }
        const clerk = createClerkClient({
            secretKey: process.env.CLERK_SECRET_KEY!,
        });

        let username = data.username;

        const existing = await clerk.users.getUserList({
            username: [username],
        });

        const conflict = existing.data.some(
            (u) => u.id !== data.id
        );

        if (conflict) {
            username = await generateUniqueUsername(
                clerk,
                data.firstName,
                data.lastName
            );
        }

        // UPDATE Clerk user
        await clerk.users.updateUser(data.id, {
            firstName: data.firstName,
            lastName: data.lastName,
            username,
            //   emailAddress: data.email ? [data.email] : undefined,
            ...(data.password && { password: data.password }),
        });

        // UPDATE Prisma profile
        await prisma.userProfile.update({
            where: { clerkId: data.id },
            data: {
                role: data.role,
            },
        });

        return { success: true, error: null };
    } catch (error) {
        // console.error(error);
        return { success: false, error: "Erreur lors de la mise à jour" };
    }
};

export const toggleUserStatus = async (id: string): Promise<void> => {
    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    if (role !== "super_admin") {
        throw new Error("Action non autorisée !");
    }

    const clerk = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY!,
    });

    const user = await prisma.userProfile.findUnique({
        where: { id },
    });

    if (!user) {
        throw new Error("Utilisateur introuvable !");
    }

    const newBanState = !user.isBanned;

    // Update Prisma
    await prisma.userProfile.update({
        where: { id },
        data: {
            isBanned: newBanState,
            isActive: !newBanState,
            bannedAt: newBanState ? new Date() : null,
        },
    });

    // Update Clerk metadata
    await clerk.users.updateUser(user.clerkId, {
        publicMetadata: {
            isBanned: newBanState,
        },
    });

    // 🔥 Revoke ALL active sessions if banned
    if (newBanState) {
        const sessionList = await clerk.sessions.getSessionList({
            userId: user.clerkId,
        });

        for (const session of sessionList.data) {
            await clerk.sessions.revokeSession(session.id);
        }
    }

    revalidatePath("/list/users");
};


export async function requireActiveUser() {
    const { userId } = await auth();

    if (!userId) throw new Error("Non authentifié");

    const user = await prisma.userProfile.findUnique({
        where: { id: userId },
        select: { isBanned: true },
    });

    if (user?.isBanned) {
        throw new Error("Compte suspendu");
    }

    return userId;
}

// Create Subject Action
export const createSubject = async (
    currentState: currentState,
    data: SubjectSchemaInput
) => {
    const { userId } = await auth()

    try {
        // 🔍 vérifier la matière existante (même supprimée)
        const existing = await prisma.subject.findFirst({
            where: {
                name: data.name,
            },
        })

        let subject

        if (existing) {
            if (existing.isDeleted) {
                // ♻️ RESTORE
                subject = await prisma.subject.update({
                    where: { id: existing.id },
                    data: {
                        isDeleted: false,
                        deletedAt: null,
                    },
                })
            } else {
                return {
                    success: false,
                    error: "Cette matière existe déjà.",
                }
            }
        } else {
            // ✅ CREATE
            subject = await prisma.subject.create({
                data: {
                    coefficient: data.coefficient,
                    code: data.code,
                    name: data.name,
                },
            })
        }

        // 🔗 relations teachers
        if (data.teachers?.length) {
            await prisma.teacherSubject.createMany({
                data: data.teachers.map((teacherId: string) => ({
                    teacherId,
                    subjectId: subject.id,
                })),
                skipDuplicates: true,
            })
        }

        // 🔥 LOG
        const actor = await prisma.userProfile.findUnique({
            where: { clerkId: userId! },
        })

        if (!actor) throw new Error("UserProfile introuvable")

        await logAction({
            action: AuditAction.CREATE_SUBJECT,
            entityType: "Subject",
            entityId: subject.id.toString(),

            performedById: actor.id,
            role: actor.role,

            description: `Matière ${subject.name} créée`,

            before: null,
            after: {
                name: subject.name,
                teachers: data.teachers ?? [],
            },

            metadata: {
                source: "createSubject",
            },
        })

        return { success: true, error: null }

    } catch (error) {
        // console.log(error)
        return {
            success: false,
            error: "Une erreur est survenue lors de la création de la matière",
        }
    }
}

// Update Subject Action with secure query construction
export const updateSubject = async (
    currentState: currentState,
    data: SubjectSchemaInput
) => {
    const { userId } = await auth()

    try {
        if (!data.id) {
            return { success: false, error: "ID de la matière manquant" }
        }

        const existing = await prisma.subject.findUnique({
            where: { id: data.id },
            include: { teachers: true },
        })

        if (!existing || existing.isDeleted) {
            return {
                success: false,
                error: "Matière introuvable ou supprimée",
            }
        }

        const before = {
            name: existing.name,
            teachers: existing.teachers.map(t => t.teacherId),
        }

        // ✏️ update
        await prisma.subject.update({
            where: { id: data.id },
            data: {
                coefficient: data.coefficient,
                code: data.code,
                name: data.name,
            },
        })

        // 🔄 reset relations
        await prisma.teacherSubject.deleteMany({
            where: { subjectId: data.id },
        })

        if (data.teachers?.length) {
            await prisma.teacherSubject.createMany({
                data: data.teachers.map((teacherId: string) => ({
                    teacherId,
                    subjectId: data.id!,
                })),
                skipDuplicates: true,
            })
        }

        const actor = await prisma.userProfile.findUnique({
            where: { clerkId: userId! },
        })

        if (!actor) throw new Error("UserProfile introuvable")

        const after = {
            name: data.name,
            teachers: data.teachers ?? [],
        }

        // 🔥 LOG
        await logAction({
            action: AuditAction.UPDATE_SUBJECT,
            entityType: "Subject",
            entityId: data.id.toString(),

            performedById: actor.id,
            role: actor.role,

            description: `Matière ${data.name} mise à jour`,

            before,
            after,

            metadata: {
                source: "updateSubject",
            },
        })

        return { success: true, error: null }

    } catch (error) {
        console.log(error)
        return {
            success: false,
            error: "Une erreur est survenue lors de la mise à jour de la matière",
        }
    }
}

// Delete Subject
export const deleteSubject = async (
    currentState: currentState,
    data: FormData
) => {
    const id = Number(data.get("id"))

    if (!id) {
        return { success: false, error: "ID invalide" }
    }

    const { userId } = await auth()

    try {
        const subject = await prisma.subject.findUnique({
            where: { id },
            include: {
                teachers: true,
            },
        })

        if (!subject) {
            return { success: false, error: "Matière introuvable" }
        }

        const before = {
            coefficient: subject.coefficient,
            code: subject.code,
            name: subject.name,
            teachers: subject.teachers.map(t => t.teacherId),
        }

        // ✅ soft delete
        await prisma.subject.update({
            where: { id },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        })

        const actor = await prisma.userProfile.findUnique({
            where: { clerkId: userId! },
        })

        if (!actor) throw new Error("UserProfile introuvable")

        await logAction({
            action: AuditAction.DELETE_SUBJECT,
            entityType: "Subject",
            entityId: id.toString(),

            performedById: actor.id,
            role: actor.role,

            description: `Matière ${subject.name} supprimée`,

            before,
            after: null,

            metadata: {
                source: "deleteSubject",
            },

            isSoftDelete: true,
        })

        return { success: true, error: null }

    } catch (error) {
        console.log(error)
        return {
            success: false,
            error: "Erreur de suppression de la matière",
        }
    }
}

// Create Class Action 
export const createClass = async (
    currentState: currentState,
    data: ClassSchemaInput
) => {
    try {
        // Vérifier le grade
        const grade = await prisma.grade.findUnique({
            where: { id: data.gradeId },
        })
        if (!grade) {
            return { success: false, error: "Niveau introuvable" }
        }

        // Créer la classe
        await prisma.class.create({
            data: {
                name: data.name,
                capacity: data.capacity,
                gradeId: data.gradeId,
            },
        })

        return { success: true, error: null }
    } catch (error) {
        // console.log("createClass error:", error)
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
        // console.log(error)
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
    let userId: string | null = null

    const { userId: actorClerkId } = await auth()

    const clerk = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY!,
    })

    try {
        // 🔥 Clerk user
        const user = await clerk.users.createUser({
            username: data.username,
            password: data.password,
            firstName: data.name,
            lastName: data.surname,
            publicMetadata: {
                role: "teacher",
                status: "active",
            },
        })

        userId = user.id

        let createdTeacher: any = null


        const profile = await prisma.userProfile.create({
            data: {
                clerkId: user.id,
                role: "TEACHER",
                username: data.username,
                firstName: data.name,
                lastName: data.surname,
                isActive: true,
                isBanned: false,
            },
        })

        createdTeacher = await prisma.teacher.create({
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
                userProfileId: profile.id,
            },
        })

        // subjects
        if (data.subjects?.length) {
            const subjects = await prisma.subject.findMany({
                where: { name: { in: data.subjects } },
            })

            await prisma.teacherSubject.createMany({
                data: subjects.map((s) => ({
                    teacherId: user.id!,
                    subjectId: s.id,
                })),
            })
        }

        // classes
        if (data.classes?.length) {
            await prisma.teacherClass.createMany({
                data: data.classes.map((classId) => ({
                    teacherId: user.id!,
                    classId,
                })),
            })
        }


        // 🔍 Actor
        const actor = await prisma.userProfile.findUnique({
            where: { clerkId: actorClerkId! },
        })

        if (!actor) throw new Error("UserProfile introuvable")

        // 🧾 AUDIT
        await logAction({
            action: AuditAction.CREATE_TEACHER,
            entityType: "Teacher",
            entityId: createdTeacher.id,

            performedById: actor.id,
            role: actor.role,

            description: `Professeur ${createdTeacher.name} créé`,

            before: null,
            after: {
                username: createdTeacher.username,
                name: createdTeacher.name,
                surname: createdTeacher.surname,
            },

            metadata: {
                source: "createTeacher",
            },
        })

        return { success: true, error: null }

    } catch (error) {
        if (userId) {
            await clerk.users.deleteUser(userId)
        }

        return {
            success: false,
            error: "Une erreur est survenue lors de la création du professeur.",
        }
    }
}

// Update Teacher Action
export const updateTeacher = async (
    _currentState: { success: boolean; error: string | null },
    data: TeacherSchemaInput
) => {
    const { userId } = await auth()

    if (!data.id) {
        return { success: false, error: "ID manquant" }
    }

    const clerk = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY!,
    })

    try {
        // 🔍 BEFORE
        const existingTeacher = await prisma.teacher.findUnique({
            where: { id: data.id },
        })

        if (!existingTeacher) {
            return { success: false, error: "Teacher introuvable" }
        }

        const before = {
            username: existingTeacher.username,
            name: existingTeacher.name,
            surname: existingTeacher.surname,
        }

        // 🔐 Clerk
        await clerk.users.updateUser(data.id, {
            username: data.username,
            ...(data.password && { password: data.password }),
            firstName: data.name,
            lastName: data.surname,
        })

        let updatedTeacher: any = null


        const teacher = await prisma.teacher.findUnique({
            where: { id: data.id },
            select: { userProfileId: true },
        })

        if (!teacher) throw new Error("Teacher introuvable")

        await prisma.userProfile.update({
            where: { id: teacher.userProfileId },
            data: {
                username: data.username,
                firstName: data.name,
                lastName: data.surname,
            },
        })

        updatedTeacher = await prisma.teacher.update({
            where: { id: data.id },
            data: {
                username: data.username,
                name: data.name,
                surname: data.surname,
                email: data.email ?? null,
                phone: data.phone ?? null,
                address: data.address,
                image: data.image ?? null,
                bloodType: data.bloodType,
                sex: data.sex,
                birthday: data.birthday ?? null,
            },
        })

        await prisma.teacherSubject.deleteMany({
            where: { teacherId: data.id },
        })

        if (data.subjects?.length) {
            const subjects = await prisma.subject.findMany({
                where: { name: { in: data.subjects } },
            })

            await prisma.teacherSubject.createMany({
                data: subjects.map((s) => ({
                    teacherId: data.id!,
                    subjectId: s.id,
                })),
            })
        }

        await prisma.teacherClass.deleteMany({
            where: { teacherId: data.id },
        })

        if (data.classes?.length) {
            await prisma.teacherClass.createMany({
                data: data.classes.map((classId) => ({
                    teacherId: data.id!,
                    classId,
                })),
            })
        }


        // 🔍 Actor
        const actor = await prisma.userProfile.findUnique({
            where: { clerkId: userId! },
        })

        if (!actor) throw new Error("UserProfile introuvable")

        const after = {
            username: updatedTeacher.username,
            name: updatedTeacher.name,
            surname: updatedTeacher.surname,
        }

        await logAction({
            action: AuditAction.UPDATE_TEACHER,
            entityType: "Teacher",
            entityId: data.id,

            performedById: actor.id,
            role: actor.role,

            description: `Professeur ${updatedTeacher.name} mis à jour`,

            before,
            after,

            metadata: {
                source: "updateTeacher",
            },
        })

        return { success: true, error: null }

    } catch (error) {
        return {
            success: false,
            error: "Erreur lors de la mise à jour.",
        }
    }
}

// Delete Teacher Action
export const deleteTeacher = async (
    currentState: currentState,
    data: FormData
) => {
    const id = data.get("id") as string

    const { userId } = await auth()

    if (!id) {
        return { success: false, error: "ID invalide" }
    }

    try {
        const teacher = await prisma.teacher.findUnique({
            where: { id },
        })

        if (!teacher) {
            return { success: false, error: "Teacher introuvable" }
        }

        const before = {
            username: teacher.username,
            name: teacher.name,
            surname: teacher.surname,
        }

        // ✅ soft delete
        await prisma.teacher.update({
            where: { id },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        })

        const actor = await prisma.userProfile.findUnique({
            where: { clerkId: userId! },
        })

        if (!actor) throw new Error("UserProfile introuvable")

        await logAction({
            action: AuditAction.DELETE_TEACHER,
            entityType: "Teacher",
            entityId: id,

            performedById: actor.id,
            role: actor.role,

            description: `Professeur supprimé`,

            before,
            after: null,

            metadata: {
                source: "deleteTeacher",
            },

            isSoftDelete: true,
        })

        return { success: true, error: null }

    } catch (error) {
        return {
            success: false,
            error: "Erreur de suppression",
        }
    }
}


// Create Student Action
export const createStudent = async (
    _currentState: { success: boolean; error: string | null },
    data: StudentSchemaInput
) => {
    const { userId } = await auth()

    let createdUserId: string | null = null

    const clerk = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY!,
    })

    try {
        const { parentId, classId, gradeId } = data

        if (!parentId) throw new Error("Parent is required")
        if (!classId) throw new Error("Class is required")
        if (!gradeId) throw new Error("Grade is required")

        const classItem = await prisma.class.findUnique({
            where: { id: classId },
            include: { _count: { select: { students: true } } },
        })

        if (!classItem) {
            return { success: false, error: "Classe introuvable." }
        }

        if (classItem.capacity === classItem._count.students) {
            return { success: false, error: "La classe est pleine." }
        }

        const user = await clerk.users.createUser({
            username: data.username,
            password: data.password,
            firstName: data.name,
            lastName: data.surname,
            publicMetadata: {
                role: "student",
                status: "active",
            },
        })

        createdUserId = user.id

        // 1. Create profile
        const profile = await prisma.userProfile.create({
            data: {
                clerkId: user.id,
                role: "STUDENT",
                username: data.username,
                firstName: data.name,
                lastName: data.surname,
                isActive: true,
                isBanned: false,
            },
        })

        const cardNumber = await generateUniqueCardNumber();
        const { token, expiresAt } = generateCardData();

        // 2. Create student
        const student = await prisma.student.create({
            data: {
                id: user.id,
                username: data.username,
                name: data.name,
                surname: data.surname,
                verificationToken: token,
                cardExpiresAt: expiresAt,
                cardNumber,
                email: data.email || null,
                phone: data.phone || null,
                address: data.address,
                image: data.image || null,
                bloodType: data.bloodType,
                sex: data.sex,
                birthday: data.birthday ?? null,
                userProfile: {
                    connect: { id: profile.id },
                },
                parent: { connect: { id: parentId } },
                class: { connect: { id: classId } },
                grade: { connect: { id: gradeId } },
            },
        })

        const actor = await prisma.userProfile.findUnique({
            where: { clerkId: userId! },
        })

        if (!actor) throw new Error("UserProfile introuvable")

        await logAction({
            action: AuditAction.CREATE_STUDENT,
            entityType: "Student",
            entityId: student.id,

            performedById: actor.id,
            role: actor.role,

            description: `Élève ${student.name} créé`,

            before: null,

            after: {
                username: student.username,
                classId,
                gradeId,
                parentId,
            },

            metadata: {
                source: "createStudent",
            },
        })

        return { success: true, error: null }
    } catch (error) {
        if (createdUserId) {
            await clerk.users.deleteUser(createdUserId)
        }

        return {
            success: false,
            error: "Une erreur est survenue lors de la création de l'élève.",
        }
    }
}

// Update Student Action
export const updateStudent = async (
    _currentState: { success: boolean; error: string | null },
    data: StudentSchemaInput
) => {
    const { userId } = await auth()

    if (!userId) {
        return { success: false, error: "Utilisateur non authentifié" }
    }

    if (!data.id) {
        return { success: false, error: "Student ID is required" }
    }

    const clerk = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY!,
    })

    try {
        const { parentId, classId, gradeId } = data

        // 🔍 Student existant
        const existingStudent = await prisma.student.findUnique({
            where: { id: data.id },
        })

        if (!existingStudent) {
            return { success: false, error: "Élève introuvable." }
        }

        // ✅ Vérifier parent
        if (parentId) {
            const parentExists = await prisma.parent.findUnique({
                where: { id: parentId },
            })

            if (!parentExists) {
                return {
                    success: false,
                    error: "Parent introuvable.",
                }
            }
        }

        // ✅ Vérifier classe
        if (classId) {
            const classExists = await prisma.class.findUnique({
                where: { id: classId },
            })

            if (!classExists) {
                return {
                    success: false,
                    error: "Classe introuvable.",
                }
            }
        }

        // ✅ Vérifier grade
        if (gradeId) {
            const gradeExists = await prisma.grade.findUnique({
                where: { id: gradeId },
            })

            if (!gradeExists) {
                return {
                    success: false,
                    error: "Niveau introuvable.",
                }
            }
        }

        // 🔥 BEFORE (audit)
        const before = {
            username: existingStudent.username,
            name: existingStudent.name,
            surname: existingStudent.surname,
            classId: existingStudent.classId,
            gradeId: existingStudent.gradeId,
            parentId: existingStudent.parentId,
        }

        // 🔐 Clerk update
        await clerk.users.updateUser(data.id!, {
            username: data.username,
            ...(data.password && { password: data.password }),
            firstName: data.name,
            lastName: data.surname,
        })

        // 🔐 UserProfile update
        await prisma.userProfile.update({
            where: { id: existingStudent.userProfileId },
            data: {
                username: data.username,
                firstName: data.name,
                lastName: data.surname,
            },
        })

        const { token, expiresAt } = generateCardData();
        const cardNumber = await generateUniqueCardNumber();

        // 🔥 Student update (SAFE CONNECT)
        const student = await prisma.student.update({
            where: { id: data.id },
            data: {
                username: data.username,
                name: data.name,
                surname: data.surname,
                verificationToken: token,
                cardExpiresAt: expiresAt,
                cardNumber,
                email: data.email || null,
                phone: data.phone || null,
                address: data.address,
                image: data.image || null,
                bloodType: data.bloodType,
                sex: data.sex,
                birthday: data.birthday ?? null,

                ...(parentId && {
                    parent: { connect: { id: parentId } },
                }),

                ...(classId && {
                    class: { connect: { id: classId } },
                }),

                ...(gradeId && {
                    grade: { connect: { id: gradeId } },
                }),
            },
        })

        // 🔍 Actor (audit)
        const actor = await prisma.userProfile.findUnique({
            where: { clerkId: userId },
        })

        if (!actor) throw new Error("UserProfile introuvable")

        // 🔥 AFTER (audit)
        const after = {
            username: student.username,
            name: student.name,
            surname: student.surname,
            classId: student.classId,
            gradeId: student.gradeId,
            parentId: student.parentId,
        }

        // 🧾 AUDIT LOG
        await logAction({
            action: AuditAction.UPDATE_STUDENT,
            entityType: "Student",
            entityId: data.id,

            performedById: actor.id,
            role: actor.role,

            description: `Élève ${student.name} mis à jour`,

            before,
            after,

            metadata: {
                source: "updateStudent",
            },
        })

        return { success: true, error: null }

    } catch (error) {
        // console.log("updateStudent error:", error)

        return {
            success: false,
            error: "Une erreur est survenue lors de la mise à jour de l'élève.",
        }
    }
}



// Delete Student Action
export const deleteStudent = async (
    _currentState: currentState,
    data: FormData
) => {
    const { userId } = await auth()

    const id = data.get("id") as string

    try {
        const student = await prisma.student.findUnique({
            where: { id },
        })

        if (!student) {
            return { success: false, error: "Élève introuvable." }
        }

        const before = {
            username: student.username,
            classId: student.classId,
            gradeId: student.gradeId,
            parentId: student.parentId,
        }

        await prisma.$transaction(async (tx) => {
            await tx.student.update({
                where: { id },
                data: {
                    isDeleted: true,
                    deletedAt: new Date(),
                },
            })

            await tx.userProfile.update({
                where: { id: student.userProfileId },
                data: {
                    isActive: false,
                    isBanned: true,
                },
            })
        })

        const actor = await prisma.userProfile.findUnique({
            where: { clerkId: userId! },
        })

        if (!actor) throw new Error("UserProfile introuvable")

        await logAction({
            action: AuditAction.DELETE_STUDENT,
            entityType: "Student",
            entityId: id,

            performedById: actor.id,
            role: actor.role,

            description: `Élève supprimé`,

            before,
            after: null,

            metadata: {
                source: "deleteStudent",
            },

            isSoftDelete: true,
        })

        return { success: true, error: null }
    } catch {
        return {
            success: false,
            error: "Erreur lors de la suppression.",
        }
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
            }
        });
        return { success: true, error: null }

    } catch (error) {
        // console.log(error)
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
        // console.log(error)
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
        // console.log(error)
        return { success: false, error: "Une erreur est survenue lors de la suppression de l'examen." };
    }
};

// Create Parent Action
export const createParent = async (
    _currentState: { success: boolean; error: string | null },
    data: ParentSchemaInput
) => {
    const { userId } = await auth()

    let userIdCreated: string | null = null

    const clerk = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY!,
    })

    try {
        const user = await clerk.users.createUser({
            username: data.username,
            password: data.password,
            firstName: data.name,
            lastName: data.surname,
            publicMetadata: {
                role: "parent",
                status: "active",
            },
        })

        userIdCreated = user.id

        const result = await prisma.$transaction(async (tx) => {
            const profile = await tx.userProfile.create({
                data: {
                    clerkId: user.id,
                    role: "PARENT",
                    username: data.username,
                    firstName: data.name,
                    lastName: data.surname,
                    isActive: true,
                    isBanned: false,
                },
            })

            const parent = await tx.parent.create({
                data: {
                    id: user.id,
                    username: data.username,
                    name: data.name,
                    surname: data.surname,
                    email: data.email || null,
                    phone: data.phone,
                    address: data.address,
                    image: data.image || null,
                    sex: data.sex,
                    birthday: data.birthday ?? null,
                    userProfile: {
                        connect: { id: profile.id },
                    },
                },
            })

            return { parent, profile }
        })

        // 🔥 récupérer userProfile (admin qui crée)
        const actor = await prisma.userProfile.findUnique({
            where: { clerkId: userId! },
        })

        if (!actor) throw new Error("UserProfile introuvable")

        // ✅ AUDIT
        await logAction({
            action: AuditAction.CREATE_PARENT,
            entityType: "Parent",
            entityId: result.parent.id,

            performedById: actor.id,
            role: actor.role,

            description: `Parent ${result.parent.name} créé`,

            before: null,

            after: {
                username: result.parent.username,
                email: result.parent.email,
                phone: result.parent.phone,
            },

            metadata: {
                source: "createParent",
            },
        })

        return { success: true, error: null }
    } catch (error) {
        if (userIdCreated) {
            await clerk.users.deleteUser(userIdCreated)
        }

        return {
            success: false,
            error: "Une erreur est survenue lors de la création du parent.",
        }
    }
}

// Update Parent Action
export const updateParent = async (
    _currentState: { success: boolean; error: string | null },
    data: ParentSchemaInput
) => {
    const { userId } = await auth()

    if (!data.id) {
        return { success: false, error: "ID manquant" }
    }

    const clerk = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY!,
    })

    try {
        const existingParent = await prisma.parent.findUnique({
            where: { id: data.id },
        })

        if (!existingParent) {
            return { success: false, error: "Parent introuvable." }
        }

        const before = {
            username: existingParent.username,
            name: existingParent.name,
            surname: existingParent.surname,
            email: existingParent.email,
            phone: existingParent.phone,
        }

        await prisma.$transaction(async (tx) => {
            await clerk.users.updateUser(data.id!, {
                username: data.username,
                ...(data.password && { password: data.password }),
                firstName: data.name,
                lastName: data.surname,
            })

            await tx.userProfile.update({
                where: { id: existingParent.userProfileId },
                data: {
                    username: data.username,
                    firstName: data.name,
                    lastName: data.surname,
                },
            })

            await tx.parent.update({
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
            })
        })

        const actor = await prisma.userProfile.findUnique({
            where: { clerkId: userId! },
        })

        if (!actor) throw new Error("UserProfile introuvable")

        const after = {
            username: data.username,
            name: data.name,
            surname: data.surname,
            email: data.email,
            phone: data.phone,
        }

        await logAction({
            action: AuditAction.UPDATE_PARENT,
            entityType: "Parent",
            entityId: data.id,

            performedById: actor.id,
            role: actor.role,

            description: `Parent ${data.name} mis à jour`,

            before,
            after,

            metadata: {
                source: "updateParent",
            },
        })

        return { success: true, error: null }
    } catch {
        return {
            success: false,
            error: "Une erreur est survenue lors de la mise à jour du parent.",
        }
    }
}

// Delete Parent Action
export const deleteParent = async (
    _currentState: currentState,
    data: FormData
) => {
    const { userId } = await auth()

    const id = data.get("id") as string

    try {
        const parent = await prisma.parent.findUnique({
            where: { id },
        })

        if (!parent) {
            return { success: false, error: "Parent introuvable." }
        }

        const before = {
            username: parent.username,
            email: parent.email,
            phone: parent.phone,
        }

        await prisma.$transaction(async (tx) => {
            await tx.parent.update({
                where: { id },
                data: {
                    isDeleted: true,
                    deletedAt: new Date(),
                },
            })

            await tx.userProfile.update({
                where: { id: parent.userProfileId },
                data: {
                    isActive: false,
                    isBanned: true,
                },
            })
        })

        const actor = await prisma.userProfile.findUnique({
            where: { clerkId: userId! },
        })

        if (!actor) throw new Error("UserProfile introuvable")

        await logAction({
            action: AuditAction.DELETE_PARENT,
            entityType: "Parent",
            entityId: id,

            performedById: actor.id,
            role: actor.role,

            description: `Parent supprimé`,

            before,
            after: null,

            metadata: {
                source: "deleteParent",
            },

            isSoftDelete: true,
        })

        return { success: true, error: null }
    } catch {
        return {
            success: false,
            error: "Une erreur est survenue lors de la suppression du parent.",
        }
    }
}

// helper
function isValidRole(role: any): role is Role {
    return ["SUPER_ADMIN", "ADMIN", "TEACHER", "PARENT", "STUDENT"].includes(role)
}

// Create Lesson Action
export const createLesson = async (
    _currentState: { success: boolean; error: string | null },
    data: LessonSchemaInput
) => {
    const { userId, sessionClaims } = await auth()

    const rawRole = (sessionClaims?.metadata as { role?: string })?.role
    const role = isValidRole(rawRole) ? rawRole : undefined

    try {
        if (!userId) {
            return { success: false, error: "Utilisateur non authentifié." }
        }

        const teacherId = role === "TEACHER" ? userId : data.teacherId

        if (!teacherId) {
            return { success: false, error: "Aucun enseignant spécifié." }
        }

        const startDate = new Date(data.startDate)
        const dueDate = new Date(data.dueDate)

        if (startDate >= dueDate) {
            return {
                success: false,
                error: "La date de fin doit être après la date de début.",
            }
        }

        const isAssigned = await prisma.teacherClass.findFirst({
            where: {
                teacherId,
                classId: data.classId,
            },
        })

        if (!isAssigned) {
            return {
                success: false,
                error: "Cet enseignant n’est pas assigné à cette classe.",
            }
        }

        // récupérer le cours
        const lesson = await prisma.lesson.create({
            data: {
                name: data.name,
                startDate,
                dueDate,
                subjectId: data.subjectId,
                classId: data.classId,
                teacherId,
            },
        });


        const userProfile = await prisma.userProfile.findUnique({
            where: { clerkId: userId },
        })

        if (!userProfile) {
            throw new Error("UserProfile introuvable")
        }

        // ✅ LOG propre
        await logAction({
            action: AuditAction.CREATE_LESSON,
            entityType: "Lesson",
            entityId: lesson.id.toString(),

            performedById: userProfile.id,
            role: userProfile.role,

            description: `Le cours ${lesson.name} a été créé avec succès`,

            before: null,

            after: {
                name: lesson.name,
                subjectId: lesson.subjectId,
                classId: lesson.classId,
            },

            metadata: {
                source: "createLesson",
            },
        })

        return { success: true, error: null }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            error: "Une erreur est survenue lors de la création du cours.",
        }
    }
}

// Update Lesson
export const updateLesson = async (
    _currentState: { success: boolean; error: string | null },
    data: LessonSchemaInput
) => {
    const { userId, sessionClaims } = await auth()

    const rawRole = (sessionClaims?.metadata as { role?: string })?.role
    const role = isValidRole(rawRole) ? rawRole : undefined

    try {
        if (!userId) {
            return { success: false, error: "Utilisateur non authentifié." }
        }

        if (!data.id) {
            return { success: false, error: "ID du cours manquant." }
        }

        const teacherId = role === "TEACHER" ? userId : data.teacherId

        if (!teacherId) {
            return { success: false, error: "Aucun enseignant spécifié." }
        }

        // 🔥 1️⃣ récupérer ancien lesson (IMPORTANT)
        const oldLesson = await prisma.lesson.findUnique({
            where: { id: data.id },
        })

        if (!oldLesson) {
            return { success: false, error: "Cours introuvable." }
        }

        // 🔒 sécurité teacher
        if (role === "TEACHER" && oldLesson.teacherId !== userId) {
            return {
                success: false,
                error: "Vous ne pouvez modifier que vos propres cours.",
            }
        }

        const startDate = new Date(data.startDate)
        const dueDate = new Date(data.dueDate)

        if (startDate >= dueDate) {
            return {
                success: false,
                error: "La date de fin doit être après la date de début.",
            }
        }

        const isAssigned = await prisma.teacherClass.findFirst({
            where: {
                teacherId,
                classId: data.classId,
            },
        })

        if (!isAssigned) {
            return {
                success: false,
                error: "Cet enseignant n’est pas assigné à cette classe.",
            }
        }

        // 🔥 2️⃣ update
        const updatedLesson = await prisma.lesson.update({
            where: { id: data.id },
            data: {
                name: data.name,
                startDate,
                dueDate,
                subjectId: data.subjectId,
                classId: data.classId,
                teacherId,
            },
        })

        // 🔥 3️⃣ récupérer userProfile
        const userProfile = await prisma.userProfile.findUnique({
            where: { clerkId: userId },
        })

        if (!userProfile) {
            throw new Error("UserProfile introuvable")
        }

        // 🔥 4️⃣ construire diff (ULTRA IMPORTANT)
        const before = {
            name: oldLesson.name,
            startDate: oldLesson.startDate,
            dueDate: oldLesson.dueDate,
            subjectId: oldLesson.subjectId,
            classId: oldLesson.classId,
            teacherId: oldLesson.teacherId,
        }

        const after = {
            name: updatedLesson.name,
            startDate: updatedLesson.startDate,
            dueDate: updatedLesson.dueDate,
            subjectId: updatedLesson.subjectId,
            classId: updatedLesson.classId,
            teacherId: updatedLesson.teacherId,
        }

        // 🔥 5️⃣ log audit
        await logAction({
            action: AuditAction.UPDATE_LESSON,
            entityType: "Lesson",
            entityId: updatedLesson.id.toString(),

            performedById: userProfile.id,
            role: userProfile.role,

            description: `Le cours ${updatedLesson.name} a été mis à jour`,

            before,
            after,

            metadata: {
                source: "updateLesson",
            },
        })

        return { success: true, error: null }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            error: "Une erreur est survenue lors de la mise à jour du cours.",
        }
    }
}

// Delete Lesson Action
export const deleteLesson = async (
    _currentState: { success: boolean; error: string | null },
    data: FormData
) => {
    const { userId, sessionClaims } = await auth()

    const rawRole = (sessionClaims?.metadata as { role?: string })?.role
    const role = isValidRole(rawRole) ? rawRole : undefined

    const id = parseInt(data.get("id") as string)

    try {
        if (!userId) {
            return { success: false, error: "Utilisateur non authentifié." }
        }

        // récupérer le lesson AVANT suppression
        const lesson = await prisma.lesson.findUnique({
            where: { id },
        })

        if (!lesson) {
            return { success: false, error: "Cours introuvable." }
        }

        // sécurité teacher
        if (role === "TEACHER" && lesson.teacherId !== userId) {
            return { success: false, error: "Action non autorisée." }
        }

        // Récupérer userProfile
        const userProfile = await prisma.userProfile.findUnique({
            where: { clerkId: userId },
        })

        if (!userProfile) {
            throw new Error("UserProfile introuvable")
        }

        // Snapshot BEFORE
        const before = {
            id: lesson.id,
            name: lesson.name,
            startDate: lesson.startDate,
            dueDate: lesson.dueDate,
            subjectId: lesson.subjectId,
            classId: lesson.classId,
            teacherId: lesson.teacherId,
        }

        // DELETE 
        await prisma.lesson.delete({
            where: { id },
            // data: {
            //     isDeleted: true,
            //     deletedAt: new Date(),
            // },
        })

        // LOG audit
        await logAction({
            action: AuditAction.DELETE_LESSON,
            entityType: "Lesson",
            entityId: id.toString(),

            performedById: userProfile.id,
            role: userProfile.role,

            description: `Le cours ${lesson.name} a été supprimé`,

            before,       // ✅ snapshot complet
            after: null,  // ✅ logique pour delete

            metadata: {
                source: "deleteLesson",
                reason: "manual_delete",
            },

            isSoftDelete: true,
        })

        return { success: true, error: null }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            error: "Une erreur est survenue lors de la suppression du cours.",
        }
    }
}

// Create Session Action
export const createSession = async (
    currentState: currentState,
    data: SessionSchemaInput
): Promise<currentState> => {
    try {
        const { userId, sessionClaims } = await auth();
        const role = (sessionClaims?.metadata as { role?: string })?.role;

        if (!userId || !role) {
            return { success: false, error: "Non autorisé." };
        }

        if (!["super_admin", "admin", "teacher"].includes(role)) {
            return { success: false, error: "Rôle interdit." };
        }

        // ✅ Normaliser la date (jour pur)
        const baseDate = new Date(data.date);
        baseDate.setHours(0, 0, 0, 0);

        // ✅ Extraire heures une seule fois
        const startInput = new Date(data.startTime);
        const endInput = new Date(data.endTime);

        // ✅ Construire heures liées au jour
        const startTime = new Date(baseDate);
        startTime.setHours(startInput.getHours(), startInput.getMinutes(), 0, 0);

        const endTime = new Date(baseDate);
        endTime.setHours(endInput.getHours(), endInput.getMinutes(), 0, 0);

        if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
            return { success: false, error: "Heure invalide." };
        }

        if (endTime <= startTime) {
            return {
                success: false,
                error: "L'heure de fin doit être après l'heure de début.",
            };
        }

        // ✅ Récupérer le lesson
        const lesson = await prisma.lesson.findUnique({
            where: { id: data.lessonId },
        });

        if (!lesson) {
            return {
                success: false,
                error: "La leçon sélectionnée est introuvable.",
            };
        }

        // 👨‍🏫 Vérification ownership
        if (role === "teacher" && lesson.teacherId !== userId) {
            return {
                success: false,
                error: "Ce cours ne vous appartient pas.",
            };
        }

        // ✅ Normaliser aussi les dates du lesson
        const lessonStart = lesson.startDate
            ? new Date(lesson.startDate)
            : null;

        const lessonEnd = lesson.dueDate
            ? new Date(lesson.dueDate)
            : null;

        lessonStart?.setHours(0, 0, 0, 0);
        lessonEnd?.setHours(23, 59, 59, 999);

        if (!lessonStart || !lessonEnd || baseDate < lessonStart || baseDate > lessonEnd) {
            return {
                success: false,
                error: "La date de la séance est hors de la période du cours.",
            };
        }

        // ✅ Définir la journée
        const startOfDay = new Date(baseDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(baseDate);
        endOfDay.setHours(23, 59, 59, 999);

        // 🚫 Vérifier conflits
        const conflict = await prisma.session.findFirst({
            where: {
                isDeleted: false,

                date: {
                    gte: startOfDay,
                    lte: endOfDay,
                },

                AND: [
                    { startTime: { lt: endTime } },
                    { endTime: { gt: startTime } },
                ],

                OR: [
                    { teacherId: lesson.teacherId },
                    { classId: lesson.classId },
                ],
            },
        });

        if (conflict) {
            return {
                success: false,
                error:
                    "Conflit : le professeur ou la classe a déjà une séance à cette heure.",
            };
        }

        // ✅ Création
        const createdSession = await prisma.session.create({
            data: {
                date: baseDate,
                startTime,
                endTime,
                room: data.room ?? null,
                lessonId: data.lessonId,
                teacherId: lesson.teacherId,
                classId: lesson.classId,
                isDeleted: false,
            },
        })

        // 🔥 récupérer userProfile
        const userProfile = await prisma.userProfile.findUnique({
            where: { clerkId: userId },
        })

        if (!userProfile) throw new Error("UserProfile introuvable")

        // 🔥 AUDIT
        await logAction({
            action: AuditAction.CREATE_SESSION,
            entityType: "Session",
            entityId: createdSession.id,

            performedById: userProfile.id,
            role: userProfile.role,

            description: `Séance créée (${createdSession.startTime.toISOString()})`,

            before: null,

            after: {
                date: createdSession.date,
                startTime: createdSession.startTime,
                endTime: createdSession.endTime,
                room: createdSession.room,
                lessonId: createdSession.lessonId,
                classId: createdSession.classId,
            },

            metadata: {
                source: "createSession",
                teacherId: createdSession.teacherId,
            },
        })

        // console.log("Session créée :", createdSession.id);

        return { success: true, error: null };
    } catch (error) {
        console.error("createSession error:", error);
        return { success: false, error: "Erreur serveur." };
    }
};

// Update Session Action
export const updateSession = async (
    currentState: currentState,
    data: SessionSchemaInput
): Promise<currentState> => {
    try {
        const { userId, sessionClaims } = await auth();
        const role = (sessionClaims?.metadata as { role?: string })?.role;

        if (!userId || !role) {
            return { success: false, error: "Non autorisé." };
        }

        if (!["super_admin", "admin", "teacher"].includes(role)) {
            return { success: false, error: "Rôle interdit." };
        }

        if (!data.id) {
            return { success: false, error: "ID de la session manquant." };
        }

        // ✅ Récupérer session
        const session = await prisma.session.findUnique({
            where: { id: data.id },
            include: { lesson: true },
        });

        if (!session || session.isDeleted) {
            return { success: false, error: "Séance introuvable." };
        }

        const lesson = session.lesson;

        // 👨‍🏫 Ownership
        if (role === "teacher" && lesson.teacherId !== userId) {
            return {
                success: false,
                error: "Cette séance ne vous appartient pas.",
            };
        }

        // ✅ Normaliser date
        const baseDate = new Date(data.date);
        baseDate.setHours(0, 0, 0, 0);

        // ✅ Extraire heures
        const startInput = new Date(data.startTime);
        const endInput = new Date(data.endTime);

        const startTime = new Date(baseDate);
        startTime.setHours(startInput.getHours(), startInput.getMinutes(), 0, 0);

        const endTime = new Date(baseDate);
        endTime.setHours(endInput.getHours(), endInput.getMinutes(), 0, 0);

        if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
            return { success: false, error: "Heure invalide." };
        }

        if (endTime <= startTime) {
            return {
                success: false,
                error: "L'heure de fin doit être après l'heure de début.",
            };
        }

        // ✅ Normaliser période lesson
        const lessonStart = lesson.startDate
            ? new Date(lesson.startDate)
            : null;

        const lessonEnd = lesson.dueDate
            ? new Date(lesson.dueDate)
            : null;

        lessonStart?.setHours(0, 0, 0, 0);
        lessonEnd?.setHours(23, 59, 59, 999);

        if (!lessonStart || !lessonEnd || baseDate < lessonStart || baseDate > lessonEnd) {
            return {
                success: false,
                error:
                    "La date de la séance doit être comprise dans la période du cours.",
            };
        }

        // ✅ Intervalle journée
        const startOfDay = new Date(baseDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(baseDate);
        endOfDay.setHours(23, 59, 59, 999);

        // 🚫 Vérifier conflits (exclure session actuelle)
        const conflict = await prisma.session.findFirst({
            where: {
                id: { not: data.id },
                isDeleted: false,

                date: {
                    gte: startOfDay,
                    lte: endOfDay,
                },

                AND: [
                    { startTime: { lt: endTime } },
                    { endTime: { gt: startTime } },
                ],

                OR: [
                    { teacherId: lesson.teacherId },
                    { classId: lesson.classId },
                ],
            },
        });

        if (conflict) {
            return {
                success: false,
                error:
                    "Conflit : la classe ou l’enseignant a déjà une séance à cette heure.",
            };
        }

        // 🔥 récupérer userProfile
        const userProfile = await prisma.userProfile.findUnique({
            where: { clerkId: userId },
        })

        if (!userProfile) throw new Error("UserProfile introuvable")

        // 🔥 BEFORE
        const before = {
            date: session.date,
            startTime: session.startTime,
            endTime: session.endTime,
            room: session.room,
        }

        // ✅ update
        const updatedSession = await prisma.session.update({
            where: { id: data.id },
            data: {
                date: baseDate,
                startTime,
                endTime,
                room: data.room ?? null,
            },
        })

        // 🔥 AFTER
        const after = {
            date: updatedSession.date,
            startTime: updatedSession.startTime,
            endTime: updatedSession.endTime,
            room: updatedSession.room,
        }

        // 🔥 AUDIT
        await logAction({
            action: AuditAction.UPDATE_SESSION,
            entityType: "Session",
            entityId: updatedSession.id,

            performedById: userProfile.id,
            role: userProfile.role,

            description: `Séance modifiée`,

            before,
            after,

            metadata: {
                source: "updateSession",
                teacherId: updatedSession.teacherId,
            },
        })

        return { success: true, error: null };
    } catch (error) {
        console.log("updateSession error:", error);
        return { success: false, error: "Erreur serveur." };
    }
};

// Delete Session Action
export const deleteSession = async (
    currentState: currentState,
    formData: FormData
): Promise<currentState> => {
    try {
        const { userId, sessionClaims } = await auth();
        const role = (sessionClaims?.metadata as { role?: string })?.role;

        const id = formData.get("id") as string

        if (!id) {
            return { success: false, error: "ID invalide" }
        }

        if (!userId || !role) {
            return { success: false, error: "Non autorisé." };
        }

        if (!["super_admin", "admin", "teacher"].includes(role)) {
            return { success: false, error: "Rôle interdit." };
        }

        const session = await prisma.session.findUnique({
            where: { id },
            include: {
                lesson: true,
                attendances: {
                    where: {
                        isDeleted: false,
                    },
                },
            }
            // include: {
            //     lesson: true,
            //     attendances: true,
            // },
        });

        if (!session || session.isDeleted) {
            return { success: false, error: "Séance introuvable." };
        }

        // 👨‍🏫 Ownership check
        if (role === "teacher" && session.lesson.teacherId !== userId) {
            return {
                success: false,
                error: "Cette séance ne vous appartient pas.",
            };
        }

        // 🚨 Empêcher suppression si des présences existent
        if (session.attendances.length > 0) {
            return {
                success: false,
                error:
                    "Impossible de supprimer cette séance car des présences y sont liées.",
            };
        }

        // 🔥 récupérer userProfile
        const userProfile = await prisma.userProfile.findUnique({
            where: { clerkId: userId },
        })

        if (!userProfile) throw new Error("UserProfile introuvable")

        // 🔥 BEFORE
        const before = {
            date: session.date,
            startTime: session.startTime,
            endTime: session.endTime,
            room: session.room,
            lessonId: session.lessonId,
            classId: session.classId,
        }

        // ✅ soft delete
        await prisma.session.update({
            where: { id },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        })

        // 🔥 AUDIT
        await logAction({
            action: AuditAction.DELETE_SESSION,
            entityType: "Session",
            entityId: id,

            performedById: userProfile.id,
            role: userProfile.role,

            description: `Séance supprimée`,

            before,
            after: null,

            metadata: {
                source: "deleteSession",
                teacherId: session.teacherId,
            },

            isSoftDelete: true,
        })

        return { success: true, error: null };
    } catch (error) {
        console.log("deleteSession error:", error);
        return { success: false, error: "Erreur serveur." };
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
        // console.error("Create Assignment Error ❌", error);
        return { success: false, error: "Erreur lors de la création" };
    }
};

// Update Assignment Action
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
        // console.error("Update Assignment Error ❌", error);
        return { success: false, error: "Erreur lors de la mise à jour" };
    }
};

// Delete Assignment Action
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
        // console.log(error)
        return { success: false, error: "Une erreur est survenue lors de la suppression du devoir." };
    }
};

// Create Result Action
export const createResult = async (
    currentState: currentState,
    data: ResultSchemaInput
) => {
    const { userId } = await auth()

    try {
        if (!userId) {
            return {
                success: false,
                error: "Utilisateur non authentifié",
            }
        }

        const userProfile = await prisma.userProfile.findUnique({
            where: { clerkId: userId },
        })

        if (!userProfile || userProfile.role !== "TEACHER") {
            return {
                success: false,
                error: "Seul un enseignant peut enregistrer une note",
            }
        }

        const lesson = await prisma.lesson.findFirst({
            where: {
                teacherId: userId,
                OR: [
                    { exams: { some: { id: data.examId ?? undefined } } },
                    { assignments: { some: { id: data.assignmentId ?? undefined } } },
                ],
            },
        })

        if (!lesson) {
            return { success: false, error: "Accès refusé à cette leçon" }
        }

        const result = await prisma.result.create({
            data: {
                score: data.score,
                studentId: data.studentId,
                examId: data.examId ? Number(data.examId) : null,
                assignmentId: data.assignmentId ? Number(data.assignmentId) : null,
            },
        })

        // 🔥 LOG
        await logAction({
            action: AuditAction.CREATE_RESULT,
            entityType: "Result",
            entityId: result.id.toString(),

            performedById: userProfile.id,
            role: userProfile.role,

            description: `Note ajoutée (${result.score})`,

            before: null,

            after: {
                score: result.score,
                studentId: result.studentId,
                examId: result.examId,
                assignmentId: result.assignmentId,
            },

            metadata: {
                source: "createResult",
            },
        })

        return { success: true, error: null }
    } catch (error) {
        console.error(error)
        return {
            success: false,
            error: "Erreur lors de l'enregistrement de la note",
        }
    }
}

// Update Result Action
export const updateResult = async (
    _currentState: { success: boolean; error: string | null },
    data: ResultSchemaInput
) => {
    const { userId } = await auth()

    try {
        if (!userId) {
            return {
                success: false,
                error: "Utilisateur non authentifié",
            }
        }

        const userProfile = await prisma.userProfile.findUnique({
            where: { clerkId: userId },
        })

        if (!userProfile || userProfile.role !== "TEACHER") {
            return {
                success: false,
                error: "Seul un enseignant peut modifier une note",
            }
        }

        if (!data.id) {
            return { success: false, error: "ID manquant" }
        }

        const existingResult = await prisma.result.findUnique({
            where: { id: data.id },
            include: {
                exam: { include: { lesson: true } },
                assignment: { include: { lesson: true } },
            },
        })

        if (!existingResult) {
            return { success: false, error: "Note introuvable" }
        }

        const lesson =
            existingResult.exam?.lesson ||
            existingResult.assignment?.lesson

        if (!lesson || lesson.teacherId !== userId) {
            return { success: false, error: "Accès refusé" }
        }

        // 🔥 BEFORE
        const before = {
            score: existingResult.score,
        }

        const updatedResult = await prisma.result.update({
            where: { id: data.id },
            data: {
                score: data.score,
            },
        })

        // 🔥 AFTER
        const after = {
            score: updatedResult.score,
        }

        await logAction({
            action: AuditAction.UPDATE_RESULT,
            entityType: "Result",
            entityId: updatedResult.id.toString(),

            performedById: userProfile.id,
            role: userProfile.role,

            description: `Note modifiée (${updatedResult.score})`,

            before,
            after,

            metadata: {
                source: "updateResult",
            },
        })

        return { success: true, error: null }
    } catch (error) {
        console.error(error)
        return {
            success: false,
            error: "Erreur lors de la modification",
        }
    }
}

// Delete Result Action
export const deleteResult = async (
    currentState: currentState,
    formData: FormData
) => {
    const { userId } = await auth()

    try {
        if (!userId) {
            return {
                success: false,
                error: "Utilisateur non authentifié",
            }
        }

        const userProfile = await prisma.userProfile.findUnique({
            where: { clerkId: userId },
        })

        if (!userProfile || userProfile.role !== "TEACHER") {
            return {
                success: false,
                error: "Seul un enseignant peut supprimer une note",
            }
        }

        const id = Number(formData.get("id"))

        if (!id) {
            return { success: false, error: "ID invalide" }
        }

        const existingResult = await prisma.result.findUnique({
            where: { id },
            include: {
                exam: { include: { lesson: true } },
                assignment: { include: { lesson: true } },
            },
        })

        if (!existingResult) {
            return { success: false, error: "Note introuvable" }
        }

        const lesson =
            existingResult.exam?.lesson ||
            existingResult.assignment?.lesson

        if (!lesson || lesson.teacherId !== userId) {
            return { success: false, error: "Accès refusé" }
        }

        // 🔥 BEFORE snapshot
        const before = {
            score: existingResult.score,
            studentId: existingResult.studentId,
            examId: existingResult.examId,
            assignmentId: existingResult.assignmentId,
        }

        await prisma.result.delete({
            where: { id },
        })

        await logAction({
            action: AuditAction.DELETE_RESULT,
            entityType: "Result",
            entityId: id.toString(),

            performedById: userProfile.id,
            role: userProfile.role,

            description: `Note supprimée (${existingResult.score})`,

            before,
            after: null,

            metadata: {
                source: "deleteResult",
                studentId: existingResult.studentId,
                examId: existingResult.examId,
                assignmentId: existingResult.assignmentId,
            },

            isSoftDelete: false,
        })

        return { success: true, error: null }
    } catch (error) {
        console.error(error)
        return {
            success: false,
            error: "Erreur lors de la suppression",
        }
    }
}

// Create attendance
export const createAttendance = async (
    _currentState: { success: boolean; error: string | null },
    data: AttendanceSchemaInput
) => {
    try {
        const { userId } = await auth()

        if (!userId) {
            return { success: false, error: "Non autorisé" }
        }

        const userProfile = await prisma.userProfile.findUnique({
            where: { clerkId: userId },
        })

        if (!userProfile) {
            throw new Error("UserProfile introuvable")
        }

        const role = userProfile.role

        if (!["TEACHER", "ADMIN", "SUPER_ADMIN"].includes(role)) {
            return { success: false, error: "Rôle interdit" }
        }

        const session = await prisma.session.findUnique({
            where: { id: data.sessionId },
            include: {
                lesson: { include: { class: true } },
            },
        })

        if (!session) {
            return { success: false, error: "Séance introuvable" }
        }

        if (role === "TEACHER" && session.teacherId !== userId) {
            return { success: false, error: "Cette séance ne vous appartient pas" }
        }

        const student = await prisma.student.findUnique({
            where: { id: data.studentId },
        })

        if (!student) {
            return { success: false, error: "Élève introuvable" }
        }

        if (student.classId !== session.lesson.classId) {
            return { success: false, error: "Élève non inscrit dans cette classe" }
        }

        const attendance = await prisma.attendance.create({
            data: {
                studentId: data.studentId,
                sessionId: data.sessionId,
                status: data.status,
                comment: data.comment ?? null,
                proofUrl: data.proofUrl ?? null,
                createdBy:
                    role === "PARENT"
                        ? "PARENT"
                        : role === "TEACHER"
                            ? "TEACHER"
                            : "ADMIN",
            },
        })

        // 🔥 AUDIT
        await logAction({
            action: AuditAction.CREATE_ATTENDANCE,
            entityType: "Attendance",
            entityId: attendance.id.toString(),

            performedById: userProfile.id,
            role: userProfile.role,

            description: `Absence enregistrée (${attendance.status})`,

            before: null,

            after: {
                studentId: attendance.studentId,
                sessionId: attendance.sessionId,
                status: attendance.status,
            },

            metadata: {
                source: "createAttendance",
                studentId: attendance.studentId,
                sessionId: attendance.sessionId,
            },
        })

        return { success: true, error: null }
    } catch (error) {
        console.log(error)
        return { success: false, error: "Erreur serveur" }
    }
}

// Update attendance
export const updateAttendance = async (
    currentState: currentState,
    data: AttendanceSchemaInput
): Promise<currentState> => {
    const { userId } = await auth()

    if (!userId || !data.id) {
        return { success: false, error: "Non autorisé." }
    }

    try {
        const userProfile = await prisma.userProfile.findUnique({
            where: { clerkId: userId },
        })

        if (!userProfile) throw new Error("UserProfile introuvable")

        const role = userProfile.role

        const attendance = await prisma.attendance.findUnique({
            where: { id: data.id },
            include: {
                session: {
                    include: {
                        lesson: { select: { teacherId: true } },
                    },
                },
            },
        })

        if (!attendance) {
            return { success: false, error: "Présence introuvable." }
        }

        if (attendance.isDeleted) {
            return { success: false, error: "Cette absence est supprimée." }
        }

        if (role === "PARENT") {
            return {
                success: false,
                error: "Un parent ne peut pas modifier une présence.",
            }
        }

        if (
            role === "TEACHER" &&
            attendance.session?.lesson.teacherId !== userId
        ) {
            return { success: false, error: "Accès refusé." }
        }

        const before = {
            status: attendance.status,
            comment: attendance.comment,
            proofUrl: attendance.proofUrl,
        }

        const updated = await prisma.attendance.update({
            where: { id: data.id },
            data: {
                status: data.status ?? attendance.status,
                comment: data.comment ?? null,
                proofUrl: data.proofUrl ?? null,
            },
        })

        const after = {
            status: updated.status,
            comment: updated.comment,
            proofUrl: updated.proofUrl,
        }

        await logAction({
            action: AuditAction.UPDATE_ATTENDANCE,
            entityType: "Attendance",
            entityId: updated.id.toString(),

            performedById: userProfile.id,
            role: userProfile.role,

            description: `Présence modifiée (${updated.status})`,

            before,
            after,

            metadata: {
                source: "updateAttendance",
                studentId: updated.studentId,
                sessionId: updated.sessionId,
            },
        })

        return { success: true, error: null }
    } catch (error) {
        console.log(error)
        return { success: false, error: "Erreur serveur." }
    }
}

// Delete attendance
export const deleteAttendance = async (
    currentState: currentState,
    data: FormData
) => {
    const id = Number(data.get("id"))

    if (!id) {
        return { success: false, error: "ID invalide" }
    }

    const { userId } = await auth()

    try {
        const userProfile = await prisma.userProfile.findUnique({
            where: { clerkId: userId! },
        })

        if (!userProfile) throw new Error("UserProfile introuvable")

        const role = userProfile.role

        const attendance = await prisma.attendance.findUnique({
            where: { id },
            include: {
                session: {
                    include: {
                        lesson: { select: { teacherId: true } },
                    },
                },
            },
        })

        if (!attendance) {
            return { success: false, error: "Absence introuvable" }
        }

        if (
            role === "TEACHER" &&
            attendance.session?.lesson.teacherId !== userId
        ) {
            return {
                success: false,
                error: "Vous n'avez pas le droit",
            }
        }

        if (role === "PARENT" || role === "STUDENT") {
            return { success: false, error: "Action non autorisée" }
        }

        const before = {
            status: attendance.status,
            studentId: attendance.studentId,
            sessionId: attendance.sessionId,
        }

        await prisma.attendance.update({
            where: { id },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        })

        await logAction({
            action: AuditAction.DELETE_ATTENDANCE,
            entityType: "Attendance",
            entityId: id.toString(),

            performedById: userProfile.id,
            role: userProfile.role,

            description: `Présence supprimée (${attendance.status})`,

            before,
            after: null,

            metadata: {
                source: "deleteAttendance",
                studentId: attendance.studentId,
                sessionId: attendance.sessionId,
            },

            isSoftDelete: true,
        })

        return { success: true, error: null }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            error: "Erreur serveur lors de la suppression",
        }
    }
}

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

    // Vérifier que l'élève appartient au parent
    const student = await prisma.student.findUnique({
        where: { id: studentId },
        select: { parentId: true }
    });

    if (!student || student.parentId !== userId) {
        return {
            success: false,
            error: "Accès interdit à cet élève",
            data: [],
        };
    }

    // console.log("studentId reçu:", studentId);

    const attendances = await prisma.attendance.findMany({
        where: {
            isDeleted: false,

            // 🔥 FILTRE PRINCIPAL (OBLIGATOIRE)
            studentId: studentId,

            // 🔐 sécurité parent
            student: {
                parentId: userId!,
            },
        },

        orderBy: {
            session: {
                date: "desc",
            },
        },

        include: {
            session: {
                select: {
                    date: true,
                    startTime: true,
                    endTime: true,
                    lesson: {
                        select: { name: true },
                    },
                    class: {
                        select: { name: true },
                    },
                },
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
        // console.error("Create Announcement Error ❌", error);
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
        // console.error("Update Announcement Error ❌", error);
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
        // console.error("Delete Announcement Error ❌", error);
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
        // console.error("Create Event Error ❌", error);
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
        // console.error("Update Event Error ❌", error);
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
        // console.error("Delete Event Error ❌", error);
        return {
            success: false,
            error: "Une erreur est survenue lors de la suppression de l'annonce.",
        };
    }
};


