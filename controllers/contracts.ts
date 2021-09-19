import { Request, Response, NextFunction } from 'express'
import { getConnection } from 'typeorm'
import dayjs from 'dayjs'

import { Contract } from '../database/entities/Contract'
import { ErrorHandler } from '../utils/errorHandler'
import { DB_TIME_FORMAT } from '../constants/DB_TIME_FORMAT'
import { User } from '../database/entities/User'

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
            .andWhere('contract.renterId IS NOT NULL')
            .getOne()

        if (currentContract) throw new ErrorHandler(400, 'There is already an active contract for this property')

        const newContract = contractRepository.create({ ...body, propertyId })
        const results = await contractRepository.save(newContract)

        return res.status(201).send(results)
    } catch (error) {
        next(error)
    }
}

// @desc    Sign a contract
// @route   PATCH /contracts/:id/sign
// @access  Public
export const signContract = async (req: Request, res: Response, next: NextFunction) => {
    const { body: renter, params } = req

    try {
        const contractRepository = getConnection().getRepository(Contract)

        const contract = await contractRepository.findOne(params.id, { relations: ['property'] })

        if (!contract) throw new ErrorHandler(404, `Could not find contract with id ${params.id}`)

        const result = await contractRepository.save({ ...contract, renter })

        return res.send(result)
    } catch (error) {
        next(error)
    }
}

// @desc    Modify a contract
// @route   PATCH /contracts/:id
// @access  PROPERTY_ADMIN, RENTER
export const modifyContract = async (req: Request, res: Response, next: NextFunction) => {
    const { body, params } = req

    const authedUserId = (req.user as User).id

    try {
        const contractRepository = getConnection().getRepository(Contract)

        const contract = await contractRepository.findOne(params.id, { relations: ['property'] })

        if (!contract) throw new ErrorHandler(404, `Could not find contract with id ${params.id}`)

        // Check if user can modify property
        if (contract.renterId === authedUserId || contract.property.administratorId === authedUserId) {
            const result = await contractRepository.save({ ...contract, ...body })

            return res.send(result)
        } else {
            throw new ErrorHandler(401, 'You cannot modify this contract')
        }
    } catch (error) {
        next(error)
    }
}