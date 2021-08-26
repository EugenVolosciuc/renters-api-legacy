import { Response } from 'express'

import databaseErrorHandlers from './databaseErrorHandlers'

type Message = string | { field: string, message: string }[]

const isDev = process.env.NODE_ENV === 'development';

export class ErrorHandler {
    constructor(
        public statusCode: number, 
        public message: Message,
        public error?: Object
    ) { }
}

export const handleError = (err: any, res: Response) => {
    const { statusCode, message } = err;

    if (isDev) console.error(err);

    const defaultErrorHandler = () => {
        return res.status(statusCode || 500).json({
            status: "error",
            ...(err.code && { errorCode: err.code }),
            ...(statusCode === 400 && { error: message }),
            ...(statusCode !== 400 && { message })
        });
    }

    const allErrorHandlers = [...databaseErrorHandlers, defaultErrorHandler]
    allErrorHandlers.some(databaseErrorHandler => databaseErrorHandler(err, res))
};