import { z } from "zod";

export const subjectSchema = z.object({
  id: z.coerce.number().optional(),
  name: z
    .string()
    .min(1, {
      message: "Le nom de la matière est réquis.",
    }),
  teachers: z.array(z.string()), // Array of teacher IDs as strings
});

export type SubjectSchemaInput = z.infer<typeof subjectSchema>;

export const classSchema = z.object({
  id: z.coerce.number().optional(),
  name: z
    .string()
    .min(1, {
      message: "Le nom de la classe est réquis.",
    }),
  capacity: z.coerce.number().min(1, {
    message: "La capacité doit être au moins de 1."
  }),
  gradeId: z.coerce.number().min(1, {
    message: "Le niveau est réquis."
  }),
  supervisorId: z.coerce.string().optional(),
});

export type ClassSchemaInput = z.infer<typeof classSchema>;

export const teacherSchema = z.object({
  id: z.coerce.string().optional(),
  username: z
    .string()
    .min(3, {
      message: "Le nom d'utilisateur doit contenir au moins 3 caractères.",
    })
    .max(20, {
      message: "Le nom d'utilisateur ne doit pas dépasser 20 caractères.",
    }),
  email: z.string().email({ message: "Adresse email invalide" }).optional().or(z.literal("")),
  password: z
    .string()
    .min(4, { message: "Le mot de passe doit contenir au moins 4 caractères." })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "Le prénom est obligatoire" }),
  surname: z.string().min(1, { message: "Le nom est obligatoire" }),
  phone: z.string().optional(),
  address: z.string(),
  image: z.string().optional(),
  birthday: z.coerce.date().optional(),
  // birthday: z.coerce.date({ message: "Le date de naissance est obligatoire" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Le genre est réquis !" }),
  bloodType: z.string().min(1, { message: "Le type saguin est réquis !" }),
  subjects: z.array(z.string()).optional()
});

export const examSchema = z.object({
  id: z.coerce.number().optional(),
  title: z
    .string()
    .min(1, {
      message: "Le titre est réquis.",
    }),
  startTime: z.coerce.date({ message: "La date et l'heure de départ sont réquis !" }),
  endTime: z.coerce.date({ message: "La date et l'heure de fin sont réquis !" }),
  lessonId: z.coerce.number({ message: "Veuillez affecter une lesson !" })
});

export type ExamSchemaInput = z.infer<typeof examSchema>;

export type TeacherSchemaInput = z.infer<typeof teacherSchema>;

export const studentSchema = z.object({
  id: z.coerce.string().optional(),
  username: z
    .string()
    .min(3, {
      message: "Le nom d'utilisateur doit contenir au moins 3 caractères.",
    })
    .max(20, {
      message: "Le nom d'utilisateur ne doit pas dépasser 20 caractères.",
    }),
  email: z.string().email({ message: "Adresse email invalide" }).optional().or(z.literal("")),
  password: z
    .string()
    .min(4, { message: "Le mot de passe doit contenir au moins 4 caractères." })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "Le prénom est obligatoire" }),
  surname: z.string().min(1, { message: "Le nom est obligatoire" }),
  phone: z.string().optional(),
  address: z.string(),
  image: z.string().optional(),
  birthday: z.coerce.date().optional(),
  sex: z.enum(["MALE", "FEMALE"], { message: "Le genre est réquis !" }),
  bloodType: z.string().min(1, { message: "Le type saguin est réquis !" }),
  gradeId: z.coerce.number().min(1, { message: "le niveau est réquis" }),
  classId: z.coerce.number().min(1, { message: "la classe est obligatoire" }),
  parentId: z.coerce.string().min(1, { message: "Veuillez affecter cet élève à un parent" }),
});

export type StudentSchemaInput = z.infer<typeof studentSchema>;

export const parentSchema = z.object({
  id: z.coerce.string().optional(),
  username: z
    .string()
    .min(3, {
      message: "Le nom d'utilisateur doit contenir au moins 3 caractères.",
    })
    .max(20, {
      message: "Le nom d'utilisateur ne doit pas dépasser 20 caractères.",
    }),
  email: z.string().email({ message: "Adresse email invalide" }).optional().or(z.literal("")),
  password: z
    .string()
    .min(4, { message: "Le mot de passe doit contenir au moins 4 caractères." })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "Le prénom est obligatoire" }),
  surname: z.string().min(1, { message: "Le nom est obligatoire" }),
  phone: z.string().optional(),
  address: z.string(),
  image: z.string().optional(),
  birthday: z.coerce.date().optional(),
  sex: z.enum(["MALE", "FEMALE"], { message: "Le genre est réquis !" }),
});

