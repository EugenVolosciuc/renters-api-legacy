import { Response } from 'express'

import { capitalize } from "../capitalize"

const UNIQUE_VIOLATION_CODE = '23505'

export const handleUniqueViolation = (error: any, res: Response) => {
    if (error.code === UNIQUE_VIOLATION_CODE) {
        const textFromParatheses = error.detail.match(/[^\(\\)]+(?=\))/g)
        const key = textFromParatheses[0]
        const value = textFromParatheses[1]

        return res.status(400).send({ message: `${capitalize(error.table)} with ${key} ${value} already exists` })
    }
}