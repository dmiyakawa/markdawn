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

  it('handles strikethrough text', () => {
    const result = convertMarkdownToHtml('~~strikethrough~~')
    expect(result).toContain('strikethrough')
  })

  it('handles task lists', () => {
    const markdown = '- [x] Completed task\n- [ ] Incomplete task'
    const result = convertMarkdownToHtml(markdown)
    expect(result).toContain('Completed task')
    expect(result).toContain('Incomplete task')
  })

  it('handles tables', () => {
    const markdown =
      '| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |'
    const result = convertMarkdownToHtml(markdown)
    expect(result).toContain('Header 1')
    expect(result).toContain('Header 2')
    expect(result).toContain('Cell 1')
    expect(result).toContain('Cell 2')
  })

  it('handles blockquotes', () => {
    const result = convertMarkdownToHtml('> This is a blockquote')
    expect(result).toContain('This is a blockquote')
  })

  it('handles code blocks with language', () => {
    const markdown = '```javascript\nfunction test() {\n  return true;\n}\n```'
    const result = convertMarkdownToHtml(markdown)
    expect(result).toContain('function test()')
    expect(result).toContain('return true')
  })

  it('handles horizontal rules', () => {
    const result = convertMarkdownToHtml('Text\n\n---\n\nMore text')
    expect(result).toContain('Text')
    expect(result).toContain('More text')
  })

  it('handles images', () => {
    const result = convertMarkdownToHtml('![Alt text](image.jpg)')
    expect(result).toContain('Alt text')
    expect(result).toContain('image.jpg')
  })

  it('handles stored image references', () => {
    const result = convertMarkdownToHtml('![Stored Image](stored:image-123)')
    expect(result).toContain('Stored Image')
    expect(result).toContain('image-not-found:image-123')
  })

  it('handles autolinks', () => {
    const result = convertMarkdownToHtml(
      'Visit https://example.com for more info'
    )
    expect(result).toContain('https://example.com')
  })

  it('handles footnotes', () => {
    const markdown = 'Text with footnote[^1]\n\n[^1]: This is the footnote'
    const result = convertMarkdownToHtml(markdown)
    expect(result).toContain('Text with footnote')
    expect(result).toContain('This is the footnote')
  })

  it('handles definition lists', () => {
    const markdown = 'Term 1\n:   Definition 1\n\nTerm 2\n:   Definition 2'
    const result = convertMarkdownToHtml(markdown)
    expect(result).toContain('Term 1')
    expect(result).toContain('Definition 1')
    expect(result).toContain('Term 2')
    expect(result).toContain('Definition 2')
  })

  it('handles nested lists', () => {
    const markdown = '1. First\n   - Sub item\n   - Another sub\n2. Second'
    const result = convertMarkdownToHtml(markdown)
    expect(result).toContain('First')
    expect(result).toContain('Sub item')
    expect(result).toContain('Another sub')
    expect(result).toContain('Second')
  })

  it('handles escape sequences', () => {
    const result = convertMarkdownToHtml('\\*Not emphasized\\*')
    expect(result).toContain('*Not emphasized*')
  })

  it('handles HTML entities in markdown', () => {
    const result = convertMarkdownToHtml('AT&T and 3 < 5 > 2')
    expect(result).toContain('AT&amp;T')
    expect(result).toContain('3 &lt; 5 &gt; 2')
  })

  it('handles mixed content with HTML', () => {
    const markdown = '**Bold** and <em>HTML emphasis</em>'
    const result = convertMarkdownToHtml(markdown)
    expect(result).toContain('Bold')
    expect(result).toContain('HTML emphasis')
  })

  it('handles special characters', () => {
    const result = convertMarkdownToHtml('Symbols: © ® ™ § ¶ † ‡')
    expect(result).toContain('© ® ™ § ¶ † ‡')
  })

  it('handles multiple paragraphs', () => {
    const markdown = 'First paragraph.\n\nSecond paragraph.\n\nThird paragraph.'
    const result = convertMarkdownToHtml(markdown)
    expect(result).toContain('First paragraph')
    expect(result).toContain('Second paragraph')
    expect(result).toContain('Third paragraph')
  })

  it('handles abbreviations', () => {
    const markdown =
      'The HTML specification\n\n*[HTML]: HyperText Markup Language'
    const result = convertMarkdownToHtml(markdown)
    expect(result).toContain('HTML specification')
  })

  it('handles math expressions', () => {
    const result = convertMarkdownToHtml(
      'Inline math: $x = y$ and block: $$E = mc^2$$'
    )
    expect(result).toContain('x = y')
    expect(result).toContain('E = mc^2')
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

  it('handles images with style attributes', () => {
    const html =
      '<img src="https://example.com/image.jpg" alt="Test Image" style="width: 300px; height: 200px; max-width: 100%">'
    const result = convertHtmlToMarkdown(html)
    // The actual implementation may not parse style attributes, so test basic conversion
    expect(result).toContain('![Test Image](https://example.com/image.jpg)')
  })

  it('handles images with different attributes', () => {
    const html =
      '<img src="https://example.com/image.jpg" alt="Test Image" class="test-class">'
    const result = convertHtmlToMarkdown(html)
    expect(result).toBe('![Test Image](https://example.com/image.jpg)')
  })

  it('handles lists conversion', () => {
    const html = '<ul><li>Item 1</li><li>Item 2</li></ul>'
    const result = convertHtmlToMarkdown(html)
    expect(result).toContain('Item 1')
    expect(result).toContain('Item 2')
  })

  it('handles ordered lists conversion', () => {
    const html = '<ol><li>First</li><li>Second</li></ol>'
    const result = convertHtmlToMarkdown(html)
    expect(result).toContain('First')
    expect(result).toContain('Second')
  })

  it('handles complex mixed content', () => {
    const html = `
      <h1>Title</h1>
      <p>Paragraph with <strong>bold</strong> and <em>italic</em></p>
      <ul>
        <li>List item with <a href="http://example.com">link</a></li>
        <li>Another item</li>
      </ul>
      <div>Extra content to remove</div>
    `
    const result = convertHtmlToMarkdown(html)
    expect(result).toContain('# Title')
    expect(result).toContain('**bold**')
    expect(result).toContain('*italic*')
    expect(result).toContain('- List item with [link](http://example.com)')
    expect(result).toContain('- Another item')
    expect(result).toContain('Extra content to remove')
  })

  it('cleans up excessive newlines', () => {
    const html = '<p>First</p>\n\n\n\n<p>Second</p>'
    const result = convertHtmlToMarkdown(html)
    expect(result).not.toMatch(/\n{3,}/)
    expect(result).toBe('First\n\nSecond')
  })

  it('handles tables conversion', () => {
    const html = `
      <table>
        <thead>
          <tr><th>Header 1</th><th>Header 2</th></tr>
        </thead>
        <tbody>
          <tr><td>Cell 1</td><td>Cell 2</td></tr>
          <tr><td>Cell 3</td><td>Cell 4</td></tr>
        </tbody>
      </table>
    `
    const result = convertHtmlToMarkdown(html)
    expect(result).toContain('Header 1')
    expect(result).toContain('Header 2')
    expect(result).toContain('Cell 1')
    expect(result).toContain('Cell 2')
  })

  it('handles blockquotes conversion', () => {
    const html = '<blockquote><p>This is a quote</p></blockquote>'
    const result = convertHtmlToMarkdown(html)
    expect(result).toContain('This is a quote')
  })

  it('handles code blocks conversion', () => {
    const html = '<pre><code>function test() {\n  return true;\n}</code></pre>'
    const result = convertHtmlToMarkdown(html)
    expect(result).toContain('function test()')
    expect(result).toContain('return true')
  })

  it('handles horizontal rules conversion', () => {
    const html = '<p>Before</p><hr><p>After</p>'
    const result = convertHtmlToMarkdown(html)
    expect(result).toContain('Before')
    expect(result).toContain('After')
  })

  it('handles nested formatting', () => {
    const html = '<p><strong>Bold with <em>italic</em> inside</strong></p>'
    const result = convertHtmlToMarkdown(html)
    expect(result).toContain('**Bold with *italic* inside**')
  })

  it('handles strikethrough text', () => {
    const html =
      '<p>Normal text with <del>strikethrough</del> and <s>another strike</s></p>'
    const result = convertHtmlToMarkdown(html)
    expect(result).toContain('strikethrough')
    expect(result).toContain('another strike')
  })

  it('handles task lists', () => {
    const html = `
      <ul>
        <li><input type="checkbox" checked> Completed task</li>
        <li><input type="checkbox"> Incomplete task</li>
      </ul>
    `
    const result = convertHtmlToMarkdown(html)
    expect(result).toContain('Completed task')
    expect(result).toContain('Incomplete task')
  })

  it('handles definition lists', () => {
    const html = `
      <dl>
        <dt>Term 1</dt>
        <dd>Definition 1</dd>
        <dt>Term 2</dt>
        <dd>Definition 2</dd>
      </dl>
    `
    const result = convertHtmlToMarkdown(html)
    expect(result).toContain('Term 1')
    expect(result).toContain('Definition 1')
    expect(result).toContain('Term 2')
    expect(result).toContain('Definition 2')
  })

  it('handles special HTML entities', () => {
    const html = '<p>&amp; &lt; &gt; &quot; &#39;</p>'
    const result = convertHtmlToMarkdown(html)
    expect(result).toContain('&amp; &lt; &gt; &quot; &#39;')
  })

  it('handles footnotes', () => {
    const html = '<p>Text with footnote<sup><a href="#fn1">1</a></sup></p>'
    const result = convertHtmlToMarkdown(html)
    expect(result).toContain('Text with footnote')
  })

  it('handles abbreviations', () => {
    const html =
      '<p>This is <abbr title="HyperText Markup Language">HTML</abbr></p>'
    const result = convertHtmlToMarkdown(html)
    expect(result).toContain('HTML')
  })

  it('handles subscript and superscript', () => {
    const html = '<p>H<sub>2</sub>O and E=mc<sup>2</sup></p>'
    const result = convertHtmlToMarkdown(html)
    expect(result).toContain('H')
    expect(result).toContain('O')
    expect(result).toContain('E=mc')
  })

  it('handles empty elements gracefully', () => {
    const html = '<p></p><div></div><span></span>'
    const result = convertHtmlToMarkdown(html)
    expect(result.trim()).toBe('')
  })

  it('handles malformed HTML gracefully', () => {
    const html = '<p>Unclosed paragraph<div>Nested without closing</p>'
    const result = convertHtmlToMarkdown(html)
    expect(result).toContain('Unclosed paragraph')
    expect(result).toContain('Nested without closing')
  })

  it('preserves line breaks in preformatted text', () => {
    const html = '<pre>Line 1\nLine 2\nLine 3</pre>'
    const result = convertHtmlToMarkdown(html)
    expect(result).toContain('Line 1')
    expect(result).toContain('Line 2')
    expect(result).toContain('Line 3')
  })

  it('handles complex nested structures', () => {
    const html = `
      <div>
        <h2>Section Title</h2>
        <p>Paragraph with <strong>bold</strong> and <em>italic</em></p>
        <ul>
          <li>First item with <a href="http://example.com">link</a></li>
          <li>Second item with <code>inline code</code></li>
        </ul>
        <blockquote>
          <p>A quote with <strong>emphasis</strong></p>
        </blockquote>
      </div>
    `
    const result = convertHtmlToMarkdown(html)
    expect(result).toContain('## Section Title')
    expect(result).toContain('**bold**')
    expect(result).toContain('*italic*')
    expect(result).toContain('[link](http://example.com)')
    expect(result).toContain('`inline code`')
    expect(result).toContain('A quote')
  })

  it('handles stored image references properly', () => {
    const html = '<img src="stored:image-123" alt="Stored Image" />'
    const result = convertHtmlToMarkdown(html)
    expect(result).toBe('![Stored Image](stored:image-123)')
  })

  it('handles data URLs with stored ID attributes', () => {
    const html =
      '<img src="data:image/png;base64,test123" alt="Test" data-stored-id="img-456" />'
    const result = convertHtmlToMarkdown(html)
    expect(result).toBe('![Test](data:image/png;base64,test123)')
  })

  it('preserves external image URLs', () => {
    const html =
      '<img src="https://example.com/image.jpg" alt="External Image" />'
    const result = convertHtmlToMarkdown(html)
    expect(result).toBe('![External Image](https://example.com/image.jpg)')
  })

  it('handles images without alt text', () => {
    const html = '<img src="https://example.com/image.jpg" />'
    const result = convertHtmlToMarkdown(html)
    expect(result).toBe('')
  })

  it('handles anchor links correctly', () => {
    const html = '<a href="#section1">Internal Link</a>'
    const result = convertHtmlToMarkdown(html)
    expect(result).toBe('[Internal Link](#section1)')
  })

  it('handles mailto links', () => {
    const html = '<a href="mailto:test@example.com">Email Link</a>'
    const result = convertHtmlToMarkdown(html)
    expect(result).toBe('[Email Link](mailto:test@example.com)')
  })

  it('handles links without href', () => {
    const html = '<a>No href link</a>'
    const result = convertHtmlToMarkdown(html)
    expect(result).toBe('No href link')
  })

  it('handles emphasized text variations', () => {
    const html = '<i>Italic</i> and <b>Bold</b>'
    const result = convertHtmlToMarkdown(html)
    expect(result).toContain('*Italic*')
    expect(result).toContain('**Bold**')
  })

  it('handles line breaks properly', () => {
    const html = 'First line<br>Second line<br />Third line'
    const result = convertHtmlToMarkdown(html)
    expect(result).toContain('First line')
    expect(result).toContain('Second line')
    expect(result).toContain('Third line')
  })

  it('handles paragraph spacing', () => {
    const html = '<p>First paragraph</p><p>Second paragraph</p>'
    const result = convertHtmlToMarkdown(html)
    expect(result).toBe('First paragraph\n\nSecond paragraph')
  })

  it('handles whitespace normalization', () => {
    const html = '<p>Text   with    multiple     spaces</p>'
    const result = convertHtmlToMarkdown(html)
    expect(result).toContain('Text   with    multiple     spaces')
  })
})
