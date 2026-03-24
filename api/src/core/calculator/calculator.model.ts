import * as z from "zod/mini";
import {
  CalculatorSchema,
  CalculatorTypeSchema,
  IdSchema,
  JsonObjectSchema,
} from "../../schemas.js";

export const InsertCalculatorSchema = z.object({
  id: IdSchema,
  name: z.string().check(z.trim(), z.minLength(1)),
  calculatorType: CalculatorTypeSchema,
  data: JsonObjectSchema,
  userId: IdSchema,
  shareToken: z.optional(
    z.nullable(z.string().check(z.trim(), z.minLength(1))),
  ),
});

export const UpdateCalculatorSchema = z.object({
  name: z.string().check(z.trim(), z.minLength(1)),
  calculatorType: CalculatorTypeSchema,
  data: JsonObjectSchema,
});

export type Calculator = z.infer<typeof CalculatorSchema>;
export type InsertCalculator = z.infer<typeof InsertCalculatorSchema>;
export type UpdateCalculator = z.infer<typeof UpdateCalculatorSchema>;
