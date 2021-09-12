import express from 'express'

import { createContract } from '../controllers/contracts'
import { USER_ROLES } from '../database/entities/User'
import { auth } from '../middleware/auth'

const router = express.Router()

router.post('/', auth([USER_ROLES.PROPERTY_ADMIN]), createContract)

export default router