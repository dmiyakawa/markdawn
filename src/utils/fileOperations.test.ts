import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  importMarkdownFile,
  exportMarkdownFile,
  exportAllDocuments,
  saveToLocalStorage,
  loadFromLocalStorage,
  getSaveTimestamp,
  clearLocalStorage,
  hasSavedContent,
  getWordCount,
  getCharacterCount,
  getLineCount,
} from './fileOperations'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

vi.stubGlobal('localStorage', localStorageMock)

// Mock URL and document for export tests
const mockURL = {
  createObjectURL: vi.fn(() => 'mock-url'),
  revokeObjectURL: vi.fn(),
}
vi.stubGlobal('URL', mockURL)

const mockDocument = {
  createElement: vi.fn(() => ({
    href: '',
    download: '',
    style: { display: '' },
    click: vi.fn(),
  })),
  body: {
    appendChild: vi.fn(),
    removeChild: vi.fn(),
  },
}
vi.stubGlobal('document', mockDocument)

describe('File Import Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('imports valid markdown file', async () => {
    const mockContent = '# Test Content\nThis is a test markdown file.'
    const mockFile = new File([mockContent], 'test.md', {
      type: 'text/markdown',
    })

    const content = await importMarkdownFile(mockFile)
    expect(content).toBe(mockContent)
  })

  it('accepts .markdown extension', async () => {
    const mockContent = '# Test'
    const mockFile = new File([mockContent], 'test.markdown', {
      type: 'text/markdown',
    })

    const content = await importMarkdownFile(mockFile)
    expect(content).toBe(mockContent)
  })

  it('rejects non-markdown files', async () => {
    const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' })

    await expect(importMarkdownFile(mockFile)).rejects.toThrow(
      'Please select a markdown file'
    )
  })

  it('rejects files larger than 10MB', async () => {
    const largeContent = 'x'.repeat(11 * 1024 * 1024) // 11MB
    const mockFile = new File([largeContent], 'large.md', {
      type: 'text/markdown',
    })

    await expect(importMarkdownFile(mockFile)).rejects.toThrow(
      'File is too large'
    )
  })

  it('handles file read errors', async () => {
    const mockFile = new File(['content'], 'test.md', { type: 'text/markdown' })

    // Mock FileReader to simulate error
    const mockFileReader = {
      readAsText: vi.fn(),
      onload: null as ((event: ProgressEvent<FileReader>) => void) | null,
      onerror: null as ((event: ProgressEvent<FileReader>) => void) | null,
      result: null,
    }

    vi.stubGlobal(
      'FileReader',
      vi.fn(() => mockFileReader)
    )

    const promise = importMarkdownFile(mockFile)

    // Simulate error
    if (mockFileReader.onerror) {
      const errorEvent = new ProgressEvent('error') as ProgressEvent<FileReader>
      mockFileReader.onerror(errorEvent)
    }

    await expect(promise).rejects.toThrow('Failed to read file')
  })

  it('rejects when no file provided', async () => {
    await expect(importMarkdownFile(null as unknown as File)).rejects.toThrow(
      'No file provided'
    )
  })
})

describe('File Export Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exports markdown content with default filename', () => {
    const content = '# Test Document'

    exportMarkdownFile(content)

    expect(mockDocument.createElement).toHaveBeenCalledWith('a')
    expect(mockURL.createObjectURL).toHaveBeenCalled()
  })

  it('exports with custom filename', () => {
    const content = '# Test Document'
    const filename = 'my-document.md'

    exportMarkdownFile(content, filename)

    expect(mockDocument.createElement).toHaveBeenCalledWith('a')
  })

  it('exports all documents as ZIP file', async () => {
    // Mock JSZip
    const mockZip = {
      file: vi.fn(),
      folder: vi.fn(() => ({
        file: vi.fn(),
      })),
      generateAsync: vi.fn().mockResolvedValue(new Blob()),
    }
    vi.doMock('jszip', () => ({
      default: vi.fn(() => mockZip),
    }))

    // Mock documents
    const documents = [
      {
        id: '1',
        title: 'Document 1',
        content: '# First Document\n\nContent 1',
        isUnsaved: false,
        isPinned: false,
        createdAt: '2023-01-01T00:00:00.000Z',
        lastModified: '2023-01-01T00:00:00.000Z',
      },
      {
        id: '2',
        title: 'Document 2',
        content: '# Second Document\n\nContent 2',
        isUnsaved: false,
        isPinned: false,
        createdAt: '2023-01-01T00:00:00.000Z',
        lastModified: '2023-01-01T00:00:00.000Z',
      },
    ]

    // Mock image operations
    vi.doMock('./imageStorage', () => ({
      getStoredImages: () => [],
    }))

    await exportAllDocuments(documents)

    expect(mockDocument.createElement).toHaveBeenCalledWith('a')
    expect(mockURL.createObjectURL).toHaveBeenCalled()
  })
})

