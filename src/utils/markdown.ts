import { marked } from 'marked'
import { getStoredImage, getStoredImages } from './imageStorage'

/**
 * Parse image attributes from markdown syntax
 * Supports syntax like: ![alt](image.jpg){width=600px height=400px}
 */
function parseImageAttributes(attributeString: string): Record<string, string> {
  const attributes: Record<string, string> = {}

  if (!attributeString) {
    return attributes
  }

  // Parse key=value pairs within curly braces, including hyphenated keys like max-width
  const attributeRegex = /([\w-]+)=([^}\s]+)/g
  let match

  while ((match = attributeRegex.exec(attributeString)) !== null) {
    const [, key, value] = match
    attributes[key] = value
  }

  return attributes
}

/**
 * Generate CSS style string from image attributes
 */
function generateImageStyle(attributes: Record<string, string>): string {
  const styles: string[] = []

  // Handle width
  if (attributes.width) {
    const width =
      attributes.width.includes('px') ||
      attributes.width.includes('%') ||
      attributes.width.includes('em') ||
      attributes.width.includes('rem') ||
      attributes.width === 'auto'
        ? attributes.width
        : `${attributes.width}px`
    styles.push(`width: ${width}`)
  }

  // Handle height
  if (attributes.height) {
    const height =
      attributes.height.includes('px') ||
      attributes.height.includes('%') ||
      attributes.height.includes('em') ||
      attributes.height.includes('rem') ||
      attributes.height === 'auto'
        ? attributes.height
        : `${attributes.height}px`
    styles.push(`height: ${height}`)
  }

  // Handle max-width
  if (attributes['max-width']) {
    const maxWidth =
      attributes['max-width'].includes('px') ||
      attributes['max-width'].includes('%') ||
      attributes['max-width'].includes('em') ||
      attributes['max-width'].includes('rem')
        ? attributes['max-width']
        : `${attributes['max-width']}px`
    styles.push(`max-width: ${maxWidth}`)
  }

  // Default responsive behavior - only add if no explicit max-width and width is specified
  // Don't add for percentage widths as they're already responsive
  if (
    attributes.width &&
    !attributes['max-width'] &&
    attributes.width !== 'auto' &&
    !attributes.width.includes('%')
  ) {
    styles.push('max-width: 100%')
  }

  // Maintain aspect ratio - only add height: auto if height isn't explicitly set and width is set
  if (attributes.width && !attributes.height) {
    styles.push('height: auto')
  }

  return styles.length > 0 ? styles.join('; ') : ''
}

/**
 * Map file extensions to language identifiers for syntax highlighting
 */
function getLanguageFromExtension(extension: string): string {
  const extensionMap: Record<string, string> = {
    // JavaScript/TypeScript
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    mjs: 'javascript',
    cjs: 'javascript',

    // Python
    py: 'python',
    pyw: 'python',
    pyi: 'python',

    // Web technologies
    html: 'html',
    htm: 'html',
    css: 'css',
    scss: 'scss',
    sass: 'sass',
    less: 'less',

    // Markup and config
    json: 'json',
    xml: 'xml',
    yaml: 'yaml',
    yml: 'yaml',
    toml: 'toml',
    md: 'markdown',
    markdown: 'markdown',

    // Systems programming
    c: 'c',
    cpp: 'cpp',
    cc: 'cpp',
    cxx: 'cpp',
    h: 'c',
    hpp: 'cpp',
    rust: 'rust',
    rs: 'rust',
    go: 'go',

    // JVM languages
    java: 'java',
    kt: 'kotlin',
    scala: 'scala',

    // .NET languages
    cs: 'csharp',
    vb: 'vbnet',
    fs: 'fsharp',

    // Shell/scripting
    sh: 'bash',
    bash: 'bash',
    zsh: 'bash',
    fish: 'bash',
    ps1: 'powershell',
    bat: 'batch',
    cmd: 'batch',

    // Other languages
    php: 'php',
    rb: 'ruby',
    pl: 'perl',
    r: 'r',
    sql: 'sql',
    lua: 'lua',
    vim: 'vim',

    // Config and data
    ini: 'ini',
    cfg: 'ini',
    conf: 'ini',
    dockerfile: 'dockerfile',
    Dockerfile: 'dockerfile',
  }

  return extensionMap[extension] || extension
}

