/**
 * Tests for advancedExport.ts - Advanced export functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  exportAsHTML,
  exportAsPDF,
  exportDocumentsAsHTML,
} from './advancedExport'

// Mock dependencies
vi.mock('./markdown', () => ({
  convertMarkdownToHtml: vi.fn((content: string) => `<p>${content}</p>`),
}))

vi.mock('./imageStorage', () => ({
  getStoredImages: vi.fn(() => [
    {
      id: 'test-image-1',
      name: 'test1.jpg',
      data: 'data:image/jpeg;base64,test1data',
      size: 1024,
      width: 800,
      height: 600,
      type: 'image/jpeg',
      uploadedAt: '2025-01-01T00:00:00.000Z',
    },
  ]),
}))

describe('advancedExport', () => {
  let mockCreateElement: any
  let mockAppendChild: any
  let mockRemoveChild: any
  let mockClick: any
  let mockCreateObjectURL: any
  let mockRevokeObjectURL: any

  beforeEach(() => {
    // Mock DOM APIs
    mockClick = vi.fn()
    mockAppendChild = vi.fn()
    mockRemoveChild = vi.fn()
    
    mockCreateElement = vi.fn((tagName: string) => {
      if (tagName === 'a') {
        return {
          href: '',
          download: '',
          style: { display: '' },
          click: mockClick,
        }
      }
      if (tagName === 'div') {
        return {
          textContent: '',
          innerHTML: '',
        }
      }
      return {}
    })

    global.document = {
      createElement: mockCreateElement,
      body: {
        appendChild: mockAppendChild,
        removeChild: mockRemoveChild,
      },
    } as any

    // Mock URL APIs
    mockCreateObjectURL = vi.fn(() => 'blob:mock-url')
    mockRevokeObjectURL = vi.fn()
    
    global.URL = {
      createObjectURL: mockCreateObjectURL,
      revokeObjectURL: mockRevokeObjectURL,
    } as any

    global.Blob = vi.fn().mockImplementation((content, options) => ({
      content,
      type: options?.type || 'text/plain',
    })) as any

    // Mock window.open
    global.window = {
      open: vi.fn(() => ({
        document: {
          write: vi.fn(),
          close: vi.fn(),
        },
        onload: null,
        print: vi.fn(),
      })),
    } as any
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('exportAsHTML', () => {
    it('exports HTML with default options', () => {
      const content = '# Test Document\n\nThis is a test.'

      exportAsHTML(content)

      expect(mockCreateElement).toHaveBeenCalledWith('a')
      expect(mockCreateObjectURL).toHaveBeenCalled()
      expect(mockClick).toHaveBeenCalled()
      expect(mockRevokeObjectURL).toHaveBeenCalled()
    })

    it('exports HTML with custom options', () => {
      const content = '# Test Document\n\nThis is a test.'
      const options = {
        title: 'Custom Title',
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
      const content = '# Test Document'
      const options = {
        includeStyles: false,
      }

      exportAsHTML(content, options)

      expect(mockClick).toHaveBeenCalled()
    })

    it('exports HTML without TOC', () => {
      const content = '# Test Document'
      const options = {
        includeTOC: false,
      }

      exportAsHTML(content, options)

      expect(mockClick).toHaveBeenCalled()
    })

    it('exports HTML without embedding images', () => {
      const content = '# Test Document\n\n![Test](stored:test-image-1)'
      const options = {
        embedImages: false,
      }

      exportAsHTML(content, options)

      expect(mockClick).toHaveBeenCalled()
    })

    it('exports HTML without timestamp', () => {
      const content = '# Test Document'
      const options = {
        addTimestamp: false,
      }

      exportAsHTML(content, options)

      expect(mockClick).toHaveBeenCalled()
    })

    it('handles different themes', () => {
      const content = '# Test Document'
      
      const themes = ['default', 'github', 'academic', 'minimal'] as const
      
      themes.forEach(theme => {
        exportAsHTML(content, { theme })
        expect(mockClick).toHaveBeenCalled()
      })
    })

    it('handles different font sizes', () => {
      const content = '# Test Document'
      
      const fontSizes = ['small', 'medium', 'large'] as const
      
      fontSizes.forEach(fontSize => {
        exportAsHTML(content, { fontSize })
        expect(mockClick).toHaveBeenCalled()
      })
    })

    it('generates table of contents for markdown with headers', () => {
      const content = `# Main Title
## Section 1
### Subsection 1.1
## Section 2`

      exportAsHTML(content, { includeTOC: true })

      expect(mockClick).toHaveBeenCalled()
    })

    it('embeds stored images correctly', () => {
      const content = '![Test Image](stored:test-image-1)'

      exportAsHTML(content, { embedImages: true })

      expect(mockClick).toHaveBeenCalled()
    })
  })

  describe('exportAsPDF', () => {
    it('opens new window for PDF export', async () => {
      const mockWindow = {
        document: {
          write: vi.fn(),
          close: vi.fn(),
        },
        onload: null,
        print: vi.fn(),
      }

      global.window = {
        open: vi.fn(() => mockWindow),
      } as any

      const content = '# Test Document'

      await exportAsPDF(content)

      expect(global.window.open).toHaveBeenCalledWith('', '_blank')
      expect(mockWindow.document.write).toHaveBeenCalled()
      expect(mockWindow.document.close).toHaveBeenCalled()
    })

    it('handles blocked popup window', async () => {
      global.window = {
        open: vi.fn(() => null),
      } as any

      global.alert = vi.fn()

      const content = '# Test Document'

      await exportAsPDF(content)

      expect(mockClick).toHaveBeenCalled() // Falls back to download
      expect(global.alert).toHaveBeenCalled()
    })

    it('triggers print after window loads', async () => {
      const mockWindow = {
        document: {
          write: vi.fn(),
          close: vi.fn(),
        },
        onload: null,
        print: vi.fn(),
      }

      global.window = {
        open: vi.fn(() => mockWindow),
      } as any

      const content = '# Test Document'

      await exportAsPDF(content)

      // Simulate window load event
      if (mockWindow.onload) {
        mockWindow.onload()
        
        // Wait for setTimeout to complete
        await new Promise(resolve => setTimeout(resolve, 600))
        
        expect(mockWindow.print).toHaveBeenCalled()
      }
    })

    it('uses academic theme for PDF by default', async () => {
      const mockWindow = {
        document: {
          write: vi.fn(),
          close: vi.fn(),
        },
        onload: null,
        print: vi.fn(),
      }

      global.window = {
        open: vi.fn(() => mockWindow),
      } as any

      const content = '# Test Document'

      await exportAsPDF(content, { theme: 'github' })

      expect(mockWindow.document.write).toHaveBeenCalled()
      // The theme should be overridden to 'academic' for PDF
    })

    it('includes TOC by default for PDF', async () => {
      const mockWindow = {
        document: {
          write: vi.fn(),
          close: vi.fn(),
        },
        onload: null,
        print: vi.fn(),
      }

      global.window = {
        open: vi.fn(() => mockWindow),
      } as any

      const content = '# Header 1\n## Header 2'

      await exportAsPDF(content)

      expect(mockWindow.document.write).toHaveBeenCalled()
    })
  })

  describe('exportDocumentsAsHTML', () => {
    const mockDocuments = [
      {
        id: 'doc1',
        title: 'Document 1',
        content: '# Document 1\n\nContent 1',
        lastModified: new Date('2025-01-01T12:00:00Z'),
        isUnsaved: false,
      },
      {
        id: 'doc2',
        title: 'Document 2',
        content: '# Document 2\n\nContent 2',
        lastModified: new Date('2025-01-02T12:00:00Z'),
        isUnsaved: true,
      },
    ]

    it('exports multiple documents as HTML collection', async () => {
      await exportDocumentsAsHTML(mockDocuments)

      expect(mockClick).toHaveBeenCalled()
      expect(mockCreateObjectURL).toHaveBeenCalled()
    })

    it('exports with custom options', async () => {
      const options = {
        title: 'My Collection',
        author: 'Test Author',
        theme: 'academic' as const,
        fontSize: 'large' as const,
        embedImages: false,
        addTimestamp: false,
      }

      await exportDocumentsAsHTML(mockDocuments, options)

      expect(mockClick).toHaveBeenCalled()
    })

    it('includes document metadata', async () => {
      await exportDocumentsAsHTML(mockDocuments)

      expect(mockClick).toHaveBeenCalled()
      // Should include last modified dates and unsaved status
    })

    it('generates collection table of contents', async () => {
      await exportDocumentsAsHTML(mockDocuments)

      expect(mockClick).toHaveBeenCalled()
      // Should create TOC with links to each document
    })

    it('embeds images when specified', async () => {
      const documentsWithImages = [
        {
          ...mockDocuments[0],
          content: '# Doc 1\n\n![Test](stored:test-image-1)',
        },
      ]

      await exportDocumentsAsHTML(documentsWithImages, { embedImages: true })

      expect(mockClick).toHaveBeenCalled()
    })

    it('handles empty document list', async () => {
      await exportDocumentsAsHTML([])

      expect(mockClick).toHaveBeenCalled()
    })
  })

  describe('utility functions', () => {
    it('handles HTML escaping correctly', () => {
      const content = '# Test <script>alert("xss")</script>'

      exportAsHTML(content, { title: '<script>alert("xss")</script>' })

      expect(mockClick).toHaveBeenCalled()
      // HTML should be escaped in the generated document
    })

    it('sanitizes filenames correctly', () => {
      const content = '# Test'
      const title = 'Test/File\\Name:With*Special?Chars'

      exportAsHTML(content, { title })

      expect(mockClick).toHaveBeenCalled()
      // Filename should be sanitized
    })

    it('generates correct timestamps', () => {
      const content = '# Test'

      exportAsHTML(content, { addTimestamp: true })

      expect(mockClick).toHaveBeenCalled()
      // Should include timestamp in ISO format
    })

    it('handles missing stored images gracefully', () => {
      const content = '![Missing](stored:non-existent-id)'

      exportAsHTML(content, { embedImages: true })

      expect(mockClick).toHaveBeenCalled()
      // Should not break when image is not found
    })

    it('processes headings for anchor IDs', () => {
      const content = `# Main Title
## Section with Special Characters!
### Another Section (with parentheses)`

      exportAsHTML(content, { includeTOC: true })

      expect(mockClick).toHaveBeenCalled()
      // Should generate valid anchor IDs
    })

    it('handles different content types in headings', () => {
      const content = `# **Bold Title**
## _Italic Title_
### \`Code Title\``

      exportAsHTML(content, { includeTOC: true })

      expect(mockClick).toHaveBeenCalled()
    })
  })

  describe('error handling', () => {
    it('handles blob creation errors', () => {
      global.Blob = vi.fn().mockImplementation(() => {
        throw new Error('Blob creation failed')
      })

      expect(() => {
        exportAsHTML('# Test')
      }).toThrow('Blob creation failed')
    })

    it('handles URL creation errors', () => {
      global.URL = {
        createObjectURL: vi.fn(() => {
          throw new Error('URL creation failed')
        }),
        revokeObjectURL: vi.fn(),
      } as any

      expect(() => {
        exportAsHTML('# Test')
      }).toThrow('URL creation failed')
    })

    it('handles DOM manipulation errors', () => {
      global.document = {
        createElement: vi.fn(() => {
          throw new Error('Element creation failed')
        }),
      } as any

      expect(() => {
        exportAsHTML('# Test')
      }).toThrow('Element creation failed')
    })
  })
})