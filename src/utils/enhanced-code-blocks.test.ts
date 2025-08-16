import { describe, it, expect } from 'vitest'
import { convertMarkdownToHtml } from './markdown'

describe('Enhanced Code Blocks', () => {
  it('should render code block with filename', () => {
    const markdown = '```python:example.py\nprint("Hello World")\n```'
    const html = convertMarkdownToHtml(markdown)

    expect(html).toContain('enhanced-code-block')
    expect(html).toContain('code-filename')
    expect(html).toContain('example.py')
    expect(html).toContain('print("Hello World")')
    expect(html).toContain('>Copy</button>')
    expect(html).toContain('title="Copy example.py"')
  })

  it('should render code block with language only', () => {
    const markdown = '```javascript\nconsole.log("test")\n```'
    const html = convertMarkdownToHtml(markdown)

    expect(html).toContain('enhanced-code-block')
    expect(html).toContain('code-language')
    expect(html).toContain('javascript')
    expect(html).toContain('console.log("test")')
    expect(html).toContain('Copy')
    expect(html).toContain('code-copy-btn')
  })

  it('should render plain code block', () => {
    const markdown = '```\nplain text\n```'
    const html = convertMarkdownToHtml(markdown)

    expect(html).toContain('enhanced-code-block')
    expect(html).toContain('code-language')
    expect(html).toContain('text')
    expect(html).toContain('plain text')
  })

  it('should handle complex filename parsing', () => {
    const markdown =
      '```typescript:src/utils/helper.ts\ninterface User { name: string }\n```'
    const html = convertMarkdownToHtml(markdown)

    expect(html).toContain('code-filename')
    expect(html).toContain('src/utils/helper.ts')
    expect(html).toContain('interface User { name: string }')
    expect(html).toContain('>Copy</button>')
    expect(html).toContain('title="Copy src/utils/helper.ts"')
  })

  it('should properly escape JavaScript in copy button', () => {
    const markdown = '```javascript\nconsole.log("test with \' quotes");\n```'
    const html = convertMarkdownToHtml(markdown)

    // Should contain properly escaped JavaScript in onclick attribute (now using single quotes)
    expect(html).toContain("onclick='navigator.clipboard.writeText")
    expect(html).toContain("test with ' quotes")

    // Should have proper button text only - no JavaScript code as visible text
    expect(html).toContain('Copy')
    expect(html).toContain('</button>')

    // Should contain the copy functionality but properly contained within onclick
    expect(html).toContain('this.textContent = "Copied!"')

    // The onclick should be properly formed (now using single quotes)
    expect(html).toMatch(/onclick='[^']*'/)

    // Should not have broken HTML structure
    expect(html).toContain('class="code-copy-btn"')
    expect(html).toContain('enhanced-code-block')
  })

  it('should generate Prism.js compatible class names', () => {
    const tests = [
      {
        markdown: '```python\nprint("hello")\n```',
        expected: 'language-python',
      },
      {
        markdown: '```javascript:test.js\nconsole.log("test")\n```',
        expected: 'language-javascript',
      },
      {
        markdown: '```typescript:app.ts\nconst x: number = 5\n```',
        expected: 'language-typescript',
      },
      {
        markdown: '```css\nbody { color: red; }\n```',
        expected: 'language-css',
      },
    ]

    tests.forEach(({ markdown, expected }) => {
      const html = convertMarkdownToHtml(markdown)
      expect(html).toContain(expected)
      expect(html).toContain('enhanced-code-block')
    })
  })
})
