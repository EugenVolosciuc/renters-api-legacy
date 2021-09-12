import { Request, Response, NextFunction } from 'express'
import { getConnection } from 'typeorm'
import passport from 'passport'
import dayjs from 'dayjs'

import { User } from '../database/entities/User'
import { ErrorHandler } from '../utils/errorHandler'
import { SESSION_COOKIE_NAME } from '../config/passport'
import { getHostname } from '../utils/getHostname'
import Mail from '../config/mail'
import { encrypt, decrypt } from '../utils/crypto'

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

        await Mail.sendWelcomeEmail({ name: user.firstName, to: user.email })

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
    req.session.destroy(() => null)
    res.clearCookie(SESSION_COOKIE_NAME, { path: '/', domain: getHostname(req.get('host')) })
    res.json()
}

// @desc    Modify authed user's details
// @route   PATCH /users/me
// @access  Private
export const modifyUserDetails = async (req: Request, res: Response, next: NextFunction) => {
    const userRepository = getConnection().getRepository(User)
    const { user, body } = req

    try {
        await userRepository.update(
            { id: (user as User).id },
            { ...body }
        )
        const updatedUser = await userRepository.findOne((user as User).id)

        res.send(updatedUser)
    } catch (error) {
        next(error)
    }
}

// @desc    Send renting invitation to renter
// @route   POST /users/renter-invite
// @access  Private
export const sendSignupInvitationToRenter = async (req: Request, res: Response, next: NextFunction) => {
    const { user, body } = req
    const { renterEmail, renterFirstName, propertyId } = body
    const userRepository = getConnection().getRepository(User)

    try {
        const renterAccountAlreadyExists = await userRepository.findOne({ email: body.renterEmail })

        if (renterAccountAlreadyExists) {
            console.log('not yet implemented')
            // TODO: add case where renter already has an account
        } else {
            const deadline = dayjs().add(Mail.acceptInvitationDeadline, 'seconds').unix()
            const inviteId = encrypt(`${renterEmail}.${renterFirstName}.${propertyId}.${deadline}`)

            const propertyAdmin = `${(user as User).firstName} ${(user as User).lastName}`

            await Mail.sendRenterInvitationToCreateAccount({
                ...body,
                propertyAdmin,
                inviteId
            })
        }

        res.send()
    } catch (error) {
        next(error)
    }
}