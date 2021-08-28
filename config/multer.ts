import multer from 'multer'

const storage = multer.diskStorage({
    destination: function (_req, _file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (_req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + '-' + file.originalname)
    }
})

export const upload = multer({ storage })