import { z } from "zod";

export const submissionSchema = z.object({
  name: z.string().min(2).max(120),
  address: z.string().min(5).max(180),
  borough: z.enum(["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"]),
  neighborhood: z.string().min(2).max(80).optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  instagram: z.string().url().optional().or(z.literal("")),
  countryAssociation: z.string().min(2).max(80),
  showsSoccer: z.boolean(),
  acceptsReservations: z.boolean(),
  approximateCapacity: z.coerce.number().min(0).max(5000).optional(),
  description: z.string().min(20).max(600)
});

export type SubmissionInput = z.infer<typeof submissionSchema>;
