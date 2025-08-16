import { describe, it, expect } from 'vitest'
import { convertMarkdownToHtml, convertHtmlToMarkdown } from './markdown'

describe('Image Dimension Support', () => {
  it('should render regular images with dimensions', () => {
    const markdown =
      '![Test Image](https://example.com/image.jpg){width=600px height=400px}'
    const html = convertMarkdownToHtml(markdown)

    expect(html).toContain('markdown-image')
    expect(html).toContain(
      'style="width: 600px; height: 400px; max-width: 100%"'
    )
    expect(html).toContain('data-width="600px"')
    expect(html).toContain('data-height="400px"')
    expect(html).toContain('src="https://example.com/image.jpg"')
    expect(html).toContain('alt="Test Image"')
  })

  it('should render stored images with dimensions', () => {
    const markdown = '![Test Image](stored:test-image-123){width=500px}'
    const html = convertMarkdownToHtml(markdown)

    // Since stored image doesn't exist, it should return the not-found version
    expect(html).toContain('image-not-found:test-image-123')
  })

  it('should handle images with only width', () => {
    const markdown = '![Test](https://example.com/test.jpg){width=300px}'
    const html = convertMarkdownToHtml(markdown)

    expect(html).toContain(
      'style="width: 300px; max-width: 100%; height: auto"'
    )
    expect(html).toContain('data-width="300px"')
    expect(html).not.toContain('data-height')
  })

  it('should handle images with only height', () => {
    const markdown = '![Test](https://example.com/test.jpg){height=200px}'
    const html = convertMarkdownToHtml(markdown)

    expect(html).toContain('style="height: 200px"')
    expect(html).toContain('data-height="200px"')
    expect(html).not.toContain('data-width')
  })

  it('should handle images with max-width', () => {
    const markdown = '![Test](https://example.com/test.jpg){max-width=800px}'
    const html = convertMarkdownToHtml(markdown)

    expect(html).toContain('style="max-width: 800px"')
    expect(html).toContain('data-max-width="800px"')
  })

  it('should handle percentage dimensions', () => {
    const markdown =
      '![Test](https://example.com/test.jpg){width=50% height=30%}'
    const html = convertMarkdownToHtml(markdown)

    expect(html).toContain('style="width: 50%; height: 30%"')
    expect(html).toContain('data-width="50%"')
    expect(html).toContain('data-height="30%"')
  })

  it('should handle dimensions without units (defaults to px)', () => {
    const markdown =
      '![Test](https://example.com/test.jpg){width=400 height=300}'
    const html = convertMarkdownToHtml(markdown)

    expect(html).toContain('width: 400px')
    expect(html).toContain('height: 300px')
    expect(html).toContain('data-width="400"')
    expect(html).toContain('data-height="300"')
  })

  it('should preserve dimensions in HTML to Markdown conversion', () => {
    const originalMarkdown =
      '![Test Image](https://example.com/image.jpg){width=600px height=400px}'
    const html = convertMarkdownToHtml(originalMarkdown)
    const convertedMarkdown = convertHtmlToMarkdown(html)

    expect(convertedMarkdown).toContain(
      '![Test Image](https://example.com/image.jpg){width=600px height=400px}'
    )
  })

  it('should handle images without dimensions', () => {
    const markdown = '![Regular Image](https://example.com/image.jpg)'
    const html = convertMarkdownToHtml(markdown)

    expect(html).toContain('markdown-image')
    expect(html).toContain('src="https://example.com/image.jpg"')
    expect(html).toContain('alt="Regular Image"')
    expect(html).not.toContain('style=')
    expect(html).not.toContain('data-width')
    expect(html).not.toContain('data-height')
  })

  it('should handle complex attribute combinations', () => {
    const markdown =
      '![Complex](https://example.com/test.jpg){width=600px max-width=100% height=auto}'
    const html = convertMarkdownToHtml(markdown)

    expect(html).toContain('data-width="600px"')
    expect(html).toContain('data-max-width="100%"')
    expect(html).toContain('data-height="auto"')
    expect(html).toContain('width: 600px')
    expect(html).toContain('height: auto')
    expect(html).toContain('max-width: 100%')
  })

  it('should handle em and rem units', () => {
    const markdown =
      '![Test](https://example.com/test.jpg){width=20em height=15rem}'
    const html = convertMarkdownToHtml(markdown)

    expect(html).toContain('width: 20em')
    expect(html).toContain('height: 15rem')
    expect(html).toContain('data-width="20em"')
    expect(html).toContain('data-height="15rem"')
  })
})
