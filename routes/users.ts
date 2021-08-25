import express from 'express'

import {
    createUser,
    getUserByID,
    getLoggedInUser,
    loginUser,
    logoutUser,
} from '../controllers/users'
import { auth } from '../middleware/auth'

const router = express.Router()

router.post('/', createUser)
router.get('/me', auth(), getLoggedInUser)
router.get('/:id', getUserByID)
router.post('/login', loginUser)
router.post('/logout', logoutUser)

export default router