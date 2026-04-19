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

  const category = await prisma.productCategory.findUnique({
    where: { id }
  })

  if (!category) {
    throw createError({ statusCode: 404, statusMessage: 'Category not found' })
  }

  if (method === 'GET') {
    return category
  }

  if (method === 'PUT') {
    const formData = await readMultipartFormData(event)
    if (!formData) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid form data' })
    }

    let name = category.name
    let slug = category.slug
    let sequence = category.sequence
    let isActive = category.isActive
    let imageBuffer: Buffer | null = null
    let filename = ''
    let mimeType = ''
    let removeImage = false

    for (const field of formData) {
      if (field.name === 'name') name = field.data.toString('utf-8')
      if (field.name === 'slug') slug = field.data.toString('utf-8')
      if (field.name === 'sequence') sequence = parseInt(field.data.toString('utf-8')) || 0
      if (field.name === 'is_active') isActive = field.data.toString('utf-8') === 'true'
      if (field.name === 'remove_image') removeImage = field.data.toString('utf-8') === 'true'
      if (field.name === 'image' && field.filename) {
        imageBuffer = field.data
        filename = field.filename
        mimeType = field.type || 'image/jpeg'
      }
    }

    if (!name) {
      throw createError({ statusCode: 400, statusMessage: 'Name is required' })
    }

    if (!slug) {
      slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    }

    let imageUrl = category.image

    // If removing image or uploading a new one, delete the old one from S3
    if ((removeImage || imageBuffer) && category.image) {
      await deleteFileFromS3(category.image)
      imageUrl = null
    }

    // Upload new image if provided
    if (imageBuffer) {
      try {
        imageUrl = await uploadFileToS3(imageBuffer, filename, mimeType)
      } catch (error) {
        console.error('Error uploading image to S3:', error)
        throw createError({ statusCode: 500, statusMessage: 'Failed to upload image' })
      }
    }

    try {
      const updatedCategory = await prisma.productCategory.update({
        where: { id },
        data: {
          name,
          slug,
          sequence,
          isActive,
          image: imageUrl
        }
      })
      return updatedCategory
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw createError({ statusCode: 400, statusMessage: 'Slug already exists' })
      }
      throw createError({ statusCode: 500, statusMessage: 'Failed to update category' })
    }
  }

  if (method === 'DELETE') {
    // Optionally delete image from S3
    if (category.image) {
      await deleteFileFromS3(category.image)
    }

    await prisma.productCategory.delete({
      where: { id }
    })

    return { success: true }
  }

  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
})
