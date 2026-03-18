import * as z from "zod";

export const validateString = async (input: any) => {
  return await z.string().uuid().parseAsync(input);
};
