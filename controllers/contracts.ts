import { Request, Response, NextFunction } from 'express'
import { getConnection } from 'typeorm'
import dayjs from 'dayjs'

import { Contract } from '../database/entities/Contract'
import { ErrorHandler } from '../utils/errorHandler'
import { DB_TIME_FORMAT } from '../constants/DB_TIME_FORMAT'

// @desc    Create a contract for a property
// @route   POST /contracts
// @access  PROPERTY_ADMIN
export const createContract = async (req: Request, res: Response, next: NextFunction) => {
    const { query: { propertyId }, body } = req
    try {
        if (!propertyId) throw new ErrorHandler(400, 'No property ID provided')

        // Check if property has a current contract
        const contractRepository = getConnection().getRepository(Contract)
        const currentTime = dayjs().format('YYYY-MM-DD HH:mm:ss')

        const currentContract = await contractRepository
            .createQueryBuilder('contract')
            .where('contract.propertyId = :propertyId', { propertyId })
            .andWhere(`contract.expirationDate > TO_TIMESTAMP('${currentTime}', '${DB_TIME_FORMAT}')`)
            .getOne()

        if (currentContract) throw new ErrorHandler(400, 'There is already an active contract for this property')

        const newContract = contractRepository.create({ ...body, propertyId })
        const results = await contractRepository.save(newContract)

        return res.status(201).send(results)
    } catch (error) {
        next(error)
    }
}