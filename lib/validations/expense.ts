import { z } from "zod";

export const expenseSchema = z.object({
  amount: z.number().min(0),
  category: z.string().trim().min(1),
  description: z.string().trim().min(1),
  date: z.string().trim().min(1),
});
