import { Request, Response, NextFunction } from 'express'
import { getConnection } from 'typeorm'
import passport from 'passport'
import dayjs from 'dayjs'
import jwt from 'jsonwebtoken'

import { User } from '../database/entities/User'
import { ErrorHandler } from '../utils/errorHandler'
import { SESSION_COOKIE_NAME } from '../config/passport'
import { getHostname } from '../utils/getHostname'
import Mail from '../config/mail'
import { splitName } from '../utils/splitName'
import { Contract } from '../database/entities/Contract'

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

// @desc    Get paginated list of authed property admin's renters
// @route   GET /users/renters
// @access  PROPERTY_ADMIN
export const getRentersOfPropertyAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const contractRepository = getConnection().getRepository(Contract)

        const paginatedContracts = await contractRepository
            .createQueryBuilder('contract')
            .leftJoinAndSelect('contract.renter', 'renter')
            .leftJoinAndSelect('contract.property', 'property',)
            .where(
                'property.administratorId = :administratorId',
                { administratorId: (req.user as User).id }
            )
            .paginate()

        res.send(paginatedContracts)
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
// @access  PROPERTY_ADMIN
export const sendSignupInvitationToRenter = async (req: Request, res: Response, next: NextFunction) => {
    const { user, body } = req
    const { renterEmail, renterName, propertyType, propertyTitle, contractId } = body
    const userRepository = getConnection().getRepository(User)

    try {
        const renterAccountAlreadyExists = await userRepository.findOne({ email: body.renterEmail })

        if (renterAccountAlreadyExists) {
            console.log('not yet implemented')
            // TODO: add case where renter already has an account (need general email template first)
        } else {
            const deadline = dayjs().add(Mail.acceptInvitationDeadline, 'seconds').unix()
            const inviteId = jwt.sign(
                { renterEmail, renterName, contractId, deadline },
                process.env.JWT_SECRET,
                { expiresIn: '3 days' }
            )

            const propertyAdmin = `${(user as User).firstName} ${(user as User).lastName}`

            await Mail.sendRenterInvitationToCreateAccount({
                renterEmail,
                propertyType,
                propertyTitle,
                renterFirstName: splitName(renterName).firstName,
                propertyAdmin,
                inviteId
            })
        }

        res.send()
    } catch (error) {
        next(error)
    }
}

// @desc    Get renting invitation data
// @route   GET /users/invitation-data/:inviteId
// @access  Public
export const getInvitationData = async (req: Request, res: Response, next: NextFunction) => {
    const { params: { inviteId } } = req
    const contractRepository = getConnection().getRepository(Contract)

    try {
        jwt.verify(inviteId, process.env.JWT_SECRET, async function (err, decoded) {
            if (err) throw new ErrorHandler(401, 'Token invalid')

            const { renterEmail, renterName, contractId } = decoded

            const contract = await contractRepository.findOne(
                contractId,
                { relations: ['property', 'property.administrator'] }
            )

            return res.send({ contract, renterEmail, renterName })
        })
    } catch (error) {
        next(error)
    }
}