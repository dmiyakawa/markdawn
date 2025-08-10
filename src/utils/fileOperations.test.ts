import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  importMarkdownFile,
  exportMarkdownFile,
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
})
