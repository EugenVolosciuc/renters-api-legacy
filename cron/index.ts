import { getConnection } from 'typeorm'
import schedule, { Job } from 'node-schedule'

import * as cronJobActions from './actions'
import { CronJob } from '../database/entities/CronJob'

const cronJobList = [
    {
        id: 1,
        title: "Delete non-assigned images",
        description: "Deletes DB records and images from Cloudinary that do not have a propertyId or a billId",
        action: "deleteNonAssignedImages",
        interval: "0 */6 * * *"
    }
]

export const initializedCronJobs: Record<CronJob['id'], Job> = {}

export const initializeCronJobs = async () => {
    const cronJobRepository = getConnection().getRepository(CronJob)

    try {
        // Save cron jobs to DB
        await cronJobRepository.save(cronJobList)

        // Initialize each cron job
        cronJobList.forEach(cronJob => {
            const job = schedule.scheduleJob(cronJob.id.toString(), cronJob.interval, cronJobActions[cronJob.action])

            initializedCronJobs[cronJob.id] = job
        })
    } catch (error) {
        console.log("ERROR!", error)
    }
}