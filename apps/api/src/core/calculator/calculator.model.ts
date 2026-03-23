import * as z from "zod";
import {
  CalculatorSchema,
  CalculatorTypeSchema,
  IdSchema,
  JsonObjectSchema,
} from "schemas";

export const InsertCalculatorSchema = z.object({
  id: IdSchema,
  name: z.string().trim().min(1),
  calculatorType: CalculatorTypeSchema,
  data: JsonObjectSchema,
  userId: IdSchema,
  shareToken: z.string().trim().min(1).nullable().optional(),
});

export const UpdateCalculatorSchema = z.object({
  name: z.string().trim().min(1),
  calculatorType: CalculatorTypeSchema,
  data: JsonObjectSchema,
});

export type Calculator = z.infer<typeof CalculatorSchema>;
export type InsertCalculator = z.infer<typeof InsertCalculatorSchema>;
export type UpdateCalculator = z.infer<typeof UpdateCalculatorSchema>;
