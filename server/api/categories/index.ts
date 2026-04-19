import { PrismaClient } from '@prisma/client'
import { uploadFileToS3 } from '../../utils/s3'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const method = event.method

  if (method === 'GET') {
    const categories = await prisma.productCategory.findMany({
      orderBy: { sequence: 'asc' }
    })
    return categories
  }

  if (method === 'POST') {
    const formData = await readMultipartFormData(event)
    if (!formData) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid form data' })
    }

    let name = ''
    let slug = ''
    let sequence = 0
    let isActive = true
    let imageBuffer: Buffer | null = null
    let filename = ''
    let mimeType = ''

    for (const field of formData) {
      if (field.name === 'name') name = field.data.toString('utf-8')
      if (field.name === 'slug') slug = field.data.toString('utf-8')
      if (field.name === 'sequence') sequence = parseInt(field.data.toString('utf-8')) || 0
      if (field.name === 'is_active') isActive = field.data.toString('utf-8') === 'true'
      if (field.name === 'image' && field.filename) {
        imageBuffer = field.data
        filename = field.filename
        mimeType = field.type || 'image/jpeg'
      }
    }

    if (!name) {
      throw createError({ statusCode: 400, statusMessage: 'Name is required' })
    }

    // Auto-generate slug if empty
    if (!slug) {
      slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    }

    let imageUrl = null
    if (imageBuffer) {
      try {
        imageUrl = await uploadFileToS3(imageBuffer, filename, mimeType)
      } catch (error) {
        console.error('Error uploading image to S3:', error)
        throw createError({ statusCode: 500, statusMessage: 'Failed to upload image' })
      }
    }

    try {
      const newCategory = await prisma.productCategory.create({
        data: {
          name,
          slug,
          sequence,
          isActive,
          image: imageUrl
        }
      })
      return newCategory
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw createError({ statusCode: 400, statusMessage: 'Slug already exists' })
      }
      throw createError({ statusCode: 500, statusMessage: 'Failed to create category' })
    }
  }

  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
})
