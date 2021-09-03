import { Request, Response, NextFunction } from 'express'

import { User, USER_ROLES } from '../database/entities/User'
import { ErrorHandler } from '../utils/errorHandler';

export const auth = (acceptedRoles?: USER_ROLES[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) throw new ErrorHandler(401, 'Please authenticate')

        if (acceptedRoles) {
            if (!acceptedRoles.includes((req.user as User).role)) {
                throw new ErrorHandler(401, 'You do not have the necessary rights to view this content')
            }
        }

        next()
    }
}