import express from 'express'

import { 
    createContract,
    modifyContract,
    signContract
} from '../controllers/contracts'
import { USER_ROLES } from '../database/entities/User'
import { auth } from '../middleware/auth'

const router = express.Router()

router.post('/', auth([USER_ROLES.PROPERTY_ADMIN]), createContract)
router.patch('/:id/sign', signContract)
router.patch('/:id', auth([USER_ROLES.PROPERTY_ADMIN, USER_ROLES.RENTER]), modifyContract)

export default router