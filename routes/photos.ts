import express from 'express'

import {
    uploadPhoto,
    deletePhoto
} from '../controllers/photos'
import { auth } from '../middleware/auth'
import { upload } from '../config/multer'
import { PHOTO_TYPE } from '../database/entities/Photo'

const router = express.Router()

router.post(
    '/',
    auth(),
    upload.fields([
        { name: PHOTO_TYPE.PROPERTY, maxCount: 1 },
        { name: PHOTO_TYPE.BILL, maxCount: 1 }
    ]),
    uploadPhoto
)
router.delete('/:id', auth(), deletePhoto)

export default router