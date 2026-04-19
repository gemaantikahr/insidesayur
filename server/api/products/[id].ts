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

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: true,
      units: true,
      category: true,
      packages: true
    }
  })

  if (!product) {
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  }

  if (method === 'GET') {
    return product
  }

  if (method === 'PUT') {
    const formData = await readMultipartFormData(event)
    if (!formData) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid form data' })
    }

    let name = product.name
    let slug = product.slug
    let productCategoryId = product.productCategoryId
    let description = product.description
    let isActive = product.isActive
    let unitsRaw = ''
    let packageIdsRaw = ''
    let retainedImagesRaw = ''
    const files: { buffer: Buffer, filename: string, mimeType: string, sequence: number }[] = []

    for (const field of formData) {
      if (field.name === 'name') name = field.data.toString('utf-8')
      if (field.name === 'slug') slug = field.data.toString('utf-8')
      if (field.name === 'product_category_id') productCategoryId = parseInt(field.data.toString('utf-8')) || 0
      if (field.name === 'description') description = field.data.toString('utf-8')
      if (field.name === 'is_active') isActive = field.data.toString('utf-8') === 'true'
      if (field.name === 'units') unitsRaw = field.data.toString('utf-8')
      if (field.name === 'package_ids') packageIdsRaw = field.data.toString('utf-8')
      if (field.name === 'retained_images') retainedImagesRaw = field.data.toString('utf-8')
      
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

    // Process Units
    let unitsData: { id?: number, label: string, price: number }[] = []
    if (unitsRaw) {
      try {
        unitsData = JSON.parse(unitsRaw)
      } catch (e) {
        console.error('Failed to parse units', e)
      }
    }

    // Process Package IDs
    let packageIds: number[] = []
    if (packageIdsRaw) {
      try {
        packageIds = JSON.parse(packageIdsRaw)
      } catch (e) {
        console.error('Failed to parse package IDs', e)
      }
    }

    // Process retained images. The client sends an array of image IDs to keep, along with their new sequences if changed.
    let retainedImagesData: { id: number, sequence: number }[] = []
    if (retainedImagesRaw) {
      try {
        retainedImagesData = JSON.parse(retainedImagesRaw)
      } catch(e) {}
    }

    const retainedIds = retainedImagesData.map(img => img.id)
    const imagesToDelete = product.images.filter(img => !retainedIds.includes(img.id))

    // Delete removed images from S3 and Database
    for (const img of imagesToDelete) {
      await deleteFileFromS3(img.imageUrl)
    }

    // Upload new images
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
      // 1. Update basic product info
      const updatedProduct = await prisma.product.update({
        where: { id },
        data: {
          name,
          slug,
          productCategoryId,
          description,
          isActive,
          packages: {
            set: packageIds.map(id => ({ id }))
          }
        }
      })

      // 2. Manage Units (Delete all and recreate is easiest, or carefully upsert)
      // We will delete units that are not in the new list, update existing, and create new
      const currentUnitIds = product.units.map(u => u.id)
      const newUnitIds = unitsData.filter(u => u.id).map(u => u.id as number)
      const unitsToDelete = currentUnitIds.filter(id => !newUnitIds.includes(id))

      await prisma.productUnitWeight.deleteMany({
        where: { id: { in: unitsToDelete } }
      })

      for (const unit of unitsData) {
        if (unit.id) {
          await prisma.productUnitWeight.update({
            where: { id: unit.id },
            data: { label: unit.label, price: unit.price }
          })
        } else {
          await prisma.productUnitWeight.create({
            data: { productId: id, label: unit.label, price: unit.price }
          })
        }
      }

      // 3. Manage Images
      await prisma.productImage.deleteMany({
        where: { id: { in: imagesToDelete.map(i => i.id) } }
      })

      for (const retained of retainedImagesData) {
        await prisma.productImage.update({
          where: { id: retained.id },
          data: { sequence: retained.sequence }
        })
      }

      for (const newImg of uploadedImages) {
        await prisma.productImage.create({
          data: { productId: id, imageUrl: newImg.imageUrl, sequence: newImg.sequence }
        })
      }

      return await prisma.product.findUnique({
        where: { id },
        include: { images: true, units: true, category: true, packages: true }
      })
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw createError({ statusCode: 400, statusMessage: 'Slug already exists' })
      }
      console.error(error)
      throw createError({ statusCode: 500, statusMessage: 'Failed to update product' })
    }
  }

  if (method === 'DELETE') {
    // Delete all images from S3 first
    for (const img of product.images) {
      await deleteFileFromS3(img.imageUrl)
    }

    await prisma.product.delete({
      where: { id }
    })

    return { success: true }
  }

  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
})
