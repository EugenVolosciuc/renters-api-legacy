import express from 'express'

import { getCronJobs } from '../controllers/cronJobs'

const router = express.Router()

router.get('/', getCronJobs)

export default router