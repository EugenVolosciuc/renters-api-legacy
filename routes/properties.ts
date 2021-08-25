import express from 'express'

import { auth } from '../middleware/auth'
import { USER_ROLES } from '../database/entities/user'
import {
    createProperty,
    getPropertyByID,
    getPropertiesOfLoggedUser,
    modifyProperty
} from '../controllers/properties'

const router = express.Router()

router.get('/', auth(), getPropertiesOfLoggedUser)
router.get('/:id', getPropertyByID)
router.post('/', auth([USER_ROLES.PROPERTY_ADMIN]), createProperty)
router.patch('/:id', auth([USER_ROLES.PROPERTY_ADMIN]), modifyProperty)

export default router