import express from 'express'

import { 
    getCronJobs,
    modifyCronJob,
    cancelNextCronJobInvocation
} from '../controllers/cronJobs'

const router = express.Router()

router.get('/', getCronJobs)
router.post('/:id/cancel-next', cancelNextCronJobInvocation)
router.patch('/:id', modifyCronJob)

export default router