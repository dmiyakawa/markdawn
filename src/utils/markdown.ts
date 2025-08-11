import { marked } from 'marked'
import { getStoredImage, getStoredImages } from './imageOperations'

/**
 * Configure marked with safe defaults and syntax highlighting support
 */
function configureMarked() {
  marked.setOptions({
    breaks: true, // Support line breaks
    gfm: true, // GitHub Flavored Markdown
  })
}

// Map to track image data URLs to their stored IDs
const imageDataToIdMap = new Map<string, string>()

/**
 * Process stored image references in markdown
 * Converts stored:image-id references to data URLs and tracks the mapping
 */
function processStoredImages(markdown: string): string {
  // Clear the map for fresh tracking
  imageDataToIdMap.clear()

  return markdown.replace(
    /!\[(.*?)\]\(stored:([^)]+)\)/g,
    (match, altText, imageId) => {
      const storedImage = getStoredImage(imageId)
      if (storedImage) {
        // Track the mapping from data URL to stored ID
        imageDataToIdMap.set(storedImage.data, imageId)
        console.log(
          `Tracking image: ${imageId} -> ${storedImage.data.substring(0, 50)}...`
        )
        // Add both data-stored-id and a class for easier identification
        return `<img src="${storedImage.data}" alt="${altText}" data-stored-id="${imageId}" class="stored-image" />`
      }
      // Return original markdown if image not found
      return `![${altText}](image-not-found:${imageId})`
    }
  )
}

/**
 * Convert markdown text to HTML using the marked library
 * @param markdown - The markdown text to convert
 * @returns HTML string
 */
export function convertMarkdownToHtml(markdown: string): string {
  if (!markdown.trim()) {
    return ''
  }

  configureMarked()

  try {
    // Process stored image references first
    const processedMarkdown = processStoredImages(markdown)
    return marked.parse(processedMarkdown) as string
  } catch (error) {
    console.error('Markdown parsing error:', error)
    // Fallback to original text if parsing fails
    return markdown.replace(/\n/g, '<br>')
  }
}

/**
 * Find stored image ID by data URL
 * Searches through all stored images to find a match
 */
function findStoredImageByDataUrl(dataUrl: string): string | null {
  const storedImages = getStoredImages()
  for (const image of storedImages) {
    if (image.data === dataUrl) {
      return image.id
    }
  }
  return null
}

/**
 * Basic HTML to markdown conversion (for WYSIWYG mode)
 * This is a simplified implementation - consider using a proper library like turndown for production
 * @param html - The HTML to convert
 * @returns Markdown string
 */
export function convertHtmlToMarkdown(html: string): string {
  if (!html.trim()) {
    return ''
  }

  console.log('Converting HTML to Markdown:', html.substring(0, 200) + '...')

  return (
    html
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
      .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
      .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n')
      .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n')
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
      .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
      .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
      .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
      .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
      // Handle stored images with data-stored-id attribute (from our conversion)
      .replace(
        /<img[^>]*data-stored-id="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi,
        (match, storedId, alt) => {
          console.log(`Found img with data-stored-id: ${storedId}, alt: ${alt}`)
          return `![${alt}](stored:${storedId})`
        }
      )
      // Handle stored images with class attribute (backup approach)
      .replace(
        /<img[^>]*class="[^"]*stored-image[^"]*"[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi,
        (match, src, alt) => {
          console.log(`Found stored-image class: alt="${alt}", src="${src.substring(0, 50)}..."`)
          // Try to find by data URL in imageDataToIdMap first
          let storedId = imageDataToIdMap.get(src)
          if (!storedId) {
            // Fallback: search through all stored images
            storedId = findStoredImageByDataUrl(src)
          }
          if (storedId) {
            console.log(`Found stored ID: ${storedId}`)
            return `![${alt}](stored:${storedId})`
          }
          console.log(`No stored ID found for stored-image class`)
          return `![${alt}](${src})`
        }
      )
      // Handle any data URL images (try to match with stored images)
      .replace(
        /<img[^>]*src="(data:image\/[^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi,
        (match, src, alt) => {
          console.log(`Processing data URL image: alt="${alt}", src="${src.substring(0, 50)}..."`)
          // Try imageDataToIdMap first (from current session)
          let storedId = imageDataToIdMap.get(src)
          if (!storedId) {
            // Fallback: search through all stored images
            storedId = findStoredImageByDataUrl(src)
          }
          if (storedId) {
            console.log(`Found stored ID: ${storedId}`)
            return `![${alt}](stored:${storedId})`
          }
          // Regular data URL image (not stored)
          console.log(`No stored ID found, keeping data URL`)
          return `![${alt}](${src})`
        }
      )
      // Handle any remaining regular images
      .replace(
        /<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi,
        '![$2]($1)'
      )
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
      .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
      .replace(/<\/?(ul|ol)[^>]*>/gi, '\n')
      .replace(/<[^>]+>/g, '') // Remove any remaining HTML tags
      .replace(/\n{3,}/g, '\n\n') // Clean up excessive newlines
      .trim()
  )
}
