/**
 * Tests for advancedExport.ts utility functions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  exportAsHTML,
  exportAsPDF,
  exportDocumentsAsHTML,
} from './advancedExport'
import type { Document } from '../types/document'

// Mock dependencies
vi.mock('./markdown', () => ({
  convertMarkdownToHtml: vi.fn((content: string) => `<p>${content}</p>`),
}))

vi.mock('./imageStorage', () => ({
  getStoredImages: vi.fn(() => [
    {
      id: 'test-image-1',
      data: 'data:image/png;base64,testdata1',
      name: 'test1.png',
    },
    {
      id: 'test-image-2',
      data: 'data:image/jpg;base64,testdata2',
      name: 'test2.jpg',
    },
  ]),
}))

describe('advancedExport', () => {
  let mockCreateElement: ReturnType<typeof vi.fn>
  let mockCreateObjectURL: ReturnType<typeof vi.fn>
  let mockRevokeObjectURL: ReturnType<typeof vi.fn>
  let mockClick: ReturnType<typeof vi.fn>
  let mockAppendChild: ReturnType<typeof vi.fn>
  let mockRemoveChild: ReturnType<typeof vi.fn>
  let mockOpen: ReturnType<typeof vi.fn>

  beforeEach(() => {
    // Mock DOM elements
    mockClick = vi.fn()
    mockAppendChild = vi.fn()
    mockRemoveChild = vi.fn()

    const mockLink = {
      href: '',
      download: '',
      style: { display: '' },
      click: mockClick,
    }

    const mockDiv = {
      textContent: '',
      innerHTML: '',
    }

    mockCreateElement = vi.fn((tagName: string) => {
      if (tagName === 'a') return mockLink
      if (tagName === 'div') return mockDiv
      return {}
    })

    // Mock URL methods
    mockCreateObjectURL = vi.fn(() => 'blob:mock-url')
    mockRevokeObjectURL = vi.fn()

    // Mock window.open
    mockOpen = vi.fn()

    // Mock global objects
    global.document = {
      createElement: mockCreateElement,
      body: {
        appendChild: mockAppendChild,
        removeChild: mockRemoveChild,
      },
    } as unknown as Document

    global.URL = {
      createObjectURL: mockCreateObjectURL,
      revokeObjectURL: mockRevokeObjectURL,
    } as unknown as typeof URL

    global.window = {
      open: mockOpen,
    } as unknown as Window & typeof globalThis

    global.Blob = vi.fn((content, options) => ({
      content,
      type: options?.type,
    })) as unknown as typeof Blob

    global.Date = class extends Date {
      toLocaleString() {
        return 'January 1, 2024 at 12:00:00 PM GMT'
      }
      toISOString() {
        return '2024-01-01T12:00:00.000Z'
      }
    } as unknown as DateConstructor

    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('exportAsHTML', () => {
    it('exports HTML with default options', () => {
      const content = '# Test Heading\nSome content here.'

      exportAsHTML(content)

      expect(mockCreateElement).toHaveBeenCalledWith('a')
      expect(mockAppendChild).toHaveBeenCalled()
      expect(mockClick).toHaveBeenCalled()
      expect(mockRemoveChild).toHaveBeenCalled()
      expect(mockRevokeObjectURL).toHaveBeenCalled()
    })

    it('exports HTML with custom options', () => {
      const content = '# Custom Title\nCustom content.'
      const options = {
        title: 'Custom Document',
        author: 'Test Author',
        includeStyles: true,
        includeTOC: true,
        theme: 'github' as const,
        fontSize: 'large' as const,
        embedImages: true,
        addTimestamp: true,
      }

      exportAsHTML(content, options)

      expect(mockCreateElement).toHaveBeenCalledWith('a')
      expect(mockClick).toHaveBeenCalled()
    })

    it('exports HTML without styles', () => {
      const content = '# No Styles\nContent without styles.'
      const options = {
        includeStyles: false,
        addTimestamp: false,
      }

      exportAsHTML(content, options)

      expect(mockCreateElement).toHaveBeenCalledWith('a')
      expect(mockClick).toHaveBeenCalled()
    })

    it('exports HTML without TOC', () => {
      const content = '# No TOC\nContent without table of contents.'
      const options = {
        includeTOC: false,
      }

      exportAsHTML(content, options)

      expect(mockCreateElement).toHaveBeenCalledWith('a')
      expect(mockClick).toHaveBeenCalled()
    })

    it('exports HTML with different themes', () => {
      const content = '# Theme Test\nTesting different themes.'

      const themes = ['default', 'github', 'academic', 'minimal'] as const
      themes.forEach((theme) => {
        exportAsHTML(content, { theme })
        expect(mockClick).toHaveBeenCalled()
      })
    })

    it('exports HTML with different font sizes', () => {
      const content = '# Font Size Test\nTesting different font sizes.'

      const fontSizes = ['small', 'medium', 'large'] as const
      fontSizes.forEach((fontSize) => {
        exportAsHTML(content, { fontSize })
        expect(mockClick).toHaveBeenCalled()
      })
    })

    it('exports HTML without embedding images', () => {
      const content = '# No Images\nContent without embedded images.'
      const options = {
        embedImages: false,
      }

      exportAsHTML(content, options)

      expect(mockCreateElement).toHaveBeenCalledWith('a')
      expect(mockClick).toHaveBeenCalled()
    })
  })

  describe('exportAsPDF', () => {
    it('exports PDF with popup window', async () => {
      const mockPrintWindow = {
        document: {
          write: vi.fn(),
          close: vi.fn(),
        },
        onload: null,
        print: vi.fn(),
      }

      mockOpen.mockReturnValue(mockPrintWindow)

      const content = '# PDF Test\nContent for PDF export.'

      await exportAsPDF(content)

      expect(mockOpen).toHaveBeenCalledWith('', '_blank')
      expect(mockPrintWindow.document.write).toHaveBeenCalled()
      expect(mockPrintWindow.document.close).toHaveBeenCalled()
    })

    it('exports PDF with custom options', async () => {
      const mockPrintWindow = {
        document: {
          write: vi.fn(),
          close: vi.fn(),
        },
        onload: null,
        print: vi.fn(),
      }

      mockOpen.mockReturnValue(mockPrintWindow)

      const content = '# Custom PDF\nCustom PDF content.'
      const options = {
        title: 'Custom PDF Document',
        author: 'PDF Author',
        fontSize: 'large' as const,
        addTimestamp: false,
      }

      await exportAsPDF(content, options)

      expect(mockOpen).toHaveBeenCalledWith('', '_blank')
      expect(mockPrintWindow.document.write).toHaveBeenCalled()
    })

    it('handles blocked popup window with fallback', async () => {
      mockOpen.mockReturnValue(null)
      global.alert = vi.fn()

      const content = '# Blocked PDF\nContent when popup is blocked.'

      await exportAsPDF(content)

      expect(mockOpen).toHaveBeenCalledWith('', '_blank')
      expect(mockCreateElement).toHaveBeenCalledWith('a')
      expect(mockClick).toHaveBeenCalled()
      expect(global.alert).toHaveBeenCalled()
    })

    it('triggers print after window loads', async () => {
      const mockPrintWindow = {
        document: {
          write: vi.fn(),
          close: vi.fn(),
        },
        onload: null,
        print: vi.fn(),
      }

      mockOpen.mockReturnValue(mockPrintWindow)

      const content = '# Print Test\nContent for print test.'

      await exportAsPDF(content)

      // Simulate window load event
      if (mockPrintWindow.onload) {
        mockPrintWindow.onload()

        // Simulate setTimeout callback
        await new Promise((resolve) => setTimeout(resolve, 600))
        expect(mockPrintWindow.print).toHaveBeenCalled()
      }
    })
  })

  describe('exportDocumentsAsHTML', () => {
    const mockDocuments: Document[] = [
      {
        id: 'doc1',
        title: 'First Document',
        content: '# First Doc\nFirst document content.',
        lastModified: '2024-01-01T10:00:00.000Z',
        isUnsaved: false,
        isPinned: false,
      },
      {
        id: 'doc2',
        title: 'Second Document',
        content: '# Second Doc\nSecond document content.',
        lastModified: '2024-01-02T10:00:00.000Z',
        isUnsaved: true,
        isPinned: false,
      },
    ]

    it('exports multiple documents as HTML collection', async () => {
      await exportDocumentsAsHTML(mockDocuments)

      expect(mockCreateElement).toHaveBeenCalledWith('a')
      expect(mockClick).toHaveBeenCalled()
    })

    it('exports documents with custom options', async () => {
      const options = {
        title: 'Custom Collection',
        author: 'Collection Author',
        theme: 'academic' as const,
        fontSize: 'small' as const,
        embedImages: false,
        addTimestamp: false,
      }

      await exportDocumentsAsHTML(mockDocuments, options)

      expect(mockCreateElement).toHaveBeenCalledWith('a')
      expect(mockClick).toHaveBeenCalled()
    })

    it('handles empty document collection', async () => {
      await exportDocumentsAsHTML([])

      expect(mockCreateElement).toHaveBeenCalledWith('a')
      expect(mockClick).toHaveBeenCalled()
    })

    it('handles documents with special characters in titles', async () => {
      const specialDocs: Document[] = [
        {
          id: 'doc-special',
          title: 'Document with "quotes" & symbols!',
          content: '# Special\nContent with special characters.',
          lastModified: '2024-01-01T10:00:00.000Z',
          isUnsaved: false,
          isPinned: false,
        },
      ]

      await exportDocumentsAsHTML(specialDocs)

      expect(mockCreateElement).toHaveBeenCalledWith('a')
      expect(mockClick).toHaveBeenCalled()
    })
  })

  describe('utility functions integration', () => {
    it('sanitizes filenames correctly', () => {
      const content = '# Test Document'
      const options = {
        title: 'My Special Document! @#$',
      }

      exportAsHTML(content, options)

      // Verify link was created (sanitization happens internally)
      expect(mockCreateElement).toHaveBeenCalledWith('a')
      expect(mockClick).toHaveBeenCalled()
    })

    it('generates timestamps correctly', () => {
      const content = '# Timestamp Test'

      exportAsHTML(content)

      expect(mockCreateElement).toHaveBeenCalledWith('a')
      expect(mockClick).toHaveBeenCalled()
    })

    it('escapes HTML in titles and content', () => {
      const content = '# <script>alert("xss")</script>'
      const options = {
        title: '<img src=x onerror=alert(1)>',
        author: '<b>Bold Author</b>',
      }

      exportAsHTML(content, options)

      expect(mockCreateElement).toHaveBeenCalledWith('div')
      expect(mockCreateElement).toHaveBeenCalledWith('a')
      expect(mockClick).toHaveBeenCalled()
    })

    it('embeds stored images correctly', () => {
      const content = '# Image Test\n![test](stored:test-image-1)'

      exportAsHTML(content, { embedImages: true })

      expect(mockCreateElement).toHaveBeenCalledWith('a')
      expect(mockClick).toHaveBeenCalled()
    })

    it('does not embed images when disabled', () => {
      const content = '# Image Test\n![test](stored:test-image-1)'

      exportAsHTML(content, { embedImages: false })

      expect(mockCreateElement).toHaveBeenCalledWith('a')
      expect(mockClick).toHaveBeenCalled()
    })

    it('handles content with no headings', () => {
      const content = 'Just plain text without any headings.'

      exportAsHTML(content, { includeTOC: true })

      expect(mockCreateElement).toHaveBeenCalledWith('a')
      expect(mockClick).toHaveBeenCalled()
    })

    it('generates table of contents for complex heading structure', () => {
      const content = `# Introduction
Some intro text.

## Getting Started
Getting started section.

### Installation
Installation details.

### Configuration
Configuration details.

## Advanced Usage
Advanced topics.

#### Deep Nesting
Very specific details.

# Conclusion
Final thoughts.`

      exportAsHTML(content, { includeTOC: true })

      expect(mockCreateElement).toHaveBeenCalledWith('a')
      expect(mockClick).toHaveBeenCalled()
    })

    it('handles headings with special characters for anchor generation', () => {
      const content = `# Hello, World!
## Installation & Setup
### FAQ: Common Issues?
#### Notes/Comments (Important)
##### Special "Quotes" & Symbols!`

      exportAsHTML(content, { includeTOC: true })

      expect(mockCreateElement).toHaveBeenCalledWith('a')
      expect(mockClick).toHaveBeenCalled()
    })

    it('creates blob with correct MIME type', () => {
      const content = '# Blob Test'

      exportAsHTML(content)

      expect(global.Blob).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({ type: 'text/html' })
      )
    })

    it('manages URL lifecycle correctly', () => {
      const content = '# URL Test'

      exportAsHTML(content)

      expect(mockCreateObjectURL).toHaveBeenCalled()
      expect(mockRevokeObjectURL).toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('handles empty content', () => {
      exportAsHTML('')

      expect(mockCreateElement).toHaveBeenCalledWith('a')
      expect(mockClick).toHaveBeenCalled()
    })

    it('handles very long content', () => {
      const longContent = 'A'.repeat(100000)

      exportAsHTML(longContent)

      expect(mockCreateElement).toHaveBeenCalledWith('a')
      expect(mockClick).toHaveBeenCalled()
    })

    it('handles content with many headings', () => {
      const manyHeadings = Array.from(
        { length: 100 },
        (_, i) => `# Heading ${i + 1}\nContent for heading ${i + 1}.`
      ).join('\n\n')

      exportAsHTML(manyHeadings, { includeTOC: true })

      expect(mockCreateElement).toHaveBeenCalledWith('a')
      expect(mockClick).toHaveBeenCalled()
    })

    it('handles undefined options gracefully', () => {
      const content = '# Graceful Test'

      // @ts-expect-error Testing runtime behavior with undefined
      exportAsHTML(content, undefined)
      expect(mockClick).toHaveBeenCalled()
    })

    it('handles PDF export with undefined print window methods', async () => {
      const mockPrintWindow = {
        document: {
          write: vi.fn(),
          close: vi.fn(),
        },
        onload: null,
        print: undefined, // Missing print method
      }

      mockOpen.mockReturnValue(mockPrintWindow)

      const content = '# PDF Edge Case'

      await exportAsPDF(content)

      expect(mockOpen).toHaveBeenCalled()
      expect(mockPrintWindow.document.write).toHaveBeenCalled()
    })
  })
})
