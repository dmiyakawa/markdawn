/**
 * Core image storage operations and utilities
 * Lightweight functions for managing stored images
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
 * Get specific stored image by ID
 */
export function getStoredImage(id: string): StoredImage | null {
  const images = getStoredImages()
  return images.find((img) => img.id === id) || null
}

/**
 * Delete stored image by ID
 */
export function deleteStoredImage(id: string): boolean {
  try {
    const images = getStoredImages()
    const filteredImages = images.filter((img) => img.id !== id)
    localStorage.setItem(IMAGES_STORAGE_KEY, JSON.stringify(filteredImages))
    return true
  } catch (error) {
    console.error('Failed to delete stored image:', error)
    return false
  }
}

/**
 * Get total storage size of all images in bytes
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
 * Generate markdown syntax for a stored image
 */
export function generateImageMarkdown(
  image: StoredImage,
  altText: string = image.name
): string {
  return `![${altText}](stored:${image.id})`
}

/**
 * Count how many times an image is used across documents
 */
export function countImageUsage(
  imageId: string,
  documents: Array<{ content: string }>
): number {
  let usageCount = 0
  const imageRef = `stored:${imageId}`

  documents.forEach((doc) => {
    const matches = doc.content.match(new RegExp(`\\(${imageRef}\\)`, 'g'))
    usageCount += matches ? matches.length : 0
  })

  return usageCount
}

/**
 * Get comprehensive usage statistics for all images
 */
export function getImageUsageStats(
  documents: Array<{ id: string; title: string; content: string }>
): Array<{
  image: StoredImage
  usageCount: number
  documentsUsing: Array<{ id: string; title: string }>
}> {
  const images = getStoredImages()
  return images.map((image) => ({
    image,
    usageCount: countImageUsage(image.id, documents),
    documentsUsing: findDocumentsUsingImage(image.id, documents),
  }))
}

/**
 * Find all documents that use a specific image
 */
export function findDocumentsUsingImage(
  imageId: string,
  documents: Array<{ id: string; title: string; content: string }>
): Array<{ id: string; title: string }> {
  const imageRef = `stored:${imageId}`
  return documents
    .filter((doc) => doc.content.includes(imageRef))
    .map(({ id, title }) => ({ id, title }))
}
