import express from 'express'

import {
    uploadDocument,
    deleteDocument
} from '../controllers/documents'
import { auth } from '../middleware/auth'
import { upload } from '../config/multer'
import { DOCUMENT_TYPE } from '../database/entities/Document'

const router = express.Router()

router.post(
    '/',
    auth(),
    upload.fields([
        { name: DOCUMENT_TYPE.CONTRACT, maxCount: 1 },
        { name: DOCUMENT_TYPE.BILL, maxCount: 1 }
    ]),
    uploadDocument
)
router.delete('/:id', auth(), deleteDocument)

export default router