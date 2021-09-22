import { Request, Response, NextFunction } from 'express'
import { getConnection } from 'typeorm'

import { CronJob } from '../database/entities/CronJob'
import { initializedCronJobs } from '../cron'
import { ErrorHandler } from '../utils/errorHandler'

// import { ErrorHandler } from '../utils/errorHandler'

// @desc    Get list of cron jobs
// @route   GET /admin/cron-jobs
// @access  SUPER_ADMIN
export const getCronJobs = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const cronJobRepository = getConnection().getRepository(CronJob)

        const cronJobs = await cronJobRepository.find()

        const cronJobsWithNextInvocation = cronJobs.map(cronJob => ({
            ...cronJob,
            nextInvocation: initializedCronJobs[cronJob.id].nextInvocation()
        }))

        res.send(cronJobsWithNextInvocation)
    } catch (error) {
        next(error)
    }
}

export const modifyCronJob = async (req: Request, res: Response, next: NextFunction) => {
    const { id: cronJobId } = req.params

    try {
        const cronJobRepository = getConnection().getRepository(CronJob)

        const cronJob = await cronJobRepository.findOne(cronJobId)

        if (!cronJob) throw new ErrorHandler(404, `Could not find cron job with id ${cronJobId}`)

        // Update cron job in DB
        await cronJobRepository.update(cronJobId, req.body)
        const updatedCronJob = { ...cronJob, ...req.body }

        // Update the cron job itself
        // Update interval
        if ('interval' in req.body) {
            initializedCronJobs[parseInt(cronJobId, 10)].reschedule(req.body.interval)
        }

        // Toggle cron job
        if ('isRunning' in req.body) {
            if (req.body.isRunning) {
                initializedCronJobs[parseInt(cronJobId, 10)].reschedule(cronJob.interval)
            } else {
                initializedCronJobs[parseInt(cronJobId, 10)].cancel()
            }
        }

        res.send(updatedCronJob)
    } catch (error) {
        next(error)
    }
}

export const cancelNextCronJobInvocation = async (req: Request, res: Response, next: NextFunction) => {
    const { id: cronJobId } = req.params
    
    try {
        initializedCronJobs[parseInt(cronJobId, 10)].cancelNext()

        res.send()
    } catch (error) {
        next(error)
    }
}