import { describe, it, expect } from 'vitest'
import { convertMarkdownToHtml, convertHtmlToMarkdown } from './markdown'

describe('Markdown to HTML Conversion', () => {
  it('converts headers correctly', () => {
    expect(convertMarkdownToHtml('# Header 1')).toContain('<h1>Header 1</h1>')
    expect(convertMarkdownToHtml('## Header 2')).toContain('<h2>Header 2</h2>')
    expect(convertMarkdownToHtml('### Header 3')).toContain('<h3>Header 3</h3>')
  })

  it('converts bold text', () => {
    const result = convertMarkdownToHtml('**bold text**')
    expect(result).toContain('<strong>bold text</strong>')
  })

  it('converts italic text', () => {
    const result = convertMarkdownToHtml('*italic text*')
    expect(result).toContain('<em>italic text</em>')
  })

  it('converts code blocks', () => {
    const result = convertMarkdownToHtml('`inline code`')
    expect(result).toContain('<code>inline code</code>')
  })

  it('converts links', () => {
    const result = convertMarkdownToHtml('[link text](http://example.com)')
    expect(result).toContain('<a href="http://example.com">link text</a>')
  })

  it('converts unordered lists', () => {
    const markdown = '- item 1\n- item 2'
    const result = convertMarkdownToHtml(markdown)
    expect(result).toContain('<ul>')
    expect(result).toContain('<li>item 1</li>')
    expect(result).toContain('<li>item 2</li>')
  })

  it('converts ordered lists', () => {
    const markdown = '1. first\n2. second'
    const result = convertMarkdownToHtml(markdown)
    expect(result).toContain('<ol>')
    expect(result).toContain('<li>first</li>')
  })

  it('handles empty input', () => {
    expect(convertMarkdownToHtml('')).toBe('')
    expect(convertMarkdownToHtml('   ')).toBe('')
  })

  it('handles line breaks', () => {
    const result = convertMarkdownToHtml('line 1\nline 2')
    expect(result).toContain('line 1')
    expect(result).toContain('line 2')
  })

  it('handles complex markdown', () => {
    const markdown = `# Title
    
**Bold** and *italic* text

- List item 1
- List item 2

[A link](http://example.com)`

    const result = convertMarkdownToHtml(markdown)
    expect(result).toContain('<h1>Title</h1>')
    expect(result).toContain('<strong>Bold</strong>')
    expect(result).toContain('<em>italic</em>')
    expect(result).toContain('<li>List item 1</li>')
    expect(result).toContain('<a href="http://example.com">A link</a>')
  })
})

describe('HTML to Markdown Conversion', () => {
  it('converts headers', () => {
    expect(convertHtmlToMarkdown('<h1>Header 1</h1>')).toContain('# Header 1')
    expect(convertHtmlToMarkdown('<h2>Header 2</h2>')).toContain('## Header 2')
  })

  it('converts bold and italic', () => {
    expect(convertHtmlToMarkdown('<strong>bold</strong>')).toContain('**bold**')
    expect(convertHtmlToMarkdown('<em>italic</em>')).toContain('*italic*')
  })

  it('converts links', () => {
    const html = '<a href="http://example.com">link</a>'
    expect(convertHtmlToMarkdown(html)).toContain('[link](http://example.com)')
  })

  it('converts inline code', () => {
    expect(convertHtmlToMarkdown('<code>code</code>')).toContain('`code`')
  })

  it('handles empty input', () => {
    expect(convertHtmlToMarkdown('')).toBe('')
    expect(convertHtmlToMarkdown('   ')).toBe('')
  })

  it('removes unknown HTML tags', () => {
    const html = '<div><span>text</span></div>'
    const result = convertHtmlToMarkdown(html)
    expect(result).toBe('text')
  })
})
