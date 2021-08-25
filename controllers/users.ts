import { Request, Response, NextFunction } from 'express'
import { getConnection } from 'typeorm'
import passport from 'passport'

import { User } from '../database/entities/user'
import { ErrorHandler } from '../utils/errorHandler'

// @desc    Get logged in user
// @route   GET /users/me
// @access  Private
export const getLoggedInUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(req.user)
    } catch (error) {
        next(error)
    }
}

// @desc    Get user by ID
// @route   GET /users/:id
// @access  Public
export const getUserByID = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userRepository = getConnection().getRepository(User)

        const user = await userRepository.findOne(req.params.id)

        if (!user) throw new ErrorHandler(404, 'User not found')

        return res.json(user)
    } catch (error) {
        next(error)
    }
}

// @desc    Create user
// @route   POST /users
// @access  Public
export const createUser = async (req: Request<{}, {}, User>, res: Response, next: NextFunction) => {
    try {
        const userRepository = getConnection().getRepository(User)

        const user = userRepository.create(req.body)
        const results = await userRepository.save(user)

        return res.status(201).send(results)
    } catch (error) {
        next(error)
    }
}

// @desc    Login user
// @route   POST /users/login
// @access  Public
export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("local", (error, user, _info) => {
        if (error) {
            next(error)
        }

        try {
            if (!user) throw new ErrorHandler(400, 'Incorrect credentials')

            req.login(user, error => {
                if (error) next(error)

                delete user.password

                res.json(user)
            })
        } catch (error) {
            next(error)
        }
    })(req, res, next)
}

// @desc    Logout user
// @route   POST /users/logout
// @access  Private
export const logoutUser = async (req: Request, res: Response, _next: NextFunction) => {
    req.logout()
    res.json()
}

export const modifyUser = async (req: Request, res: Response, next: NextFunction) => {

}