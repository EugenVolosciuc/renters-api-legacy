import { validate } from 'class-validator'

import { ErrorHandler } from './errorHandler'

export const validateEntityInstance = async (entityInstance: any) => {
    const errors = await validate(entityInstance)

    if (errors.length > 0) {
        const parsedErrors = errors.map(error => ({ 
            field: error.property, 
            message: Object.values(error.constraints)[0]
        }))

        throw new ErrorHandler(400, parsedErrors)
    }
}