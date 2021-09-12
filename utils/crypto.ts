// https://attacomsian.com/blog/nodejs-encrypt-decrypt-data
import crypto from 'crypto'

const algorithm = 'aes-256-ctr'
const iv = crypto.randomBytes(16)

export const encrypt = (text: crypto.BinaryLike) => {
    const secretKey = process.env.CRYPTO_SECRET

    const cipher = crypto.createCipheriv(algorithm, secretKey, iv)

    const encrypted = Buffer.concat([cipher.update(text), cipher.final()])

    return `${iv.toString('hex')}.${encrypted.toString('hex')}`
}

export const decrypt = (hash: string) => {
    const secretKey = process.env.CRYPTO_SECRET
    
    const [iv, content] = hash.split('.')

    const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(iv, 'hex'))

    const decrpyted = Buffer.concat([decipher.update(Buffer.from(content, 'hex')), decipher.final()])

    return decrpyted.toString()
}
