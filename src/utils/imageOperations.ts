/**
 * Image operations utility for handling image uploads, resizing, and browser storage
 */

export interface StoredImage {
  id: string
  name: string
  data: string // base64 encoded image data
  size: number // file size in bytes
  width: number
  height: number
  type: string // MIME type
  uploadedAt: string
}

export interface ImageResizeOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number // 0.1 to 1.0
  format?: 'jpeg' | 'png' | 'webp'
}

/**
 * Generate a unique ID for stored images
 */
export function generateImageId(): string {
  return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

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
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      reject(new Error('Canvas context not available'))
      return
    }

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
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

      // Draw and compress image
      ctx.drawImage(img, 0, 0, width, height)

      const mimeType = format === 'png' ? 'image/png' : `image/${format}`
      const dataUrl = canvas.toDataURL(mimeType, quality)

      resolve(dataUrl)
    }

    img.onerror = () => reject(new Error('Failed to load image'))

    // Create object URL for the image
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Get image dimensions from file
 */
export function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => {
      resolve({ width: img.width, height: img.height })
      URL.revokeObjectURL(img.src)
    }

    img.onerror = () =>
      reject(new Error('Failed to load image for dimension calculation'))

    img.src = URL.createObjectURL(file)
  })
}

/**
 * Process image file for storage - validate, resize, and prepare metadata
 */
export async function processImageForStorage(
  file: File,
  resizeOptions?: ImageResizeOptions
): Promise<StoredImage> {
  // Validate file type
  if (!isValidImageFile(file)) {
    throw new Error(`Unsupported image format: ${file.type}`)
  }

  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error(
      `Image file too large: ${(file.size / 1024 / 1024).toFixed(1)}MB (max 10MB)`
    )
  }

  try {
    // Get original dimensions
    const originalDimensions = await getImageDimensions(file)

    // Resize image
    const resizedDataUrl = await resizeImage(file, resizeOptions)

    // Calculate data size from base64
    const base64Size = Math.round((resizedDataUrl.length * 3) / 4)

    // Create stored image object
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

/**
 * Storage key for images in localStorage
 */
const IMAGES_STORAGE_KEY = 'markdown_editor_images'

/**
 * Get all stored images from localStorage
 */
export function getStoredImages(): StoredImage[] {
  try {
    const stored = localStorage.getItem(IMAGES_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Failed to load stored images:', error)
    return []
  }
}

/**
 * Save image to localStorage
 */
export function saveImageToStorage(image: StoredImage): boolean {
  try {
    const existingImages = getStoredImages()
    const updatedImages = [...existingImages, image]
    localStorage.setItem(IMAGES_STORAGE_KEY, JSON.stringify(updatedImages))
    return true
  } catch (error) {
    console.error('Failed to save image to storage:', error)
    return false
  }
}

/**
 * Get specific image by ID
 */
export function getStoredImage(id: string): StoredImage | null {
  const images = getStoredImages()
  return images.find((img) => img.id === id) || null
}

/**
 * Delete image from storage
 */
export function deleteStoredImage(id: string): boolean {
  try {
    const images = getStoredImages()
    const filteredImages = images.filter((img) => img.id !== id)
    localStorage.setItem(IMAGES_STORAGE_KEY, JSON.stringify(filteredImages))
    return true
  } catch (error) {
    console.error('Failed to delete image from storage:', error)
    return false
  }
}

/**
 * Get total storage size of all images
 */
export function getImagesStorageSize(): number {
  const images = getStoredImages()
  return images.reduce((total, img) => total + img.size, 0)
}

/**
 * Clear all stored images
 */
export function clearImageStorage(): boolean {
  try {
    localStorage.removeItem(IMAGES_STORAGE_KEY)
    return true
  } catch (error) {
    console.error('Failed to clear image storage:', error)
    return false
  }
}

/**
 * Generate markdown syntax for stored image
 */
export function generateImageMarkdown(
  image: StoredImage,
  altText?: string
): string {
  const alt = altText || image.name.split('.')[0] // Use filename without extension as default alt
  return `![${alt}](stored:${image.id})`
}
