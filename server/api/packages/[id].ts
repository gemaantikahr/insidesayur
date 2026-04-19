import { PrismaClient } from '@prisma/client'
import { uploadFileToS3, deleteFileFromS3 } from '../../utils/s3'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const method = event.method
  const idStr = getRouterParam(event, 'id')
  const id = parseInt(idStr || '')

  if (isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  }

  const packageItem = await prisma.package.findUnique({
    where: { id }
  })

  if (!packageItem) {
    throw createError({ statusCode: 404, statusMessage: 'Package not found' })
  }

  if (method === 'GET') {
    return packageItem
  }

  if (method === 'PUT') {
    const formData = await readMultipartFormData(event)
    if (!formData) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid form data' })
    }

    let name = packageItem.name
    let price = Number(packageItem.price)
    let sequence = packageItem.sequence
    let isActive = packageItem.isActive
    let imageBuffer: Buffer | null = null
    let filename = ''
    let mimeType = ''
    let removeImage = false

    for (const field of formData) {
      if (field.name === 'name') name = field.data.toString('utf-8')
      if (field.name === 'price') price = parseFloat(field.data.toString('utf-8')) || 0
      if (field.name === 'sequence') sequence = parseInt(field.data.toString('utf-8')) || 0
      if (field.name === 'is_active') isActive = field.data.toString('utf-8') === 'true'
      if (field.name === 'remove_image') removeImage = field.data.toString('utf-8') === 'true'
      if (field.name === 'image' && field.filename) {
        imageBuffer = field.data
        filename = field.filename
        mimeType = field.type || 'image/jpeg'
      }
    }

    if (!name || price <= 0) {
      throw createError({ statusCode: 400, statusMessage: 'Name and a valid price are required' })
    }

    let imageUrl = packageItem.image

    if ((removeImage || imageBuffer) && packageItem.image) {
      await deleteFileFromS3(packageItem.image)
      imageUrl = null
    }

    if (imageBuffer) {
      try {
        imageUrl = await uploadFileToS3(imageBuffer, filename, mimeType)
      } catch (error) {
        console.error('Error uploading image to S3:', error)
        throw createError({ statusCode: 500, statusMessage: 'Failed to upload image' })
      }
    }

    try {
      const updatedPackage = await prisma.package.update({
        where: { id },
        data: {
          name,
          price,
          sequence,
          isActive,
          image: imageUrl
        }
      })
      return updatedPackage
    } catch (error: any) {
      throw createError({ statusCode: 500, statusMessage: 'Failed to update package' })
    }
  }

  if (method === 'DELETE') {
    if (packageItem.image) {
      await deleteFileFromS3(packageItem.image)
    }

    await prisma.package.delete({
      where: { id }
    })

    return { success: true }
  }

  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
})
