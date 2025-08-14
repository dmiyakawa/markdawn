/**
 * Advanced export functionality for markdown documents
 * Handles HTML, PDF, and styled exports
 */

import { convertMarkdownToHtml } from './markdown'
import { getStoredImages, type StoredImage } from './imageOperations'
import type { Document } from '../types/document'

export interface ExportOptions {
  title?: string
  author?: string
  includeStyles?: boolean
  includeTOC?: boolean
  theme?: 'default' | 'github' | 'academic' | 'minimal'
  fontSize?: 'small' | 'medium' | 'large'
  embedImages?: boolean
  addTimestamp?: boolean
}

/**
 * Generate a complete HTML document with styling
 */
export function exportAsHTML(
  content: string,
  options: ExportOptions = {}
): void {
  const {
    title = 'Markdown Document',
    author,
    includeStyles = true,
    includeTOC = false,
    theme = 'default',
    fontSize = 'medium',
    embedImages = true,
    addTimestamp = true,
  } = options

  // Convert markdown to HTML
  let htmlContent = convertMarkdownToHtml(content)

  // Process embedded images if needed
  if (embedImages) {
    htmlContent = embedStoredImages(htmlContent)
  }

  // Generate table of contents if requested
  let tocHTML = ''
  if (includeTOC) {
    tocHTML = generateTableOfContents(content)
  }

  // Generate the complete HTML document
  const fullHTML = generateHTMLDocument({
    title,
    author,
    content: htmlContent,
    toc: tocHTML,
    includeStyles,
    theme,
    fontSize,
    addTimestamp,
  })

  // Create and download the file
  const filename = `${sanitizeFilename(title)}-${getTimestamp()}.html`
  downloadFile(fullHTML, filename, 'text/html')
}

/**
 * Export as styled PDF (using browser's print functionality)
 */
export async function exportAsPDF(
  content: string,
  options: ExportOptions = {}
): Promise<void> {
  // First create an HTML version optimized for PDF
  const pdfOptions: ExportOptions = {
    ...options,
    theme: 'academic', // Better for PDF
    includeStyles: true,
    embedImages: true,
    includeTOC: true,
  }

  // Generate HTML content
  const htmlContent = convertMarkdownToHtml(content)
  const processedContent = embedStoredImages(htmlContent)
  const tocHTML = generateTableOfContents(content)

  // Create a temporary window/document for PDF generation
  const pdfHTML = generateHTMLDocument({
    title: options.title || 'Markdown Document',
    author: options.author,
    content: processedContent,
    toc: tocHTML,
    includeStyles: true,
    theme: 'academic',
    fontSize: options.fontSize || 'medium',
    addTimestamp: options.addTimestamp !== false,
    forPDF: true,
  })

  // Open in new window and trigger print
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(pdfHTML)
    printWindow.document.close()

    // Wait for content to load, then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print()
        // Note: We don't auto-close the window as user might want to adjust print settings
      }, 500)
    }
  } else {
    // Fallback: download HTML file with print instructions
    const filename = `${sanitizeFilename(options.title || 'document')}-for-pdf-${getTimestamp()}.html`
    downloadFile(pdfHTML, filename, 'text/html')
    alert(
      "PDF export opened in new window. If blocked, an HTML file was downloaded. Open it and use your browser's print function to save as PDF."
    )
  }
}

/**
 * Generate table of contents from markdown content
 */
function generateTableOfContents(content: string): string {
  const headings = extractHeadings(content)
  if (headings.length === 0) return ''

  let tocHTML =
    '<div class="table-of-contents">\n<h2>Table of Contents</h2>\n<ul>\n'

  headings.forEach((heading) => {
    const indent = '  '.repeat(heading.level - 1)
    const anchorId = generateAnchorId(heading.title)
    tocHTML += `${indent}<li><a href="#${anchorId}">${escapeHtml(heading.title)}</a></li>\n`
  })

  tocHTML += '</ul>\n</div>\n\n'
  return tocHTML
}

/**
 * Extract headings from markdown content
 */
