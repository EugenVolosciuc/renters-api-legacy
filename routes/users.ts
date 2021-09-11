import express from 'express'

import {
    createUser,
    getUserByID,
    getLoggedInUser,
    loginUser,
    logoutUser,
    modifyUserDetails
} from '../controllers/users'
import { auth } from '../middleware/auth'

const router = express.Router()

router.get('/me', auth(), getLoggedInUser)
router.get('/:id', getUserByID)
router.post('/', createUser)
router.post('/login', loginUser)
router.post('/logout', logoutUser)
router.patch('/me', auth(), modifyUserDetails)

export default router