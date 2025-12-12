import {z} from "zod";

export const subjectSchema = z.object({
    id: z.coerce.number().optional(),
  name: z
    .string()
    .min(1, {
      message: "Le nom de la matière est réquis.",
    }),
});

export type SubjectSchemaInput = z.infer<typeof subjetSchema>;