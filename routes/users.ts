import express from 'express'

import {
    createUser,
    getUserByID,
    getLoggedInUser,
    loginUser,
    logoutUser,
    modifyUserDetails,
    sendSignupInvitationToRenter,
    getInvitationData
} from '../controllers/users'
import { USER_ROLES } from '../database/entities/User'
import { auth } from '../middleware/auth'

const router = express.Router()

router.get('/me', auth(), getLoggedInUser)
router.get('/:id', getUserByID)
router.get('/invitation-data/:inviteId', getInvitationData)
router.post('/', createUser)
router.post('/login', loginUser)
router.post('/logout', logoutUser)
router.post('/renter-invite', auth([USER_ROLES.PROPERTY_ADMIN]), sendSignupInvitationToRenter)
router.patch('/me', auth(), modifyUserDetails)

export default router