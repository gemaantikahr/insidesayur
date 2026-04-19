import { PrismaClient } from '@prisma/client'
import { uploadFileToS3 } from '../../utils/s3'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const method = event.method

  if (method === 'GET') {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        images: {
          orderBy: { sequence: 'asc' }
        },
        units: true
      },
      orderBy: { createdAt: 'desc' }
    })
    return products
  }

  if (method === 'POST') {
    const formData = await readMultipartFormData(event)
    if (!formData) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid form data' })
    }

    let name = ''
    let slug = ''
    let productCategoryId = 0
    let description = ''
    let isActive = true
    let unitsRaw = ''
    const files: { buffer: Buffer, filename: string, mimeType: string, sequence: number }[] = []

    // Map to keep track of image sequences. Assuming keys like 'images[0]', 'images[1]'
    for (const field of formData) {
      if (field.name === 'name') name = field.data.toString('utf-8')
      if (field.name === 'slug') slug = field.data.toString('utf-8')
      if (field.name === 'product_category_id') productCategoryId = parseInt(field.data.toString('utf-8')) || 0
      if (field.name === 'description') description = field.data.toString('utf-8')
      if (field.name === 'is_active') isActive = field.data.toString('utf-8') === 'true'
      if (field.name === 'units') unitsRaw = field.data.toString('utf-8')
      
      // Handle images like image_0, image_1 etc. to maintain sequence
      if (field.name && field.name.startsWith('image_') && field.filename) {
        const seqMatch = field.name.match(/image_(\d+)/)
        const sequence = seqMatch ? parseInt(seqMatch[1]) : 0
        files.push({
          buffer: field.data,
          filename: field.filename,
          mimeType: field.type || 'image/jpeg',
          sequence
        })
      }
    }

    if (!name || !productCategoryId) {
      throw createError({ statusCode: 400, statusMessage: 'Name and category are required' })
    }

    if (!slug) {
      slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    }

    // Parse units
    let unitsData: { label: string, price: number }[] = []
    if (unitsRaw) {
      try {
        unitsData = JSON.parse(unitsRaw)
      } catch (e) {
        console.error('Failed to parse units', e)
      }
    }

    // Upload images
    const uploadedImages: { imageUrl: string, sequence: number }[] = []
    for (const file of files) {
      try {
        const url = await uploadFileToS3(file.buffer, file.filename, file.mimeType)
        uploadedImages.push({ imageUrl: url, sequence: file.sequence })
      } catch (e) {
        console.error('Failed to upload image', e)
      }
    }

    try {
      const product = await prisma.product.create({
        data: {
          name,
          slug,
          productCategoryId,
          description,
          isActive,
          units: {
            create: unitsData.map(u => ({ label: u.label, price: u.price }))
          },
          images: {
            create: uploadedImages.map(img => ({ imageUrl: img.imageUrl, sequence: img.sequence }))
          }
        },
        include: {
          units: true,
          images: true
        }
      })
      return product
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw createError({ statusCode: 400, statusMessage: 'Slug already exists' })
      }
      console.error(error)
      throw createError({ statusCode: 500, statusMessage: 'Failed to create product' })
    }
  }

  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
})