/**
 * Parse language and filename from code block info string
 * Supports format: language:filename (e.g., python:example.py)
 */
function parseCodeBlockInfo(infoString: string): {
  language: string
  filename?: string
} {
  if (!infoString) {
    return { language: '' }
  }

  const parts = infoString.split(':')
  if (parts.length >= 2) {
    return {
      language: parts[0].trim(),
      filename: parts[1].trim(),
    }
  }

  return { language: infoString.trim() }
}

/**
 * Generate copy-to-clipboard functionality HTML
 */
function generateCopyButton(code: string, filename?: string): string {
  // Ensure code is a string and handle edge cases
  const codeStr = String(code || '')
  // Escape for JavaScript string literal - need to escape quotes and newlines properly
  // Since we're using double quotes for the JS string, we need to escape double quotes
  const escapedCode = codeStr
    .replace(/\\/g, '\\\\') // Escape backslashes first
    .replace(/"/g, '\\"') // Escape double quotes (primary concern)
    .replace(/\n/g, '\\n') // Escape newlines
    .replace(/\r/g, '\\r') // Escape carriage returns
    .replace(/\t/g, '\\t') // Escape tabs

  const buttonText = 'Copy'
  const titleText = filename ? `Copy ${filename}` : 'Copy code'

  return `<button class="code-copy-btn" onclick='navigator.clipboard.writeText("${escapedCode}").then(() => { this.textContent = "Copied!"; setTimeout(() => this.textContent = "${buttonText}", 2000); }).catch(() => { this.textContent = "Failed"; setTimeout(() => this.textContent = "${buttonText}", 2000); })' title="${titleText}">${buttonText}</button>`
}

/**
 * Custom renderer for enhanced code blocks and images with dimension support
 */
function createCustomRenderer() {
  const renderer = new marked.Renderer()

  // Override code block rendering (modern marked.js API)
  renderer.code = function ({ text, lang }) {
    // Ensure parameters are strings
    const codeStr = String(text || '')
    const infoStr = String(lang || '')

    const { language, filename } = parseCodeBlockInfo(infoStr)
    const copyButton = generateCopyButton(codeStr, filename)

    // Build the code block HTML with enhanced structure
    let html = '<div class="enhanced-code-block">'

    // Add filename header if present
    if (filename) {
      html += `<div class="code-header"><span class="code-filename">${filename}</span>${copyButton}</div>`
    } else {
      html += `<div class="code-header"><span class="code-language">${language || 'text'}</span>${copyButton}</div>`
    }

    // Add the code block with language class for potential syntax highlighting
    // Use the code directly since marked already handles escaping
    html += `<pre class="code-content${language ? ` language-${language}` : ''}"><code>${codeStr}</code></pre>`
    html += '</div>'

    return html
  }

  // Override image rendering to support dimensions
  renderer.image = function ({ href, title, text }) {
    // Check for dimension attributes in the URL or title
    // Support syntax: ![alt](image.jpg "title"){width=600px height=400px}
    const urlMatch = href.match(/^(.+?)\{([^}]*)\}$/)
    const titleMatch = title?.match(/^(.+?)\{([^}]*)\}$/)

    let actualHref = href
    let actualTitle = title
    let attributeString = ''

    if (urlMatch) {
      actualHref = urlMatch[1]
      attributeString = urlMatch[2]
    } else if (titleMatch) {
      actualTitle = titleMatch[1]
      attributeString = titleMatch[2]
    }

    // Parse attributes and generate style
    const attributes = parseImageAttributes(attributeString)
    const style = generateImageStyle(attributes)
    const styleAttr = style ? ` style="${style}"` : ''

    // Add dimension attributes as data attributes for conversion back to markdown
    const widthAttr = attributes.width
      ? ` data-width="${attributes.width}"`
      : ''
    const heightAttr = attributes.height
      ? ` data-height="${attributes.height}"`
      : ''
    const maxWidthAttr = attributes['max-width']
      ? ` data-max-width="${attributes['max-width']}"`
      : ''

    // Build image HTML
    const titleAttr = actualTitle ? ` title="${actualTitle}"` : ''
    return `<img src="${actualHref}" alt="${text}"${titleAttr} class="markdown-image"${styleAttr}${widthAttr}${heightAttr}${maxWidthAttr} />`
  }

  return renderer
}

