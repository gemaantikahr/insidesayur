import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import crypto from 'crypto'

const s3Client = new S3Client({
  region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
  endpoint: process.env.AWS_ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: process.env.AWS_USE_PATH_STYLE_ENDPOINT === 'true',
})

export const uploadFileToS3 = async (file: Buffer, filename: string, mimeType: string) => {
  const bucketName = process.env.AWS_BUCKET
  if (!bucketName) throw new Error('AWS_BUCKET is not defined in environment variables')

  // Generate a unique filename
  const uniqueFilename = `${crypto.randomUUID()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: uniqueFilename,
    Body: file,
    ContentType: mimeType,
    ACL: 'public-read',
  })

  await s3Client.send(command)

  // Construct public URL. Depends on the provider's format.
  // For standard S3: https://${bucketName}.s3.${region}.amazonaws.com/${uniqueFilename}
  // For custom endpoints, it might be ${endpoint}/${bucketName}/${uniqueFilename}
  const endpoint = process.env.AWS_ENDPOINT || ''
  if (endpoint) {
    if (process.env.AWS_USE_PATH_STYLE_ENDPOINT === 'true') {
      return `${endpoint}/${bucketName}/${uniqueFilename}`
    } else {
      // Assuming virtual hosted style if endpoint provided, or just appending
      const url = new URL(endpoint)
      return `${url.protocol}//${bucketName}.${url.host}/${uniqueFilename}`
    }
  }

  // Fallback (e.g. standard AWS)
  return `https://${bucketName}.s3.${process.env.AWS_DEFAULT_REGION || 'us-east-1'}.amazonaws.com/${uniqueFilename}`
}

export const deleteFileFromS3 = async (fileUrl: string) => {
  const bucketName = process.env.AWS_BUCKET
  if (!bucketName) return

  try {
    // Extract the key from the URL
    // e.g. https://devel.s3.nevaobjects.id/unique-filename.jpg -> unique-filename.jpg
    const url = new URL(fileUrl)
    let key = url.pathname.substring(1) // remove leading slash
    
    if (process.env.AWS_USE_PATH_STYLE_ENDPOINT === 'true') {
      // In path style, bucket is part of the path: /devel/filename
      if (key.startsWith(`${bucketName}/`)) {
        key = key.substring(bucketName.length + 1)
      }
    }

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    })

    await s3Client.send(command)
  } catch (error) {
    console.error('Error deleting file from S3:', error)
  }
}
