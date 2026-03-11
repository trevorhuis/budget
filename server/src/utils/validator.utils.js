import * as z from 'zod'

/**
 * @typedef {object} ValidatorResult
 * @property {boolean} success - Indicates if the operation was successful.
 * @property {any} [data] - The resulting data on success. Optional.
 * @property {string} [error] - The error message on failure. Optional.
 */

export const ZodError = z.ZodError

export { }