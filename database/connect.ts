import path from 'path'
import { createConnection } from 'typeorm'

const isProduction = process.env.NODE_ENV === "production"

export const connect = async () => {
    await createConnection({
        type: "postgres",
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT as string, 10),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        synchronize: !isProduction,
        logging: !isProduction,
        entities: [
            path.join(__dirname, 'entities', '*.ts'),
            path.join(__dirname, 'entities', '*.js')
        ]
    })
}