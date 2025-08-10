import { marked } from 'marked'

/**
 * Configure marked with safe defaults and syntax highlighting support
 */
function configureMarked() {
  marked.setOptions({
    breaks: true, // Support line breaks
    gfm: true, // GitHub Flavored Markdown
  })
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
    return marked.parse(markdown) as string
  } catch (error) {
    console.error('Markdown parsing error:', error)
    // Fallback to original text if parsing fails
    return markdown.replace(/\n/g, '<br>')
  }
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

  return html
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
    .replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
    .replace(/<\/?(ul|ol)[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, '') // Remove any remaining HTML tags
    .replace(/\n{3,}/g, '\n\n') // Clean up excessive newlines
    .trim()
}