function extractHeadings(
  content: string
): Array<{ level: number; title: string; line: number }> {
  const headings: Array<{ level: number; title: string; line: number }> = []
  const lines = content.split('\n')

  lines.forEach((line, index) => {
    const match = line.match(/^(#{1,6})\s+(.+)$/)
    if (match) {
      headings.push({
        level: match[1].length,
        title: match[2].trim(),
        line: index + 1,
      })
    }
  })

  return headings
}

/**
 * Generate anchor ID from heading text
 */
function generateAnchorId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Embed stored images as base64 data URLs
 */
function embedStoredImages(htmlContent: string): string {
  const storedImages = getStoredImages()

  return htmlContent.replace(/src="stored:([^"]+)"/g, (match, imageId) => {
    const image = storedImages.find((img) => img.id === imageId)
    if (image) {
      return `src="${image.data}"`
    }
    return match
  })
}

/**
 * Generate complete HTML document
 */
function generateHTMLDocument(params: {
  title: string
  author?: string
  content: string
  toc: string
  includeStyles: boolean
  theme: string
  fontSize: string
  addTimestamp: boolean
  forPDF?: boolean
}): string {
  const {
    title,
    author,
    content,
    toc,
    includeStyles,
    theme,
    fontSize,
    addTimestamp,
    forPDF,
  } = params

  // Add IDs to headings for TOC navigation
  const contentWithIds = addHeadingIds(content)

  const timestamp = addTimestamp ? new Date().toLocaleString() : null
  const styles = includeStyles ? getThemeStyles(theme, fontSize, forPDF) : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="generator" content="Markdown Editor - Claude Code">
  ${author ? `<meta name="author" content="${escapeHtml(author)}">` : ''}
  <title>${escapeHtml(title)}</title>
  ${styles}
</head>
<body>
  <div class="document-container">
    <header class="document-header">
      <h1 class="document-title">${escapeHtml(title)}</h1>
      ${author ? `<p class="document-author">by ${escapeHtml(author)}</p>` : ''}
      ${timestamp ? `<p class="document-timestamp">Generated on ${timestamp}</p>` : ''}
    </header>
    
    ${toc}
    
    <main class="document-content">
      ${contentWithIds}
    </main>
    
    <footer class="document-footer">
      <p>Generated with <a href="https://claude.ai/code" target="_blank">Claude Code Markdown Editor</a></p>
    </footer>
  </div>
</body>
</html>`
}

/**
 * Add IDs to headings for TOC navigation
 */
function addHeadingIds(html: string): string {
  return html.replace(
    /<h([1-6])([^>]*)>(.*?)<\/h[1-6]>/g,
    (match, level, attrs, content) => {
      const textContent = content.replace(/<[^>]*>/g, '').trim()
      const id = generateAnchorId(textContent)

      // Check if ID already exists in attributes
      if (attrs.includes('id=')) {
        return match
      }

      return `<h${level}${attrs} id="${id}">${content}</h${level}>`
    }
  )
}

/**
 * Get theme-specific CSS styles
 */
function getThemeStyles(
  theme: string,
  fontSize: string,
  forPDF = false
): string {
  const fontSizes = {
    small: '14px',
    medium: '16px',
    large: '18px',
  }

  const baseFontSize = fontSizes[fontSize as keyof typeof fontSizes] || '16px'

  // Base styles for all themes
  const baseStyles = `
  <style>
    * {
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      font-size: ${baseFontSize};
      line-height: 1.6;
      margin: 0;
      padding: 0;
      ${forPDF ? 'background: white;' : ''}
    }
    
    .document-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem;
      ${forPDF ? '' : 'background: white; box-shadow: 0 0 20px rgba(0,0,0,0.1);'}
    }
    
    .document-header {
      text-align: center;
      margin-bottom: 3rem;
      padding-bottom: 2rem;
      border-bottom: 2px solid #e0e0e0;
    }
    
    .document-title {
      font-size: 2.5em;
      font-weight: 300;
      margin: 0 0 0.5rem 0;
      color: #333;
    }
    
    .document-author {
      font-size: 1.2em;
      color: #666;
      margin: 0.5rem 0;
      font-style: italic;
    }
    
    .document-timestamp {
      font-size: 0.9em;
      color: #888;
      margin: 0.5rem 0;
    }
    
    .table-of-contents {
      background: #f8f9fa;
      border-left: 4px solid #007acc;
      padding: 1.5rem;
      margin: 2rem 0;
      border-radius: 4px;
    }
    
    .table-of-contents h2 {
      margin-top: 0;
      color: #333;
      font-size: 1.3em;
    }
    
    .table-of-contents ul {
      list-style: none;
      padding-left: 0;
    }
    
    .table-of-contents li {
      margin: 0.3rem 0;
      padding-left: 1rem;
    }
    
    .table-of-contents a {
      color: #007acc;
      text-decoration: none;
      border-bottom: 1px dotted #007acc;
    }
    
    .table-of-contents a:hover {
      border-bottom: 1px solid #007acc;
    }
    
    .document-content {
      margin: 2rem 0;
    }
    
    .document-footer {
      text-align: center;
      padding-top: 2rem;
      margin-top: 3rem;
      border-top: 1px solid #e0e0e0;
      color: #666;
      font-size: 0.9em;
    }
    
    /* Enhanced content styles */
    h1, h2, h3, h4, h5, h6 {
      font-weight: 600;
      margin: 1.5em 0 1em 0;
      color: #333;
    }
    
    h1 { font-size: 2.2em; border-bottom: 3px solid #007acc; padding-bottom: 0.5rem; }
    h2 { font-size: 1.8em; border-bottom: 2px solid #e0e0e0; padding-bottom: 0.3rem; }
    h3 { font-size: 1.5em; }
    h4 { font-size: 1.3em; }
    h5 { font-size: 1.1em; }
    h6 { font-size: 1em; color: #666; }
    
    p {
      margin: 1em 0;
      text-align: justify;
    }
    
    blockquote {
      border-left: 4px solid #007acc;
      background: #f8f9fa;
      margin: 1.5em 0;
      padding: 1em 1.5em;
      font-style: italic;
    }
    
    code {
      background: #f1f1f1;
      padding: 0.2em 0.4em;
      border-radius: 3px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 0.9em;
    }
    
    pre {
      background: #f8f8f8;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      padding: 1rem;
      overflow-x: auto;
      margin: 1.5em 0;
    }
    
    pre code {
      background: none;
      padding: 0;
    }
    
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1.5em 0;
    }
    
    th, td {
      border: 1px solid #e0e0e0;
      padding: 0.8em 1em;
      text-align: left;
    }
    
    th {
      background: #f8f9fa;
      font-weight: 600;
    }
    
    img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 1.5em auto;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    ul, ol {
      margin: 1em 0;
      padding-left: 2em;
    }
    
    li {
      margin: 0.5em 0;
    }
    
    ${
      forPDF
        ? `
    /* PDF-specific styles */
    @media print {
      .document-container {
        max-width: none;
        margin: 0;
        padding: 1rem;
        box-shadow: none;
      }
      
      .document-header {
        page-break-after: avoid;
      }
      
      h1, h2, h3, h4, h5, h6 {
        page-break-after: avoid;
      }
      
      blockquote, pre, table {
        page-break-inside: avoid;
      }
      
      img {
        page-break-inside: avoid;
      }
    }
    `
        : ''
    }
  </style>`

  // Theme-specific overrides
  const themeStyles = getThemeSpecificStyles(theme)

  return baseStyles + themeStyles
}

/**
 * Get theme-specific style overrides
 */
function getThemeSpecificStyles(theme: string): string {
  switch (theme) {
    case 'github':
      return `
      <style>
        .document-container {
          background: white;
          border: 1px solid #e1e4e8;
          border-radius: 6px;
        }
        
        h1, h2 { 
          border-bottom-color: #e1e4e8; 
        }
        
        blockquote {
          border-left-color: #dfe2e5;
          background: #f6f8fa;
          color: #586069;
        }
        
        code {
          background: rgba(27,31,35,0.05);
          border-radius: 3px;
        }
        
        pre {
          background: #f6f8fa;
          border: 1px solid #e1e4e8;
        }
        
        .table-of-contents {
          background: #f6f8fa;
          border-left-color: #0366d6;
        }
      </style>`

    case 'academic':
      return `
      <style>
        body {
          font-family: 'Times New Roman', 'Georgia', serif;
        }
        
        .document-title {
          font-weight: bold;
          font-size: 2.2em;
        }
        
        h1, h2, h3, h4, h5, h6 {
          font-family: 'Times New Roman', 'Georgia', serif;
          font-weight: bold;
        }
        
        p {
          text-align: justify;
          text-indent: 1.5em;
        }
        
        .document-header p {
          text-indent: 0;
        }
        
        blockquote {
          font-style: italic;
          border-left-color: #8B4513;
          background: #FDF5E6;
        }
        
        .table-of-contents {
          background: #F5F5DC;
          border-left-color: #8B4513;
        }
      </style>`

    case 'minimal':
      return `
      <style>
        .document-container {
          font-family: 'Helvetica Neue', 'Arial', sans-serif;
          max-width: 700px;
        }
        
        .document-header {
          border-bottom: 1px solid #ccc;
        }
        
        .document-title {
          font-weight: 200;
          font-size: 2.5em;
        }
        
        h1, h2, h3, h4, h5, h6 {
          font-weight: 300;
          color: #222;
        }
        
        h1 { border-bottom: none; }
        h2 { border-bottom: 1px solid #eee; }
        
        blockquote {
          border-left: 2px solid #ccc;
          background: none;
          font-style: normal;
          color: #666;
        }
        
        .table-of-contents {
          background: #fafafa;
          border-left-color: #666;
          border-radius: 0;
        }
      </style>`

    default:
      return ''
  }
}

/**
 * Utility functions
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9]/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
}

function getTimestamp(): string {
  return new Date().toISOString().slice(0, 16).replace(/:/g, '-')
}

function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

function downloadFile(
  content: string,
  filename: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  link.style.display = 'none'

  document.body.appendChild(link)
  link.click()

  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Export multiple documents as a styled HTML collection
 */
export async function exportDocumentsAsHTML(
  documents: Document[],
  options: ExportOptions = {}
): Promise<void> {
  const {
    title = 'Document Collection',
    author,
    theme = 'default',
    fontSize = 'medium',
    embedImages = true,
    addTimestamp = true,
  } = options

  // Generate HTML for each document
  const documentHTMLs = documents.map((doc) => {
    const htmlContent = convertMarkdownToHtml(doc.content)
    const processedContent = embedImages
      ? embedStoredImages(htmlContent)
      : htmlContent
    const contentWithIds = addHeadingIds(processedContent)

    return `
    <section class="document-section" id="doc-${doc.id}">
      <header class="document-section-header">
        <h1 class="document-section-title">${escapeHtml(doc.title)}</h1>
        <p class="document-section-meta">
          Last modified: ${new Date(doc.lastModified).toLocaleString()}
          ${doc.isUnsaved ? ' (Unsaved changes)' : ''}
        </p>
      </header>
      <div class="document-section-content">
        ${contentWithIds}
      </div>
    </section>`
  })

  // Generate table of contents for all documents
  const tocHTML = `
  <div class="collection-toc">
    <h2>Documents</h2>
    <ul>
      ${documents
        .map(
          (doc) =>
            `<li><a href="#doc-${doc.id}">${escapeHtml(doc.title)}</a></li>`
        )
        .join('')}
    </ul>
  </div>`

  // Create complete HTML document
  const fullHTML = generateHTMLDocument({
    title,
    author,
    content: documentHTMLs.join('\n\n'),
    toc: tocHTML,
    includeStyles: true,
    theme,
    fontSize,
    addTimestamp,
  })

  // Add collection-specific styles
  const collectionStyles = `
  <style>
    .collection-toc {
      background: #f0f8ff;
      border: 2px solid #007acc;
      border-radius: 8px;
      padding: 1.5rem;
      margin: 2rem 0;
    }
    
    .document-section {
      margin: 3rem 0;
      padding: 2rem 0;
      border-bottom: 2px solid #e0e0e0;
    }
    
    .document-section:last-child {
      border-bottom: none;
    }
    
    .document-section-header {
      margin-bottom: 2rem;
    }
    
    .document-section-title {
      color: #007acc;
      border-bottom: 3px solid #007acc;
      padding-bottom: 0.5rem;
    }
    
    .document-section-meta {
      color: #666;
      font-style: italic;
      margin: 0.5rem 0;
    }
  </style>`

  const finalHTML = fullHTML.replace('</head>', collectionStyles + '</head>')

  const filename = `${sanitizeFilename(title)}-collection-${getTimestamp()}.html`
  downloadFile(finalHTML, filename, 'text/html')
}
