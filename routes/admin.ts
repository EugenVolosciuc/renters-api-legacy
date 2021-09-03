import express from 'express'
import { USER_ROLES } from '../database/entities/User'

import { auth } from '../middleware/auth'
import cronJobsRouter from './cronJobs'

const router = express.Router()

router.use('/cron-jobs', auth([USER_ROLES.SUPER_ADMIN]), cronJobsRouter)

export default router