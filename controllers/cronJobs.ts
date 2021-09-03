import { Request, Response, NextFunction } from 'express'
import { getConnection } from 'typeorm'

import { CronJob } from '../database/entities/CronJob'

// import { ErrorHandler } from '../utils/errorHandler'

// @desc    Get list of cron jobs
// @route   GET /admin/cron-jobs
// @access  SUPER_ADMIN
export const getCronJobs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const cronJobRepository = getConnection().getRepository(CronJob)

        const cronJobs = await cronJobRepository.find()

        res.send(cronJobs)
    } catch (error) {
        next(error)
    }
}
