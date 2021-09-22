import { Request, Response, NextFunction } from 'express'
import { getConnection } from 'typeorm'
import * as fs from 'fs/promises'

import { Document, DocumentData } from '../database/entities/Document'
import { cloudinary } from '../config/cloudinary'

// @desc    Upload document
// @route   POST /documents
// @access  Private
export const uploadDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const documentRepository = getConnection().getRepository(Document)

        const receivedDocument: DocumentData = Object.values(req.files)[0][0]

        const { url, public_id } = await cloudinary.uploader.upload(receivedDocument.path)
        await fs.unlink(receivedDocument.path)

        const documentDBInstance = documentRepository.create({
            url,
            public_id,
            title: receivedDocument.originalname,
            type: receivedDocument.fieldname
        })
        const result = await documentRepository.save(documentDBInstance)

        res.status(201).send(result)
    } catch (error) {
        next(error)
    }
}

// @desc    Delete document
// @route   DELETE /documents/:id
// @access  Private
export const deleteDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const documentRepository = getConnection().getRepository(Document)

        await cloudinary.uploader.destroy(req.params.id)

        await documentRepository.delete({ public_id: req.params.id })

        res.send()
    } catch (error) {
        next(error)
    }
}