/**
 * Configure marked with safe defaults and enhanced features support
 */
function configureMarked() {
  marked.setOptions({
    breaks: true, // Support line breaks
    gfm: true, // GitHub Flavored Markdown
    renderer: createCustomRenderer(), // Use custom renderer for enhanced code blocks and images
  })
}

// Map to track image data URLs to their stored IDs
const imageDataToIdMap = new Map<string, string>()

/**
 * Process stored image references in markdown with dimension support
 * Converts stored:image-id references to data URLs and tracks the mapping
 * Supports syntax: ![alt](stored:image-id){width=600px height=400px}
 */
function processStoredImages(markdown: string): string {
  // Clear the map for fresh tracking
  imageDataToIdMap.clear()

  return markdown.replace(
    /!\[(.*?)\]\(stored:([^)]+)\)(?:\{([^}]*)\})?/g,
    (match, altText, imageId, attributeString) => {
      const storedImage = getStoredImage(imageId)
      if (storedImage) {
        // Track the mapping from data URL to stored ID
        imageDataToIdMap.set(storedImage.data, imageId)
        console.log(
          `Tracking image: ${imageId} -> ${storedImage.data.substring(0, 50)}...`
        )

        // Parse attributes and generate style
        const attributes = parseImageAttributes(attributeString || '')
        const style = generateImageStyle(attributes)
        const styleAttr = style ? ` style="${style}"` : ''

        // Add dimension attributes as data attributes for conversion back to markdown
        const widthAttr = attributes.width
          ? ` data-width="${attributes.width}"`
          : ''
        const heightAttr = attributes.height
          ? ` data-height="${attributes.height}"`
          : ''
        const maxWidthAttr = attributes['max-width']
          ? ` data-max-width="${attributes['max-width']}"`
          : ''

        // Add both data-stored-id and a class for easier identification
        return `<img src="${storedImage.data}" alt="${altText}" data-stored-id="${imageId}" class="stored-image"${styleAttr}${widthAttr}${heightAttr}${maxWidthAttr} />`
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
    let processedMarkdown = processStoredImages(markdown)

    // Process regular images with dimension syntax: ![alt](image.jpg){width=600px}
    processedMarkdown = processedMarkdown.replace(
      /!\[(.*?)\]\(([^)]+?)\)\{([^}]*)\}/g,
      (match, altText, imageUrl, attributeString) => {
        // If this is a stored image, it was already processed above
        if (imageUrl.startsWith('stored:')) {
          return match
        }

        // Parse attributes and generate style
        const attributes = parseImageAttributes(attributeString)
        const style = generateImageStyle(attributes)
        const styleAttr = style ? ` style="${style}"` : ''

        // Add dimension attributes as data attributes for conversion back to markdown
        const widthAttr = attributes.width
          ? ` data-width="${attributes.width}"`
          : ''
        const heightAttr = attributes.height
          ? ` data-height="${attributes.height}"`
          : ''
        const maxWidthAttr = attributes['max-width']
          ? ` data-max-width="${attributes['max-width']}"`
          : ''

        return `<img src="${imageUrl}" alt="${altText}" class="markdown-image"${styleAttr}${widthAttr}${heightAttr}${maxWidthAttr} />`
      }
    )

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
 * Convert HTML list content to markdown with proper nesting
 * @param content - The inner HTML content of a ul/ol element
 * @param listType - Either 'ul' or 'ol'
 * @param indentLevel - Current nesting level (0-based)
 * @returns Markdown string for the list
 */
