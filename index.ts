import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import session from 'express-session'
import { v4 as uuidv4 } from 'uuid'
import redis, { RedisClient } from 'redis'
import connectRedis from 'connect-redis'
import passport from 'passport'
import { pagination } from 'typeorm-pagination'

import { connect } from './database/connect'
import { handleError } from './utils/errorHandler'
import { initializePassport } from './config/passport'
import * as routes from './routes'

require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3002
const isProduction = process.env.NODE_ENV === 'production'
const RedisStore = connectRedis(session);

(async () => {
    // CONFIG
    app.use(express.json())
    app.use(pagination)

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
        name: "renters_session",
        cookie: {
            secure: isProduction ? true : false,
            sameSite: isProduction ? 'none' : false,
            maxAge: 60000 * 60 * 24 // 1 minute * 60 minutes * 24 hours = 1 day
        },
        saveUninitialized: false
    }))

    await connect()

    // AUTH
    app.use(passport.initialize())
    app.use(passport.session())
    initializePassport()

    // ROUTES
    app.use('/users', routes.userRoutes)
    app.use('/properties', routes.propertyRoutes)

    // ERROR HANDLING
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
        handleError(err, res)
    })

    app.listen(PORT, () => console.log(`API running on port ${PORT}`))
})()