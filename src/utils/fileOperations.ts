/**
 * File operations utility functions for markdown editor
 * Handles import, export, and browser storage operations
 */

import JSZip from 'jszip'
import { getStoredImages, type StoredImage } from './imageOperations'
import type { Document } from '../types/document'

/**
 * Import markdown file from user's device
 * @param file - The file object from file input
 * @returns Promise resolving to file content as string
 */
export function importMarkdownFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'))
      return
    }

    // Validate file type
    if (
      !file.name.toLowerCase().endsWith('.md') &&
      !file.name.toLowerCase().endsWith('.markdown')
    ) {
      reject(new Error('Please select a markdown file (.md or .markdown)'))
      return
    }

    // Validate file size (limit to 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      reject(new Error('File is too large. Maximum size is 10MB'))
      return
    }

    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string
        resolve(content)
      } catch {
        reject(new Error('Failed to read file content'))
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsText(file)
  })
}

/**
 * Export markdown content as downloadable file
 * @param content - Markdown content to export
 * @param filename - Desired filename (defaults to current timestamp)
 */
export function exportMarkdownFile(content: string, filename?: string): void {
  const defaultFilename = `markdown-document-${new Date().toISOString().slice(0, 16).replace(/:/g, '-')}.md`
  const finalFilename = filename || defaultFilename

  // Create blob with markdown content
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })

  // Create download link
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = finalFilename
  link.style.display = 'none'

  // Trigger download
  document.body.appendChild(link)
  link.click()

  // Cleanup
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Convert data URL to blob for zip export
 */
function dataURLToBlob(dataURL: string): Blob {
  const arr = dataURL.split(',')
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'application/octet-stream'
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new Blob([u8arr], { type: mime })
}

/**
 * Get file extension from MIME type
 */
function getExtensionFromMimeType(mimeType: string): string {
  const extensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/svg+xml': 'svg',
  }
  return extensions[mimeType] || 'jpg'
}

/**
 * Convert stored image references in markdown to local file paths
 */
function convertStoredImagesToLocalPaths(
  markdown: string,
  images: StoredImage[]
): string {
  return markdown.replace(
    /!\[(.*?)\]\(stored:([^)]+)\)/g,
    (match, altText, imageId) => {
      const image = images.find((img) => img.id === imageId)
      if (image) {
        const extension = getExtensionFromMimeType(image.type)
        const filename = image.name.includes('.')
          ? image.name
          : `${image.name}.${extension}`
        return `![${altText}](images/${filename})`
      }
      return match
    }
  )
}

/**
 * Export markdown content and all stored images as a zip file
 * @param content - The markdown content to export
 * @param projectName - Optional project name for the zip file
 */
