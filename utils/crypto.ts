import crypto from 'crypto'

const algorithm = 'aes-256-ctr'
const secretKey = process.env.CRYPTO_SECRET
const iv = crypto.randomBytes(16)

const encrypt = (text: crypto.BinaryLike) => {

    const cipher = crypto.createCipheriv(algorithm, secretKey, iv)

    const encrypted = Buffer.concat([cipher.update(text), cipher.final()])

    return `${iv.toString('hex')}.${encrypted.toString('hex')}`
}

const decrypt = (hash: string) => {
    const [iv, content] = hash.split('.')

    const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(iv, 'hex'))

    const decrpyted = Buffer.concat([decipher.update(Buffer.from(content, 'hex')), decipher.final()])

    return decrpyted.toString()
}


export { encrypt, decrypt }
