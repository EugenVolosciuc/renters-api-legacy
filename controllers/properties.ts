import { Request, Response, NextFunction } from 'express'
import { getConnection } from 'typeorm'

import { Property } from '../database/entities/Property'
import { User, USER_ROLES } from '../database/entities/User'
import { ErrorHandler } from '../utils/errorHandler'

// @desc    Get paginated properties of logged in user
// @route   GET /properties
// @access  Private
export const getPropertiesOfLoggedUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const propertyRepository = getConnection().getRepository(Property)

        let query: string
        switch ((req.user as User).role) {
            case USER_ROLES.PROPERTY_ADMIN:
                query = 'property.administratorId = :id'
            default:
                query = 'property.administratorId = :id'
        }

        const filters = [
            { key: 'type', value: req.query.type }
        ].filter(filterType => !!filterType.value)

        let initialQuery = propertyRepository
            .createQueryBuilder('property')
            .leftJoinAndSelect('property.photos', 'photos')
            .where(query, { id: (req.user as User).id })

        filters.forEach(({ key, value }) => {
            initialQuery = initialQuery.andWhere(
                `property.${key} = :${key}`,
                { [key]: value }
            )
        })

        const properties = await initialQuery.paginate()

        return res.send(properties)
    } catch (error) {
        next(error)
    }
}

// @desc    Get property by ID
// @route   GET /properties/:id
// @access  Public
export const getPropertyByID = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const propertyRepository = getConnection().getRepository(Property)

        const property = await propertyRepository.findOne(
            req.params.id,
            { relations: ['administrator', 'photos', 'contracts', 'contracts.renter'] }
        )

        if (!property) throw new ErrorHandler(404, `Could not find property with id ${req.params.id}`)

        return res.send(property)
    } catch (error) {
        next(error)
    }
}

// @desc    Create property
// @route   POST /properties
// @access  Private
export const createProperty = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const propertyRepository = getConnection().getRepository(Property)

        const property = propertyRepository.create({ ...req.body, administratorId: (req.user as User).id })
        const results = await propertyRepository.save(property)

        return res.status(201).send(results)
    } catch (error) {
        next(error)
    }
}

// @desc    Modify property
// @route   PATCH /properties/:id
// @access  Private
export const modifyProperty = async (req: Request, res: Response, next: NextFunction) => {
    const { id: propertyID } = req.params
    try {
        const propertyRepository = getConnection().getRepository(Property)

        const property = await propertyRepository.findOne(propertyID)

        if (!property) throw new ErrorHandler(404, `Could not find property with id ${propertyID}`)

        // Check if user can modify property
        if (property.administratorId !== (req.user as User).id) {
            throw new ErrorHandler(401, 'You cannot modify this property')
        }

        const result = await propertyRepository.save({ ...property, ...req.body })

        return res.send(result)
    } catch (error) {
        next(error)
    }
}