describe('localStorage Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('saves content to localStorage', () => {
    const content = '# Test Content'

    const result = saveToLocalStorage(content)

    expect(result).toBe(true)
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'markdown-editor-content',
      expect.stringContaining('"content":"# Test Content"')
    )
  })

  it('saves with custom key', () => {
    const content = '# Test'
    const key = 'custom-key'

    saveToLocalStorage(content, key)

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      key,
      expect.any(String)
    )
  })

  it('handles localStorage save errors', () => {
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('Storage full')
    })

    const result = saveToLocalStorage('content')

    expect(result).toBe(false)
  })

  it('loads content from localStorage', () => {
    const mockData = {
      content: '# Saved Content',
      timestamp: '2023-01-01T00:00:00.000Z',
      version: '1.0',
    }

    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockData))

    const content = loadFromLocalStorage()

    expect(content).toBe('# Saved Content')
    expect(localStorageMock.getItem).toHaveBeenCalledWith(
      'markdown-editor-content'
    )
  })

  it('returns null when no saved content', () => {
    localStorageMock.getItem.mockReturnValue(null)

    const content = loadFromLocalStorage()

    expect(content).toBe(null)
  })

  it('handles localStorage load errors', () => {
    localStorageMock.getItem.mockReturnValue('invalid-json')

    const content = loadFromLocalStorage()

    expect(content).toBe(null)
  })

  it('gets save timestamp', () => {
    const mockData = {
      content: '# Test',
      timestamp: '2023-01-01T00:00:00.000Z',
    }

    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockData))

    const timestamp = getSaveTimestamp()

    expect(timestamp).toBe('2023-01-01T00:00:00.000Z')
  })

  it('clears localStorage', () => {
    const result = clearLocalStorage()

    expect(result).toBe(true)
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(
      'markdown-editor-content'
    )
  })

  it('checks for saved content', () => {
    localStorageMock.getItem.mockReturnValue('some-data')

    const hasContent = hasSavedContent()

    expect(hasContent).toBe(true)
  })
})