export async function exportAllFiles(
  content: string,
  projectName?: string
): Promise<void> {
  const zip = new JSZip()
  const storedImages = getStoredImages()

  // Generate project name with timestamp if not provided
  const defaultProjectName = `markdown-project-${new Date()
    .toISOString()
    .slice(0, 19)
    .replace(/[:.]/g, '-')}`

  const finalProjectName = projectName || defaultProjectName

  // Convert stored image references to local paths
  const processedMarkdown = convertStoredImagesToLocalPaths(
    content,
    storedImages
  )

  // Add markdown file to zip
  zip.file(`${finalProjectName}.md`, processedMarkdown)

  // Add images to zip if any exist
  if (storedImages.length > 0) {
    const imagesFolder = zip.folder('images')

    for (const image of storedImages) {
      try {
        // Convert data URL to blob
        const blob = dataURLToBlob(image.data)

        // Generate filename with proper extension
        const extension = getExtensionFromMimeType(image.type)
        const filename = image.name.includes('.')
          ? image.name
          : `${image.name}.${extension}`

        // Add to zip
        imagesFolder?.file(filename, blob)
      } catch (error) {
        console.warn(`Failed to add image ${image.name} to zip:`, error)
      }
    }
  }

  try {
    // Generate zip file
    const zipBlob = await zip.generateAsync({ type: 'blob' })

    // Create download link
    const url = URL.createObjectURL(zipBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${finalProjectName}.zip`

    // Trigger download
    document.body.appendChild(a)
    a.click()

    // Cleanup
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    throw new Error(
      `Failed to create zip file: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Export all documents and images as a ZIP file
 * @param documents - Array of documents to export
 * @param projectName - Optional project name for the ZIP file
 */
export async function exportAllDocuments(
  documents: Document[],
  projectName?: string
): Promise<void> {
  const zip = new JSZip()
  const storedImages = getStoredImages()

  // Generate project name with timestamp if not provided
  const defaultProjectName = `markdown-project-${new Date()
    .toISOString()
    .slice(0, 19)
    .replace(/[:.]/g, '-')}`

  const finalProjectName = projectName || defaultProjectName

  // Add all documents to zip
  for (const document of documents) {
    // Convert stored image references to local paths for each document
    const processedMarkdown = convertStoredImagesToLocalPaths(
      document.content,
      storedImages
    )

    // Generate safe filename from document title
    const safeFilename = document.title
      .replace(/[^a-zA-Z0-9-_\s]/g, '') // Remove invalid chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .toLowerCase()

    // Add document to zip with safe filename
    zip.file(`${safeFilename}.md`, processedMarkdown)
  }

  // Add images to zip if any exist
  if (storedImages.length > 0) {
    const imagesFolder = zip.folder('images')

    for (const image of storedImages) {
      try {
        // Convert data URL to blob
        const blob = dataURLToBlob(image.data)

        // Generate filename with proper extension
        const extension = getExtensionFromMimeType(image.type)
        const filename = image.name.includes('.')
          ? image.name
          : `${image.name}.${extension}`

        // Add to zip
        imagesFolder?.file(filename, blob)
      } catch (error) {
        console.warn(`Failed to add image ${image.name} to zip:`, error)
      }
    }
  }

  try {
    // Generate zip file
    const zipBlob = await zip.generateAsync({ type: 'blob' })

    // Create download link
    const url = URL.createObjectURL(zipBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${finalProjectName}.zip`

    // Trigger download
    document.body.appendChild(a)
    a.click()

    // Cleanup
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    throw new Error(
      `Failed to create zip file: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Get export statistics
 */
export function getExportStats(content: string): {
  markdownSize: number
  imageCount: number
  totalImageSize: number
  totalSize: number
} {
  const storedImages = getStoredImages()
  const markdownSize = new Blob([content], { type: 'text/plain' }).size
  const totalImageSize = storedImages.reduce(
    (total, img) => total + img.size,
    0
  )

  return {
    markdownSize,
    imageCount: storedImages.length,
    totalImageSize,
    totalSize: markdownSize + totalImageSize,
  }
}

/**
 * Save markdown content to browser localStorage
 * @param content - Markdown content to save
 * @param key - Storage key (defaults to 'markdown-editor-content')
 */
export function saveToLocalStorage(
  content: string,
  key: string = 'markdown-editor-content'
): boolean {
  try {
    const data = {
      content,
      timestamp: new Date().toISOString(),
      version: '1.0',
    }

    localStorage.setItem(key, JSON.stringify(data))
    return true
  } catch (error) {
    console.error('Failed to save to localStorage:', error)
    return false
  }
}

/**
 * Load markdown content from browser localStorage
 * @param key - Storage key (defaults to 'markdown-editor-content')
 * @returns Saved content or null if not found
 */
export function loadFromLocalStorage(
  key: string = 'markdown-editor-content'
): string | null {
  try {
    const saved = localStorage.getItem(key)
    if (!saved) return null

    const data = JSON.parse(saved)
    return data.content || null
  } catch (error) {
    console.error('Failed to load from localStorage:', error)
    return null
  }
}

/**
 * Get save timestamp from localStorage
 * @param key - Storage key (defaults to 'markdown-editor-content')
 * @returns ISO timestamp string or null
 */
export function getSaveTimestamp(
  key: string = 'markdown-editor-content'
): string | null {
  try {
    const saved = localStorage.getItem(key)
    if (!saved) return null

    const data = JSON.parse(saved)
    return data.timestamp || null
  } catch {
    return null
  }
}

/**
 * Clear saved content from localStorage
 * @param key - Storage key (defaults to 'markdown-editor-content')
 */
export function clearLocalStorage(
  key: string = 'markdown-editor-content'
): boolean {
  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error('Failed to clear localStorage:', error)
    return false
  }
}

/**
 * Check if there's saved content available
 * @param key - Storage key (defaults to 'markdown-editor-content')
 */
export function hasSavedContent(
  key: string = 'markdown-editor-content'
): boolean {
  try {
    const saved = localStorage.getItem(key)
    return saved !== null
  } catch {
    return false
  }
}

/**
 * Get word count from markdown content
 * @param content - Markdown content
 * @returns Word count
 */
export function getWordCount(content: string): number {
  if (!content.trim()) return 0

  // Remove markdown syntax and count words
  const text = content
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`[^`]*`/g, '') // Remove inline code
    .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
    .replace(/\[.*?\]\(.*?\)/g, '') // Remove links
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/[*_]{1,2}(.*?)[*_]{1,2}/g, '$1') // Remove emphasis
    .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
    .trim()

  return text.split(/\s+/).filter((word) => word.length > 0).length
}

/**
 * Get character count from content
 * @param content - Text content
 * @returns Character count (with and without spaces)
 */
export function getCharacterCount(content: string): {
  withSpaces: number
  withoutSpaces: number
} {
  return {
    withSpaces: content.length,
    withoutSpaces: content.replace(/\s/g, '').length,
  }
}

/**
 * Get line count from content
 * @param content - Text content
 * @returns Number of lines
 */
export function getLineCount(content: string): number {
  if (!content) return 1
  return content.split('\n').length
}
