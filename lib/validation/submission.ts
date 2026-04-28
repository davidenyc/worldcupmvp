import { z } from "zod";

export const submissionSchema = z.object({
  name: z.string().min(2).max(120),
  address: z.string().min(5).max(180),
  countryAssociation: z.string().min(2).max(80),
  notes: z.string().min(20).max(600),
  email: z.string().email().max(120)
});

export type SubmissionInput = z.infer<typeof submissionSchema>;
