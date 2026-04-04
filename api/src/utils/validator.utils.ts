import * as z from "zod";

export const validateString = async (input: any) => {
  return await z.uuidv7().parseAsync(input);
};
