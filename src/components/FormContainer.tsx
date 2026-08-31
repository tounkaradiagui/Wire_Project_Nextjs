import FormModal from "./FormModal";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";


export type FormContainerProps = {
  // Le nom de la table ciblée par le formulaire, utilisé pour déterminer les champs à afficher et les données à récupérer pour les listes déroulantes
  table:
  | "teacher"
  | "student"
  | "parent"
  | "subject"
  | "class"
  | "lesson"
  | "exam"
  | "assignment"
  | "result"
  | "attendance"
  | "event"
  | "user"
  | "session"
  | "announcement"
  | "school"
  | "schoolRequest"
  | "teacherApplication"
  | "schoolProvision";
  type: "create" | "update" | "delete";
  data?: Record<string, unknown>;
  id?: number | string;
  role?: "admin" | "teacher" | "parent" | "student" | "super_admin";
};

const FormContainer = async ({ table, type, data, id, role }: FormContainerProps) => {
  let relatedData = {};

  const { userId } = await auth();

  if (!userId) {
    throw new Error("Utilisateur non authentifié.");
  }

  const actor = await prisma.userProfile.findUnique({
    where: {
      clerkId: userId,
    },
    select: {
      id: true,
      role: true,
      schoolId: true,
    },
  });

  if (!actor?.schoolId) {
    throw new Error("Aucune école associée à cet utilisateur.");
  }


  // Récupérer les données liées nécessaires pour le formulaire en fonction de la table ciblée et du type d'opération (create, update, delete), 
  // en tenant compte des rôles et permissions de l'utilisateur connecté pour filtrer les données si nécessaire
  if (type !== "delete") {
    switch (table) {
      // Données nécessaires pour les formulaires liés aux matières
      // (ex : associer un enseignant à une matière)
      case "subject": {
          const subjectTeachers = await prisma.teacher.findMany({
              where: {
                  schoolId: actor.schoolId,
                  isDeleted: false,
              },
              select: {
                  id: true,
                  name: true,
                  surname: true,
              },
              orderBy: [
                  { name: "asc" },
                  { surname: "asc" },
              ],
          });

          relatedData = {
              teachers: subjectTeachers,
          };

          break;
      }


      // Données nécessaires pour les formulaires liés aux classes
      // (ex : associer un niveau à une classe)
      case "class": {
          const classGrades = await prisma.grade.findMany({
              where: {
                  schoolId: actor.schoolId,
                  isDeleted: false,
              },
              select: {
                  id: true,
                  level: true,
                  name: true,
                  cycle: true,
              },
              orderBy: {
                  level: "asc",
              },
          });

          const classTeachers = await prisma.teacher.findMany({
              where: {
                  schoolId: actor.schoolId,
                  isDeleted: false,
              },
              select: {
                  id: true,
                  name: true,
                  surname: true,
              },
              orderBy: [
                  { name: "asc" },
                  { surname: "asc" },
              ],
          });

          relatedData = {
              teachers: classTeachers,
              grades: classGrades,
          };

          break;
      }

      // Données nécessaires pour les formulaires liés aux enseignants (ex : pour associer une matière et une classe à un enseignant)
      case "teacher": {
        const schoolId = actor?.schoolId;

        let subjects;
        let classes;

        if (role === "teacher") {

          subjects = await prisma.subject.findMany({
            where: {
              schoolId,
              isDeleted: false,
              teachers: {
                some: {
                  teacherId: userId!,
                },
              },
            },
            select: {
              id: true,
              name: true,
            },
          });

          classes = await prisma.class.findMany({
            where: {
              schoolId,
              lessons: {
                some: {
                  teacherId: userId!,
                },
              },
            },
            select: {
              id: true,
              name: true,
            },
            orderBy: {
              name: "asc",
            },
          });

        } else if (role === "admin") {

          subjects = await prisma.subject.findMany({
            where: {
              schoolId,
              isDeleted: false,
            },
            select: {
              id: true,
              name: true,
            },
          });

          classes = await prisma.class.findMany({
            where: {
              schoolId,
            },
            select: {
              id: true,
              name: true,
            },
            orderBy: {
              name: "asc",
            },
          });

        } else {

          // super_admin
          subjects = await prisma.subject.findMany({
            where: {
              isDeleted: false,
            },
            select: {
              id: true,
              name: true,
            },
          });

          classes = await prisma.class.findMany({
            select: {
              id: true,
              name: true,
            },
            orderBy: {
              name: "asc",
            },
          });

        }

        relatedData = {
          subjects,
          classes,
          schoolId,
        };

        break;
      }

      // Données nécessaires pour les formulaires liés aux élèves et aux parents (ex : pour associer une classe à un élève ou un parent)
      case "student": {
        const [studentGrades, studentClasses] = await Promise.all([
          prisma.grade.findMany({
            where: {
              schoolId: actor.schoolId,
              isDeleted: false,
            },
            select: {
              id: true,
              level: true,
              name: true,
              cycle: true,
            },
            orderBy: {
              level: "asc",
            },
          }),

          prisma.class.findMany({
            where: {
              schoolId: actor.schoolId,
              isDeleted: false,
            },
            include: {
              _count: {
                select: {
                  students: {
                    where: {
                      isDeleted: false,
                    },
                  },
                },
              },
            },
            orderBy: {
              name: "asc",
            },
          }),
        ]);

        relatedData = {
          classes: studentClasses,
          grades: studentGrades,
        };

        break;
      }

      case "parent": {
        const studentParentGrades = await prisma.grade.findMany({
          select: {
            id: true,
            level: true,
          },
        });

        const studentparentClasses = await prisma.class.findMany({
          include: { _count: { select: { students: true } } }
        });
        relatedData = { classes: studentParentGrades, grades: studentparentClasses };
        break;
      }

      // Données nécessaires pour les formulaires liés aux examens (ex : pour associer un cours à un examen)
      case "exam": {
        const { userId, sessionClaims } = await auth();
        const role = (sessionClaims?.metadata as { role?: string })?.role;

        const examLessons = await prisma.lesson.findMany({
          where: {
            ...(role === "teacher" ? { teacherId: userId! } : {}),
          },
          select: {
            id: true,
            name: true,
          }
        });

        relatedData = { lessons: examLessons };
        break;
      }

      // Données nécessaires pour les formulaires liés aux devoirs (ex : pour associer un cours à un devoir)
      case "assignment": {
        const assignmentLessons = await prisma.lesson.findMany({
          select: {
            id: true,
            name: true,
          },
        });
        relatedData = { lessons: assignmentLessons };
        break;
      }

      // Données nécessaires pour les formulaires liés aux annonces et événements 
      case "announcement": {
        const announcements = await prisma.announcement.findMany({
          include: {
            class: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        const classes = await prisma.class.findMany({
          select: {
            id: true,
            name: true,
          },
          orderBy: {
            name: "asc",
          },
        });
        relatedData = {
          announcements,
          classes,
        };
        break;
      }

      case "event": {
        const events = await prisma.event.findMany({
          include: {
            class: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        const eventClasses = await prisma.class.findMany({
          select: {
            id: true,
            name: true,
          },
          orderBy: {
            name: "asc",
          },
        });
        relatedData = {
          events,
          eventClasses,
        };
        break;
      }


      // Données nécessaires pour les formulaires liés aux cours (ex : pour associer un enseignant et une matière à un cours)
      case "lesson": {
        const { userId, sessionClaims } = await auth();
        const role = (sessionClaims?.metadata as { role?: string })?.role;

        const lessonSubjects = await prisma.subject.findMany({
          select: {
            id: true,
            name: true,
          },
        });

        const lessonClasses =
          role === "teacher"
            ? await prisma.class.findMany({
              where: {
                teacherClasses: {
                  some: {
                    teacherId: userId!,
                  },
                },
              },
              select: {
                id: true,
                name: true,
              },
            })
            : await prisma.class.findMany({
              select: {
                id: true,
                name: true,
              },
            });


        // Si admin → voir tous les enseignants
        // Si teacher → lui-même uniquement
        const lessonTeachers =
          role === "teacher"
            ? await prisma.teacher.findMany({
              where: { id: userId! },
              select: {
                id: true,
                name: true,
                surname: true,
              },
            })
            : await prisma.teacher.findMany({
              select: {
                id: true,
                name: true,
                surname: true,
              },
            });

        const weekDays = [
          { value: 1, label: "Lundi" },
          { value: 2, label: "Mardi" },
          { value: 3, label: "Mercredi" },
          { value: 4, label: "Jeudi" },
          { value: 5, label: "Vendredi" },
        ];

        relatedData = {
          subjects: lessonSubjects,
          classes: lessonClasses,
          teachers: lessonTeachers,
          weekDays,
        };
        break;
      }

      // Données nécessaires pour les formulaires liés aux résultats (ex : pour associer un élève, un cours et un examen à un résultat)
      case "result": {
        const { userId, sessionClaims } = await auth();
        const role = (sessionClaims?.metadata as { role?: string })?.role;

        // 🔹 Élèves
        const students = await prisma.student.findMany({
          select: {
            id: true,
            name: true,
            surname: true,
          },
        });

        // 🔹 Exams (filtrés si teacher)
        const exams = await prisma.exam.findMany({
          where: {
            ...(role === "teacher"
              ? {
                lesson: {
                  teacherId: userId!,
                },
              }
              : {}),
          },
          select: {
            id: true,
            title: true,
            lesson: {
              select: {
                subjectId: true,
              },
            },
          },
        });

        // 🔹 Assignments (filtrés si teacher)
        const assignments = await prisma.assignment.findMany({
          where: {
            ...(role === "teacher"
              ? {
                lesson: {
                  teacherId: userId!,
                },
              }
              : {}),
          },
          select: {
            id: true,
            title: true,
            lesson: {
              select: {
                subjectId: true,
              },
            },
          },
        });

        // 🔹 Terms (TRÈS IMPORTANT)
        const terms = await prisma.term.findMany({
          orderBy: {
            order: "asc",
          },
          select: {
            id: true,
            name: true,
          },
        });

        // 🔹 Subjects (optionnel mais recommandé pour UI)
        const subjects =
          role === "teacher"
            ? await prisma.subject.findMany({
              where: {
                lessons: {
                  some: {
                    teacherId: userId!,
                  },
                },
              },
              select: {
                id: true,
                name: true,
                code: true,
              },
            })
            : await prisma.subject.findMany({
              select: {
                id: true,
                name: true,
                code: true,
              },
            });

        relatedData = {
          students,
          exams,
          assignments,
          terms,
          subjects,
        };

        break;
      }

      // Cas de séances de cours (ex : pour associer un cours, une date et une salle à une séance)
      case "session": {
        const { userId, sessionClaims } = await auth();
        const role = (sessionClaims?.metadata as { role?: string })?.role;

        // Sécurité : seuls admin et teacher peuvent créer des sessions
        if (role !== "admin" && role !== "teacher") {
          throw new Error("Unauthorized");
        }

        /**
         * LESSONS DISPONIBLES
         * - admin → toutes
         * - teacher → seulement les siennes
         */
        const lessons = await prisma.lesson.findMany({
          where: {
            ...(role === "teacher"
              ? { teacherId: userId! }
              : {}),
          },
          select: {
            id: true,
            name: true,
          },
        });

        relatedData = { lessons };

        break;
      }


      // Les cas des absences et retards (ex : pour associer une séance, un élève et un statut à une absence)
      case "attendance": {
        const { userId, sessionClaims } = await auth();
        const role = (sessionClaims?.metadata as { role?: string })?.role;

        /**
         * LESSONS
         */
        const lessons = await prisma.lesson.findMany({
          where: {
            ...(role === "teacher"
              ? { teacherId: userId! }
              : role === "student"
                ? {
                  class: {
                    students: {
                      some: { id: userId! },
                    },
                  },
                }
                : role === "parent"
                  ? {
                    class: {
                      students: {
                        some: { parentId: userId! },
                      },
                    },
                  }
                  : {}),
          },
          select: {
            id: true,
            name: true,
          },
        });

        /**
         * SESSIONS (IMPORTANT 🔥)
         * On ne prend que les sessions non supprimées
         */
        const sessions = await prisma.session.findMany({
          where: {
            isDeleted: false,
            ...(role === "teacher"
              ? {
                lesson: {
                  teacherId: userId!,
                },
              }
              : {}),
          },
          select: {
            id: true,
            date: true,
            startTime: true,
            lesson: {
              select: {
                name: true,
              },
            },
            class: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: [
            { date: "desc" },
            { startTime: "asc" },
          ],
        });

        /**
         * STUDENTS
         */
        const students = await prisma.student.findMany({
          where: {
            ...(role === "teacher"
              ? {
                class: {
                  lessons: {
                    some: { teacherId: userId! },
                  },
                },
              }
              : role === "parent"
                ? { parentId: userId! }
                : {}),
          },
          select: {
            id: true,
            name: true,
            surname: true,
            classId: true,
          },
        });

        /**
         * ENUMS
         */
        const statuses = [
          { label: "Présent", value: "PRESENT" },
          { label: "Absent", value: "ABSENT" },
          { label: "Retard", value: "LATE" },
        ];

        const actors = [
          { label: "Enseignant", value: "TEACHER" },
          { label: "Parent", value: "PARENT" },
        ];

        relatedData = {
          students,
          lessons,
          sessions,
          statuses,
          actors,
        };

        break;
      }


      case "school": {
        const plans = [
          { value: "FREE", label: "Gratuit" },
          { value: "STANDARD", label: "Standard" },
          { value: "PREMIUM", label: "Premium" },
          { value: "ENTERPRISE", label: "Entreprise" },
        ];

        const statuses = [
          { value: "ACTIVE", label: "Active" },
          { value: "PENDING", label: "En attente" },
          { value: "SUSPENDED", label: "Suspendue" },
          { value: "INACTIVE", label: "Inactive" },
        ];

        const languages = [
          { value: "fr", label: "Français" },
          { value: "en", label: "Anglais" },
        ];

        const timezones = [
          { value: "Africa/Bamako", label: "Africa/Bamako" },
          { value: "Africa/Abidjan", label: "Africa/Abidjan" },
          { value: "Africa/Dakar", label: "Africa/Dakar" },
          { value: "Africa/Conakry", label: "Africa/Conakry" },
        ];

        relatedData = {
          plans,
          statuses,
          languages,
          timezones,
        };

        break;
      }

      default:
        break;
    }
  }

  return (
    <div>
      {/* Form implementation goes here */}
      <FormModal
        table={table}
        type={type}
        data={data}
        id={id}
        relatedData={relatedData}
        role={role}
      />
    </div>
  );
};

export default FormContainer;
