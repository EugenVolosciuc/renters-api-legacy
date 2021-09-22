import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import session from 'express-session'
import { v4 as uuidv4 } from 'uuid'
import redis, { RedisClient } from 'redis'
import connectRedis from 'connect-redis'
import passport from 'passport'
import { pagination } from 'typeorm-pagination'

import * as routes from './routes'
import { connect } from './database/connect'
import { handleError } from './utils/errorHandler'
import { initializePassport, SESSION_COOKIE_NAME } from './config/passport'
import { configureCloudinary } from './config/cloudinary'
import Mail from './config/mail'
import { initializeCronJobs } from './cron'

require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3002
const isProduction = process.env.NODE_ENV === 'production'
const RedisStore = connectRedis(session);

(async () => {
    // CONFIG
    app.use(express.json())
    app.use(pagination)

    // Cloudinary
    configureCloudinary()

    // Mail
    Mail.configureMail()

    // Redis config
    let redisClient: RedisClient
    if (isProduction) {
        redisClient = redis.createClient({
            url: process.env.REDIS_URL,
            no_ready_check: true
        })

        redisClient.on('error', (err) => {
            console.log('Redis error: ', err)
        })
    }

    app.use(cors({
        credentials: true,
        origin: [process.env.FRONTEND_LOCAL_LINK, process.env.FRONTEND_DEV_LINK]
    }))

    app.use(session({
        genid: () => {
            return uuidv4()
        },
        ...(isProduction
            ? { store: new RedisStore({ client: redisClient }) }
            : null
        ),
        proxy: true,
        secret: process.env.SESSION_SECRET,
        resave: false,
        name: SESSION_COOKIE_NAME,
        cookie: {
            secure: isProduction ? true : false,
            sameSite: isProduction ? 'none' : false,
            maxAge: 60000 * 60 * 24 // 1 minute * 60 minutes * 24 hours = 1 day
        },
        saveUninitialized: false
    }))

    await connect()

    await initializeCronJobs()

    // AUTH
    app.use(passport.initialize())
    app.use(passport.session())
    initializePassport()

    // ROUTES
    app.use('/admin', routes.adminRoutes)
    app.use('/users', routes.userRoutes)
    app.use('/properties', routes.propertyRoutes)
    app.use('/photos', routes.photoRoutes)
    app.use('/documents', routes.documentRoutes)
    app.use('/contracts', routes.contractRoutes)

    // ERROR HANDLING
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
        handleError(err, res)
    })

    app.listen(PORT, () => console.log(`API running on port ${PORT}`))
})()