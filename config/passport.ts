import passport from "passport"
import passportLocal from "passport-local"
import bcrypt from 'bcryptjs'
import { getConnection } from 'typeorm'

import { User } from '../database/entities/user'
import { ErrorHandler } from "../utils/errorHandler"

const LocalStrategy = passportLocal.Strategy

export const SESSION_COOKIE_NAME = "renters_session"

export const initializePassport = function () {
    const userRepository = getConnection().getRepository(User)

    passport.use(new LocalStrategy(
        { usernameField: 'email', passwordField: 'password' },
        async (email, password, done) => {
            try {
                const user = await userRepository
                    .createQueryBuilder("user")
                    .select('user')
                    .addSelect('user.password')
                    .where("user.email = :email", { email })
                    .getOneOrFail()

                const correctCredentials = await bcrypt.compare(password, user.password)

                if (correctCredentials) {
                    return done(null, user)
                } else {
                    throw new ErrorHandler(400, 'Incorrect credentials')
                }
            } catch (error) {
                done(null, false)
            }
        }
    ))

    passport.serializeUser((user: any, done: any) => {
        done(null, user.email)
    })

    passport.deserializeUser(async (email: any, done: any) => {
        try {
            const user = await userRepository.findOne({ email })
            done(null, user)
        } catch (error) {
            done(error, false)
        }
    })
}