function convertListContent(
  content: string,
  listType: 'ul' | 'ol',
  indentLevel: number
): string {
  const indent = '  '.repeat(indentLevel) // 2 spaces per indent level
  let result = '\n'
  let listItemCounter = 1

  // Process list items
  const listItemRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi
  let match

  while ((match = listItemRegex.exec(content)) !== null) {
    const itemContent = match[1].trim()

    // Check for nested lists within this list item
    const nestedListRegex = /<(ul|ol)[^>]*>([\s\S]*?)<\/\1>/gi
    let processedContent = itemContent
    let nestedMatch

    // Process any nested lists
    while ((nestedMatch = nestedListRegex.exec(itemContent)) !== null) {
      const nestedListType = nestedMatch[1] as 'ul' | 'ol'
      const nestedContent = nestedMatch[2]
      const nestedMarkdown = convertListContent(
        nestedContent,
        nestedListType,
        indentLevel + 1
      )

      // Replace the nested list HTML with markdown
      processedContent = processedContent.replace(
        nestedMatch[0],
        nestedMarkdown
      )
    }

    // Clean up any remaining HTML tags in the item content
    processedContent = processedContent
      .replace(/<br\s*\/?>/gi, '\n' + indent + '  ') // Handle line breaks within list items
      .replace(/<[^>]+>/g, '') // Remove remaining HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()

    // Generate the appropriate list marker
    const marker = listType === 'ol' ? `${listItemCounter++}.` : '-'

    // Add the list item with proper indentation
    if (processedContent) {
      result += `${indent}${marker} ${processedContent}\n`
    }
  }

  return result
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

  // Remove resize handles and other UI elements before conversion
  const cleanedHtml = html
    .replace(/<[^>]*data-image-handle[^>]*>.*?<\/[^>]*>/gi, '') // Remove resize handles
    .replace(/<[^>]*data-image-handle[^>]*\/>/gi, '') // Remove self-closing resize handles

  return (
    cleanedHtml
      // Handle enhanced code blocks with filename support
      .replace(
        /<div class="enhanced-code-block">([\s\S]*?)<\/div>/gi,
        (match, content) => {
          // Extract filename from code header
          const filenameMatch = content.match(
            /<span class="code-filename">([^<]+)<\/span>/
          )
          const languageMatch = content.match(
            /<span class="code-language">([^<]+)<\/span>/
          )

          // Extract code content
          const codeMatch = content.match(
            /<pre[^>]*class="[^"]*code-content[^"]*"[^>]*><code>([\s\S]*?)<\/code><\/pre>/
          )

          if (codeMatch) {
            const code = codeMatch[1]
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&amp;/g, '&')
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'")

            if (filenameMatch) {
              // Try to extract language from filename extension
              const filename = filenameMatch[1]
              const extension = filename.split('.').pop()?.toLowerCase()
              const language = getLanguageFromExtension(extension || '')
              return `\n\`\`\`${language}:${filename}\n${code}\n\`\`\`\n\n`
            } else if (languageMatch) {
              const language = languageMatch[1].toLowerCase()
              return `\n\`\`\`${language}\n${code}\n\`\`\`\n\n`
            } else {
              return `\n\`\`\`\n${code}\n\`\`\`\n\n`
            }
          }
          return match
        }
      )
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

          // Extract dimension attributes
          const widthMatch = match.match(/data-width="([^"]*)"/)
          const heightMatch = match.match(/data-height="([^"]*)"/)
          const maxWidthMatch = match.match(/data-max-width="([^"]*)"/)

          let attributeString = ''
          const attributes = []

          if (widthMatch) attributes.push(`width=${widthMatch[1]}`)
          if (heightMatch) attributes.push(`height=${heightMatch[1]}`)
          if (maxWidthMatch) attributes.push(`max-width=${maxWidthMatch[1]}`)

          if (attributes.length > 0) {
            attributeString = `{${attributes.join(' ')}}`
          }

          return `![${alt}](stored:${storedId})${attributeString}`
        }
      )
      // Handle stored images with class attribute (backup approach)
      .replace(
        /<img[^>]*class="[^"]*stored-image[^"]*"[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi,
        (match, src, alt) => {
          console.log(
            `Found stored-image class: alt="${alt}", src="${src.substring(0, 50)}..."`
          )
          // Try to find by data URL in imageDataToIdMap first
          let storedId = imageDataToIdMap.get(src)
          if (!storedId) {
            // Fallback: search through all stored images
            storedId = findStoredImageByDataUrl(src) || undefined
          }

          // Extract dimension attributes
          const widthMatch = match.match(/data-width="([^"]*)"/)
          const heightMatch = match.match(/data-height="([^"]*)"/)
          const maxWidthMatch = match.match(/data-max-width="([^"]*)"/)

          let attributeString = ''
          const attributes = []

          if (widthMatch) attributes.push(`width=${widthMatch[1]}`)
          if (heightMatch) attributes.push(`height=${heightMatch[1]}`)
          if (maxWidthMatch) attributes.push(`max-width=${maxWidthMatch[1]}`)

          if (attributes.length > 0) {
            attributeString = `{${attributes.join(' ')}}`
          }

          if (storedId) {
            console.log(`Found stored ID: ${storedId}`)
            return `![${alt}](stored:${storedId})${attributeString}`
          }
          console.log(`No stored ID found for stored-image class`)
          return `![${alt}](${src})${attributeString}`
        }
      )
      // Handle any data URL images (try to match with stored images)
      .replace(
        /<img[^>]*src="(data:image\/[^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi,
        (match, src, alt) => {
          console.log(
            `Processing data URL image: alt="${alt}", src="${src.substring(0, 50)}..."`
          )
          // Try imageDataToIdMap first (from current session)
          let storedId = imageDataToIdMap.get(src)
          if (!storedId) {
            // Fallback: search through all stored images
            storedId = findStoredImageByDataUrl(src) || undefined
          }

          // Extract dimension attributes
          const widthMatch = match.match(/data-width="([^"]*)"/)
          const heightMatch = match.match(/data-height="([^"]*)"/)
          const maxWidthMatch = match.match(/data-max-width="([^"]*)"/)

          let attributeString = ''
          const attributes = []

          if (widthMatch) attributes.push(`width=${widthMatch[1]}`)
          if (heightMatch) attributes.push(`height=${heightMatch[1]}`)
          if (maxWidthMatch) attributes.push(`max-width=${maxWidthMatch[1]}`)

          if (attributes.length > 0) {
            attributeString = `{${attributes.join(' ')}}`
          }

          if (storedId) {
            console.log(`Found stored ID: ${storedId}`)
            return `![${alt}](stored:${storedId})${attributeString}`
          }
          // Regular data URL image (not stored)
          console.log(`No stored ID found, keeping data URL`)
          return `![${alt}](${src})${attributeString}`
        }
      )
      // Handle any remaining regular images (including markdown-image class)
      .replace(
        /<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi,
        (match, src, alt) => {
          // Extract dimension attributes
          const widthMatch = match.match(/data-width="([^"]*)"/)
          const heightMatch = match.match(/data-height="([^"]*)"/)
          const maxWidthMatch = match.match(/data-max-width="([^"]*)"/)

          let attributeString = ''
          const attributes = []

          if (widthMatch) attributes.push(`width=${widthMatch[1]}`)
          if (heightMatch) attributes.push(`height=${heightMatch[1]}`)
          if (maxWidthMatch) attributes.push(`max-width=${maxWidthMatch[1]}`)

          if (attributes.length > 0) {
            attributeString = `{${attributes.join(' ')}}`
          }

          return `![${alt}](${src})${attributeString}`
        }
      )
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
      // Handle lists with proper nesting and indentation
      .replace(
        /<(ul|ol)[^>]*>([\s\S]*?)<\/\1>/gi,
        (match, listType, content) => {
          return convertListContent(content, listType, 0)
        }
      )
      .replace(/<[^>]+>/g, '') // Remove any remaining HTML tags
      .replace(/\n{3,}/g, '\n\n') // Clean up excessive newlines
      .trim()
  )
}
