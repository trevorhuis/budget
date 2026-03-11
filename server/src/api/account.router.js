import express from 'express'
import { postAccountController, readAccountsController } from '../core/account/account.controller.js'

export const accountRouter = express.Router()

accountRouter.post('/', postAccountController)
accountRouter.get('/:userId', readAccountsController)
