import { Request, Response, NextFunction } from 'express'
import { getConnection } from 'typeorm'
import * as fs from 'fs/promises'

import { Photo, PhotoData } from '../database/entities/photo'
import { cloudinary } from '../config/cloudinary'

// @desc    Upload photo
// @route   POST /photos
// @access  Private
export const uploadPhoto = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const photoRepository = getConnection().getRepository(Photo)

        const receivedPhoto: PhotoData = Object.values(req.files)[0][0]

        const { url, public_id } = await cloudinary.uploader.upload(receivedPhoto.path)
        await fs.unlink(receivedPhoto.path)

        const photoDBInstance = photoRepository.create({
            url,
            public_id,
            title: receivedPhoto.originalname,
            type: receivedPhoto.fieldname
        })
        const result = await photoRepository.save(photoDBInstance)

        res.send(result)
    } catch (error) {
        next(error)
    }
}

// @desc    Delete photo
// @route   DELETE /photos/:id
// @access  Private
export const deletePhoto = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const photoRepository = getConnection().getRepository(Photo)

        await cloudinary.uploader.destroy(req.params.id)

        await photoRepository.delete({ public_id: req.params.id })

        res.send()
    } catch (error) {
        next(error)
    }
}