export type ParentSchemaInput = z.infer<typeof parentSchema>;

export const lessonSchema = z.object({
  id: z.coerce.number().optional(),
  name: z
    .string()
    .min(1, {
      message: "Le titre de la leçon est requis.",
    }),

  day: z.enum([
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
  ], { message: "Le jour est requis." }),

  startTime: z.coerce.date({
    required_error: "La date et l'heure de début sont requise.",
    invalid_type_error: "Date invalide.",
  }),

  endTime: z.coerce.date({
    required_error: "La date et l'heure de fin sont requise.",
    invalid_type_error: "Date invalide.",
  }),

  subjectId: z.coerce
    .number()
    .min(1, {
      message: "La matière est requise.",
    }),

  classId: z.coerce
    .number()
    .min(1, {
      message: "La classe est requise.",
    }),

  teacherId: z
    .string()
    .min(1, {
      message: "L'enseignant est requis.",
    }),
})
  .refine(
    (data) => data.startTime < data.endTime,
    {
      message: "La date et l'heure de fin doit être après la date et l'heure de début.",
      path: ["endTime"],
    }
  );

export type LessonSchemaInput = z.infer<typeof lessonSchema>;

export const assignmentSchema = z.object({
  id: z.coerce.number().optional(),
  title: z
    .string()
    .min(1, {
      message: "Le titre est réquis.",
    }),
  startDate: z.coerce.date({ message: "La date de début est requise !" }),
  dueDate: z.coerce.date({ message: "La date de remise est requise !" }),
  lessonId: z.coerce.number({ message: "La leçon est requise !" })
});

export type AssignmentSchemaInput = z.infer<typeof assignmentSchema>;

export const resultSchema = z
  .object({
    id: z.coerce.number().optional(),

    score: z.coerce
      .number()
      .min(0, { message: "La note ne peut pas être négative" })
      .max(20, { message: "La note ne peut pas dépasser 20" }),

    examId: z.coerce.number().optional().nullable(),
    assignmentId: z.coerce.number().optional().nullable(),

    studentId: z.string().min(1, {
      message: "L'élève est requis",
    }),
  })
  .refine(
    (data) =>
      (data.examId && !data.assignmentId) ||
      (!data.examId && data.assignmentId),
    {
      message: "Veuillez choisir soit un examen soit un devoir",
      path: ["examId"],
    }
  );

export type ResultSchemaInput = z.infer<typeof resultSchema>;

// Attendance schema
export const AttendanceStatusEnum = z.enum([
  "PRESENT",
  "ABSENT",
  "LATE",
]);

export const AttendanceActorEnum = z.enum([
  "TEACHER",
  "PARENT",
]);

export const attendanceSchema = z
  .object({
    id: z.coerce.number().optional(),

    studentId: z.string().min(1, {
      message: "L'élève est requis.",
    }),

    lessonId: z.coerce.number({
      required_error: "La leçon est requise.",
      invalid_type_error: "Leçon invalide.",
    }),

    date: z.coerce.date({
      required_error: "La date est requise.",
    }),

    status: AttendanceStatusEnum,

    comment: z
      .string()
      .max(500, "Le commentaire est trop long.")
      .optional()
      .nullable(),

    proofUrl: z
      .string()
      .url("Le lien du justificatif est invalide.")
      .optional()
      .nullable(),

    createdBy: AttendanceActorEnum.optional(),
  })
  .superRefine((data, ctx) => {
    // 🔴 ABSENCE → justification obligatoire
    if (data.status === "ABSENT") {
      if (!data.comment && !data.proofUrl) {
        ctx.addIssue({
          path: ["comment"],
          message:
            "Une justification (commentaire ou justificatif) est obligatoire pour une absence.",
        });
      }
    }
  });

export type AttendanceSchemaInput = z.infer<typeof attendanceSchema>;

  // End Attendance schma