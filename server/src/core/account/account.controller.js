import { createAccount } from './account.useCase.js';
import { readAccountsFromUser } from './account.useCase.js';
import { validateInsertAccountSchema } from './account.validator.js';

/**
 * Handles a post account request.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next function.
 */
export const postAccountController = async (req, res, next) => {
    const jsonData = req.body;

    const validationResult = await validateInsertAccountSchema(jsonData)

    if (validationResult.success === false) {
        return res.status(400).send({ error: validationResult.error })
    }

    await createAccount(validationResult.data)

    return res.status(201).send({ success: true })
}

/**
 * Handles a get accounts request.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next function.
 */
export const readAccountsController = async (req, res, next) => {
    const { userId } = req.params

    if (!userId) {
        return res.status(400).send({ error: "userId is required" })
    }

    const accounts = await readAccountsFromUser(userId)
    return res.status(200).send({ success: true, data: accounts })
}
