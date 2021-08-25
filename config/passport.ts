import passport from "passport"
import passportLocal from "passport-local"
import bcrypt from 'bcryptjs'
import { getConnection } from 'typeorm'

import { User } from '../database/entities/user'
import { ErrorHandler } from "../utils/errorHandler"

const LocalStrategy = passportLocal.Strategy

export const initializePassport = function () {
    const userRepository = getConnection().getRepository(User)

    passport.use(new LocalStrategy(
        { usernameField: 'email', passwordField: 'password' },
        async (email, password, done) => {
            console.log("email", email)
            console.log("password", password)

            try {
                const user = await userRepository
                    .createQueryBuilder("user")
                    .select('user.email')
                    .addSelect('user.password')
                    .where("user.email = :email", { email })
                    .getOneOrFail()

                // const user = await userRepository.findOne({ email })

                const correctCredentials = await bcrypt.compare(password, user.password)

                if (correctCredentials) {
                    return done(null, user)
                } else {
                    throw new ErrorHandler(400, 'Incorrect credentials')
                }
            } catch (error) {
                console.log('error here', error)
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