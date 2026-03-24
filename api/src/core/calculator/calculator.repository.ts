import { db } from "../../db/database.js";
import {
  type Calculator,
  type InsertCalculator,
  type UpdateCalculator,
} from "./calculator.model.js";

export const getCalculatorsByUser = async (
  userId: string,
): Promise<Calculator[]> => {
  return await db
    .selectFrom("calculators")
    .selectAll()
    .where("userId", "=", userId)
    .orderBy("updatedAt", "desc")
    .execute();
};

export const getCalculatorByUserAndId = async (
  userId: string,
  calculatorId: string,
): Promise<Calculator | null> => {
  const calculator = await db
    .selectFrom("calculators")
    .selectAll()
    .where("userId", "=", userId)
    .where("id", "=", calculatorId)
    .executeTakeFirst();

  return calculator ?? null;
};

export const getCalculatorById = async (
  calculatorId: string,
): Promise<Calculator | null> => {
  const calculator = await db
    .selectFrom("calculators")
    .selectAll()
    .where("id", "=", calculatorId)
    .executeTakeFirst();

  return calculator ?? null;
};

export const getCalculatorByShareToken = async (
  shareToken: string,
): Promise<Calculator | null> => {
  const calculator = await db
    .selectFrom("calculators")
    .selectAll()
    .where("shareToken", "=", shareToken)
    .executeTakeFirst();

  return calculator ?? null;
};

export const insertCalculator = async (
  calculatorData: InsertCalculator,
): Promise<void> => {
  const now = new Date().toISOString();

  await db
    .insertInto("calculators")
    .values({
      ...calculatorData,
      createdAt: now,
      updatedAt: now,
    })
    .executeTakeFirstOrThrow();
};

export const updateCalculator = async (
  userId: string,
  calculatorId: string,
  calculator: UpdateCalculator,
): Promise<void> => {
  await db
    .updateTable("calculators")
    .set({
      name: calculator.name,
      calculatorType: calculator.calculatorType,
      data: calculator.data,
      updatedAt: new Date(),
    })
    .where("id", "=", calculatorId)
    .where("userId", "=", userId)
    .execute();
};

export const updateCalculatorShareToken = async (
  userId: string,
  calculatorId: string,
  shareToken: string | null,
): Promise<void> => {
  await db
    .updateTable("calculators")
    .set({
      shareToken,
      updatedAt: new Date(),
    })
    .where("id", "=", calculatorId)
    .where("userId", "=", userId)
    .execute();
};

export const deleteCalculator = async (
  userId: string,
  calculatorId: string,
): Promise<void> => {
  await db
    .deleteFrom("calculators")
    .where("id", "=", calculatorId)
    .where("userId", "=", userId)
    .execute();
};