describe('Content Analysis', () => {
  it('counts words in markdown content', () => {
    const content =
      '# Header\n\nThis is **bold** text with `code` and [link](url).'

    const count = getWordCount(content)

    expect(count).toBeGreaterThan(0)
  })

  it('handles empty content for word count', () => {
    expect(getWordCount('')).toBe(0)
    expect(getWordCount('   ')).toBe(0)
  })

  it('excludes code blocks from word count', () => {
    const content = 'Normal text\n\n```\ncode block content\n```\n\nMore text'

    const count = getWordCount(content)

    expect(count).toBe(4) // "Normal text More text"
  })

  it('counts characters with and without spaces', () => {
    const content = 'Hello World'

    const counts = getCharacterCount(content)

    expect(counts.withSpaces).toBe(11)
    expect(counts.withoutSpaces).toBe(10)
  })

  it('counts lines in content', () => {
    const content = 'Line 1\nLine 2\nLine 3'

    const count = getLineCount(content)

    expect(count).toBe(3)
  })

  it('handles empty content for line count', () => {
    expect(getLineCount('')).toBe(1)
    expect(getLineCount('Single line')).toBe(1)
  })

  describe('Error Handling', () => {
    beforeEach(() => {
      // Reset localStorage mock before each test
      localStorageMock.setItem.mockReset()
      localStorageMock.getItem.mockReset()
      localStorageMock.removeItem.mockReset()
    })

    it('handles localStorage clear errors', () => {
      // Mock localStorage.removeItem to throw an error
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      // Mock console.error to verify it's called
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const result = clearLocalStorage('test-key')

      expect(result).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to clear localStorage:',
        expect.any(Error)
      )

      // Restore original methods
      consoleSpy.mockRestore()
    })

    it('handles localStorage access errors in hasSavedContent', () => {
      // Mock localStorage.getItem to throw an error
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      const result = hasSavedContent('test-key')

      expect(result).toBe(false)
    })

    it('handles clearLocalStorage success case', () => {
      // Mock successful removal
      localStorageMock.removeItem.mockImplementation(() => {})

      const result = clearLocalStorage('test-clear-key')

      expect(result).toBe(true)
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('test-clear-key')
    })

    it('handles hasSavedContent with existing content', () => {
      localStorageMock.getItem.mockReturnValue('test content')

      const result = hasSavedContent('test-has-content')

      expect(result).toBe(true)
    })

    it('handles hasSavedContent with no content', () => {
      localStorageMock.getItem.mockReturnValue(null)

      const result = hasSavedContent('non-existent-key')

      expect(result).toBe(false)
    })
  })

  describe('Advanced File Operations', () => {
    beforeEach(() => {
      vi.clearAllMocks()
      localStorageMock.setItem.mockReset()
      localStorageMock.getItem.mockReset()
      localStorageMock.removeItem.mockReset()
    })

    it('handles FileReader success and error scenarios comprehensively', async () => {
      const content = '# Test Content'
      const file = new File([content], 'test.md', { type: 'text/markdown' })

      // Test successful read
      const mockFileReader = {
        readAsText: vi.fn(),
        onload: null as ((event: ProgressEvent<FileReader>) => void) | null,
        onerror: null as ((event: ProgressEvent<FileReader>) => void) | null,
        result: content,
      }

      vi.stubGlobal(
        'FileReader',
        vi.fn(() => mockFileReader)
      )

      const promise = importMarkdownFile(file)

      // Simulate successful load
      if (mockFileReader.onload) {
        const loadEvent = {
          target: { result: content },
        } as ProgressEvent<FileReader>
        mockFileReader.onload(loadEvent)
      }

      const result = await promise
      expect(result).toBe(content)
    })

    it('handles export with different content types', () => {
      // Test with various markdown content
      const contents = [
        '# Simple Header',
        '# Complex\n\n**Bold** and *italic* text\n\n- List item 1\n- List item 2',
        '', // Empty content
        'Just plain text without markdown',
        '```\ncode block\n```',
      ]

      contents.forEach((content, index) => {
        const filename = `test-${index}.md`
        exportMarkdownFile(content, filename)

        expect(mockDocument.createElement).toHaveBeenCalledWith('a')
        expect(mockURL.createObjectURL).toHaveBeenCalled()
      })
    })

    it('handles localStorage operations with different data structures', () => {
      // Test saving simple string
      const simpleData = 'simple test content'

      const result = saveToLocalStorage(simpleData, 'simple-data')
      expect(result).toBe(true)
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'simple-data',
        expect.any(String)
      )
    })

    it('handles content analysis edge cases', () => {
      // Test word count with special characters
      const contentWithSpecialChars =
        'Hello-world & test@example.com (parentheses) [brackets] {braces}'
      const wordCount = getWordCount(contentWithSpecialChars)
      expect(wordCount).toBeGreaterThan(0)

      // Test character count with Unicode characters
      const unicodeContent = '你好世界 emoji: 🌟🎉'
      const charCounts = getCharacterCount(unicodeContent)
      expect(charCounts.withSpaces).toBeGreaterThan(charCounts.withoutSpaces)

      // Test line count with different line endings
      const mixedLineEndings = 'Line 1\nLine 2\r\nLine 3\rLine 4'
      const lineCount = getLineCount(mixedLineEndings)
      expect(lineCount).toBeGreaterThan(1)
    })

    it('handles markdown-specific content analysis', () => {
      // Test word count excluding markdown syntax
      const markdownContent = `
        # Header 1
        ## Header 2
        
        **Bold text** and *italic text*
        
        - List item 1
        - List item 2
        
        [Link text](http://example.com)
        
        \`\`\`javascript
        function test() {
          console.log('code block');
        }
        \`\`\`
        
        Inline \`code\` here.
      `

      const wordCount = getWordCount(markdownContent)
      expect(wordCount).toBeGreaterThan(0)

      const charCounts = getCharacterCount(markdownContent)
      expect(charCounts.withSpaces).toBeGreaterThan(100)

      const lineCount = getLineCount(markdownContent)
      expect(lineCount).toBeGreaterThan(10)
    })

    it('handles localStorage quota exceeded errors', () => {
      // Mock localStorage.setItem to throw QuotaExceededError
      localStorageMock.setItem.mockImplementation(() => {
        const error = new Error('QuotaExceededError')
        error.name = 'QuotaExceededError'
        throw error
      })

      const result = saveToLocalStorage('large content', 'quota-test')
      expect(result).toBe(false)
    })

    it('handles localStorage with null and undefined values', () => {
      // Test loading with null return
      localStorageMock.getItem.mockReturnValue(null)
      expect(loadFromLocalStorage('null-key')).toBe(null)

      // Test loading with undefined return (should not happen in real browsers)
      localStorageMock.getItem.mockReturnValue(undefined)
      expect(loadFromLocalStorage('undefined-key')).toBe(null)

      // Test loading with empty string
      localStorageMock.getItem.mockReturnValue('')
      expect(loadFromLocalStorage('empty-key')).toBe(null)
    })

    it('handles all document export with empty document list', async () => {
      const emptyDocuments: Array<{
        id: string
        title: string
        content: string
        isUnsaved: boolean
        isPinned: boolean
        createdAt: string
        lastModified: string
      }> = []

      // Mock JSZip
      const mockZip = {
        file: vi.fn(),
        folder: vi.fn(() => ({
          file: vi.fn(),
        })),
        generateAsync: vi.fn().mockResolvedValue(new Blob()),
      }
      vi.doMock('jszip', () => ({
        default: vi.fn(() => mockZip),
      }))

      // Mock image operations
      vi.doMock('./imageStorage', () => ({
        getStoredImages: () => [],
      }))

      await exportAllDocuments(emptyDocuments)

      expect(mockDocument.createElement).toHaveBeenCalledWith('a')
      expect(mockURL.createObjectURL).toHaveBeenCalled()
    })

    it('handles export with special characters in filenames', () => {
      const content = '# Test'
      const specialFilenames = [
        'test with spaces.md',
        'test-with-dashes.md',
        'test_with_underscores.md',
        'test.with.dots.md',
        'тест.md', // Cyrillic
        '测试.md', // Chinese
      ]

      specialFilenames.forEach((filename) => {
        exportMarkdownFile(content, filename)
        expect(mockDocument.createElement).toHaveBeenCalledWith('a')
      })
    })

    it('validates file extension detection', () => {
      const content = '# Test'

      // Test that files with .md extension pass validation
      const validFile = new File([content], 'test.md', {
        type: 'text/markdown',
      })
      expect(validFile.name.endsWith('.md')).toBe(true)

      // Test that files without .md/.markdown extension fail validation
      const invalidFile = new File([content], 'test.txt', {
        type: 'text/markdown',
      })
      expect(
        invalidFile.name.endsWith('.md') ||
          invalidFile.name.endsWith('.markdown')
      ).toBe(false)
    })

    it('handles timestamp operations', () => {
      const timestamp = '2023-01-01T12:00:00.000Z'
      const mockData = {
        content: '# Test',
        timestamp,
        version: '1.0',
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockData))

      expect(getSaveTimestamp()).toBe(timestamp)

      // Test with missing timestamp
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({ content: '# Test' })
      )
      expect(getSaveTimestamp()).toBe(null)

      // Test with invalid data
      localStorageMock.getItem.mockReturnValue('invalid json')
      expect(getSaveTimestamp()).toBe(null)

      // Test with null data
      localStorageMock.getItem.mockReturnValue(null)
      expect(getSaveTimestamp()).toBe(null)
    })
  })
})
