import { uuidv7 } from "uuidv7";
import type { InsertCalculator, UpdateCalculator } from "./calculator.model.js";
import {
  deleteCalculator,
  getCalculatorById,
  getCalculatorByShareToken,
  getCalculatorByUserAndId,
  getCalculatorsByUser,
  insertCalculator,
  updateCalculator,
  updateCalculatorShareToken,
} from "./calculator.repository.js";
import { AccessDeniedException, NotFoundException } from "../../errors.js";

const getOwnedCalculator = async (userId: string, calculatorId: string) => {
  const calculator = await getCalculatorByUserAndId(userId, calculatorId);

  if (calculator) {
    return calculator;
  }

  const existingCalculator = await getCalculatorById(calculatorId);
  if (existingCalculator) {
    throw new AccessDeniedException("Calculator ownership mismatch");
  }

  throw new NotFoundException("Calculator not found");
};

export const createCalculator = async (calculator: InsertCalculator) => {
  await insertCalculator(calculator);
  return true;
};

export const readCalculatorsFromUser = async (userId: string) => {
  return await getCalculatorsByUser(userId);
};

export const readCalculatorFromUser = async (
  userId: string,
  calculatorId: string,
) => {
  return await getOwnedCalculator(userId, calculatorId);
};

export const calculatorUpdate = async (
  userId: string,
  calculatorId: string,
  calculator: UpdateCalculator,
) => {
  await getOwnedCalculator(userId, calculatorId);
  await updateCalculator(userId, calculatorId, calculator);
  return true;
};

export const removeCalculator = async (
  userId: string,
  calculatorId: string,
) => {
  await getOwnedCalculator(userId, calculatorId);
  await deleteCalculator(userId, calculatorId);
  return true;
};

export const duplicateCalculator = async (
  userId: string,
  calculatorId: string,
) => {
  const source = await getOwnedCalculator(userId, calculatorId);
  const duplicate = {
    id: uuidv7(),
    name: `${source.name} Copy`,
    calculatorType: source.calculatorType,
    data: source.data,
    userId,
    shareToken: null,
  } satisfies InsertCalculator;

  await insertCalculator(duplicate);

  return duplicate;
};

export const shareCalculator = async (userId: string, calculatorId: string) => {
  const calculator = await getOwnedCalculator(userId, calculatorId);
  const shareToken = calculator.shareToken ?? uuidv7();

  await updateCalculatorShareToken(userId, calculatorId, shareToken);

  return shareToken;
};

export const unshareCalculator = async (
  userId: string,
  calculatorId: string,
) => {
  await getOwnedCalculator(userId, calculatorId);
  await updateCalculatorShareToken(userId, calculatorId, null);
  return true;
};

export const readSharedCalculator = async (shareToken: string) => {
  const calculator = await getCalculatorByShareToken(shareToken);

  if (!calculator) {
    throw new NotFoundException("Shared calculator not found");
  }

  return calculator;
};
