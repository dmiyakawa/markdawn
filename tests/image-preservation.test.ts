import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  convertMarkdownToHtml,
  convertHtmlToMarkdown,
} from '../src/utils/markdown'
import {
  saveImageToStorage,
  type StoredImage,
} from '../src/utils/imageOperations'

describe('Image Reference Preservation', () => {
  // Mock localStorage for tests
  const mockLocalStorage = {
    data: {} as Record<string, string>,
    getItem: vi.fn((key: string) => mockLocalStorage.data[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      mockLocalStorage.data[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete mockLocalStorage.data[key]
    }),
    clear: vi.fn(() => {
      mockLocalStorage.data = {}
    }),
  }

  beforeEach(() => {
    // Clear localStorage mock
    mockLocalStorage.clear()
    vi.clearAllMocks()

    // Mock global localStorage
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    })
  })

  it('preserves stored image references during markdown to HTML to markdown conversion', () => {
    // Create a mock stored image
    const mockImage: StoredImage = {
      id: 'test-image-123',
      name: 'test.jpg',
      data: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA+BQAB/9k=',
      size: 500,
      width: 100,
      height: 100,
      type: 'image/jpeg',
      uploadedAt: new Date().toISOString(),
    }

    // Save the image to storage
    saveImageToStorage(mockImage)

    // Create markdown with stored image reference
    const originalMarkdown = `# Test Document

This is a test with an image:

![Test Image](stored:test-image-123)

End of document.`

    // Convert markdown to HTML
    const html = convertMarkdownToHtml(originalMarkdown)
    console.log('Generated HTML:', html)

    // Verify HTML contains the image with proper attributes
    expect(html).toContain('data-stored-id="test-image-123"')
    expect(html).toContain('class="stored-image"')
    expect(html).toContain('alt="Test Image"')

    // Convert HTML back to markdown
    const convertedMarkdown = convertHtmlToMarkdown(html)
    console.log('Converted Markdown:', convertedMarkdown)

    // Verify that the stored image reference is preserved
    expect(convertedMarkdown).toContain('![Test Image](stored:test-image-123)')
    expect(convertedMarkdown).not.toContain('data:image/jpeg;base64')
  })

  it('handles multiple stored images correctly', () => {
    // Create multiple mock stored images
    const image1: StoredImage = {
      id: 'image-1',
      name: 'first.png',
      data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      size: 200,
      width: 50,
      height: 50,
      type: 'image/png',
      uploadedAt: new Date().toISOString(),
    }

    const image2: StoredImage = {
      id: 'image-2',
      name: 'second.jpg',
      data: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA+BQAB/9k=',
      size: 300,
      width: 75,
      height: 75,
      type: 'image/jpeg',
      uploadedAt: new Date().toISOString(),
    }

    // Save both images
    saveImageToStorage(image1)
    saveImageToStorage(image2)

    const markdown = `# Multiple Images

First image: ![First](stored:image-1)

Second image: ![Second](stored:image-2)`

    // Convert to HTML and back
    const html = convertMarkdownToHtml(markdown)
    const convertedMarkdown = convertHtmlToMarkdown(html)

    // Verify both images are preserved
    expect(convertedMarkdown).toContain('![First](stored:image-1)')
    expect(convertedMarkdown).toContain('![Second](stored:image-2)')
    expect(convertedMarkdown).not.toContain('data:image/')
  })

  it('handles non-stored images correctly', () => {
    const markdown = `# Regular Images

Regular image: ![External](https://example.com/image.jpg)

Data URL: ![Data](data:image/png;base64,test123)`

    const html = convertMarkdownToHtml(markdown)
    const convertedMarkdown = convertHtmlToMarkdown(html)

    // Regular images should remain as-is
    expect(convertedMarkdown).toContain(
      '![External](https://example.com/image.jpg)'
    )
    expect(convertedMarkdown).toContain(
      '![Data](data:image/png;base64,test123)'
    )
  })
})
