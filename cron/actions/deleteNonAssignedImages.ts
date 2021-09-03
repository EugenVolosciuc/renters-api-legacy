import { getConnection } from 'typeorm'
import dayjs from 'dayjs'

import { Photo } from '../../database/entities/Photo'
import { cloudinary } from '../../config/cloudinary'

export const deleteNonAssignedImages = async () => {
    const connection = getConnection()
    const photoRepository = connection.getRepository(Photo)

    const sevenHoursAgo = dayjs().subtract(7, 'hours').format('YYYY-MM-DD HH:mm:ss')

    // Get all unassigned photos older than 6 hours
    const result = await photoRepository
        .createQueryBuilder('photo')
        .select('photo.id')
        .addSelect('photo.public_id')
        .where("photo.propertyId IS NULL")
        .orWhere("photo.billId IS NULL") 
        .andWhere(`photo.createdAt <= TO_TIMESTAMP('${sevenHoursAgo}', 'YYYY-MM-DD HH24:MI:SS')`)
        .getMany()

    if (result.length > 0) {
        const { photoIds, photoPublicIds } = result.reduce((accumulator, currentValue) => {
            accumulator.photoIds.push(currentValue.id)
            accumulator.photoPublicIds.push(currentValue.public_id)

            return accumulator
        }, {
            photoIds: [],
            photoPublicIds: []
        })

        // Delete photos from cloudinary
        // NOTE/TODO: When a deletion request has more than 1000 resources to delete, 
        // the response includes the partial boolean parameter set to true, 
        // as well as a next_cursor value. 
        // You can then specify this returned next_cursor value as a parameter of the following deletion request.
        await cloudinary.api.delete_resources(photoPublicIds)

        await photoRepository.delete(photoIds)
    }
}