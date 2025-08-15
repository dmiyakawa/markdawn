/**
 * Heavy image processing operations
 * Functions for image manipulation, resizing, and file processing
 */

import type { StoredImage, ImageResizeOptions } from './imageStorage'

/**
 * Validate if file is a supported image format
 */
export function isValidImageFile(file: File): boolean {
  const supportedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  return supportedTypes.includes(file.type)
}

/**
 * Resize image using canvas to reduce file size
 */
export function resizeImage(
  file: File,
  options: ImageResizeOptions = {}
): Promise<string> {
  const {
    maxWidth = 1200,
    maxHeight = 800,
    quality = 0.8,
    format = 'jpeg',
  } = options

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    if (!ctx) {
      reject(new Error('Canvas context not available'))
      return
    }

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img

      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      if (height > maxHeight) {
        width = (width * maxHeight) / height
        height = maxHeight
      }

      // Set canvas dimensions
      canvas.width = width
      canvas.height = height

      // Draw and resize image
      ctx.drawImage(img, 0, 0, width, height)

      // Convert to data URL with specified format and quality
      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg'
      const dataUrl = canvas.toDataURL(mimeType, quality)

      resolve(dataUrl)
    }

    img.onerror = () => {
      reject(new Error('Failed to load image for resizing'))
    }

    // Convert File to data URL for img.src
    const reader = new FileReader()
    reader.onload = (e) => {
      img.src = e.target?.result as string
    }
    reader.onerror = () => {
      reject(new Error('Failed to read image file'))
    }
    reader.readAsDataURL(file)
  })
}

/**
 * Get image dimensions from file
 */
export function getImageDimensions(file: File): Promise<{
  width: number
  height: number
}> {
  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      })
    }

    img.onerror = () => {
      reject(new Error('Failed to load image to get dimensions'))
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      img.src = e.target?.result as string
    }
    reader.onerror = () => {
      reject(new Error('Failed to read image file'))
    }
    reader.readAsDataURL(file)
  })
}

/**
 * Process image file for storage (resize, validate, create StoredImage object)
 */
export async function processImageForStorage(
  file: File,
  resizeOptions: ImageResizeOptions = {}
): Promise<StoredImage> {
  // Validate file type
  if (!isValidImageFile(file)) {
    throw new Error(
      `Unsupported image format: ${file.type}. Supported formats: JPEG, PNG, WebP, GIF`
    )
  }

  // Check file size (max 10MB before processing)
  const maxFileSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxFileSize) {
    throw new Error(
      `Image file too large: ${Math.round(file.size / 1024 / 1024)}MB. Maximum allowed: 10MB`
    )
  }

  try {
    // Get original dimensions
    const originalDimensions = await getImageDimensions(file)

    // Resize image to reduce file size
    const resizedDataUrl = await resizeImage(file, resizeOptions)

    // Calculate the size of the base64 string
    const base64Size = Math.round((resizedDataUrl.length * 3) / 4)

    // Check if processed image is still too large for localStorage
    const maxStorageSize = 5 * 1024 * 1024 // 5MB for localStorage
    if (base64Size > maxStorageSize) {
      throw new Error(
        `Processed image still too large: ${Math.round(base64Size / 1024 / 1024)}MB. Try reducing quality or dimensions.`
      )
    }

    // Import generateImageId dynamically to avoid circular dependency
    const { generateImageId } = await import('./imageStorage')
    
    const storedImage: StoredImage = {
      id: generateImageId(),
      name: file.name,
      data: resizedDataUrl,
      size: base64Size,
      width: originalDimensions.width,
      height: originalDimensions.height,
      type: file.type,
      uploadedAt: new Date().toISOString(),
    }

    return storedImage
  } catch (error) {
    throw new Error(
      `Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}
