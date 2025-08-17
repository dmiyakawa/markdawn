/**
 * Tests for imageProcessing.ts focusing on statement coverage
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  isValidImageFile,
  resizeImage,
  getImageDimensions,
  processImageForStorage,
} from './imageProcessing'

// Mock the imageStorage module
vi.mock('./imageStorage', () => ({
  generateImageId: vi.fn(() => 'mock-image-id'),
}))

describe('imageProcessing', () => {
  describe('isValidImageFile', () => {
    it('accepts JPEG files', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' })
      expect(isValidImageFile(file)).toBe(true)
    })

    it('accepts PNG files', () => {
      const file = new File([''], 'test.png', { type: 'image/png' })
      expect(isValidImageFile(file)).toBe(true)
    })

    it('accepts WebP files', () => {
      const file = new File([''], 'test.webp', { type: 'image/webp' })
      expect(isValidImageFile(file)).toBe(true)
    })

    it('accepts GIF files', () => {
      const file = new File([''], 'test.gif', { type: 'image/gif' })
      expect(isValidImageFile(file)).toBe(true)
    })

    it('rejects non-image files', () => {
      const file = new File([''], 'test.txt', { type: 'text/plain' })
      expect(isValidImageFile(file)).toBe(false)
    })

    it('rejects unsupported image formats', () => {
      const file = new File([''], 'test.bmp', { type: 'image/bmp' })
      expect(isValidImageFile(file)).toBe(false)
    })

    it('validates supported image types comprehensively', () => {
      const testCases = [
        { type: 'image/jpeg', expected: true },
        { type: 'image/png', expected: true },
        { type: 'image/webp', expected: true },
        { type: 'image/gif', expected: true },
        { type: 'image/bmp', expected: false },
        { type: 'image/tiff', expected: false },
        { type: 'image/svg+xml', expected: false },
        { type: 'text/plain', expected: false },
        { type: 'application/pdf', expected: false },
        { type: '', expected: false },
        { type: 'image/x-icon', expected: false },
        { type: 'image/avif', expected: false },
      ]

      testCases.forEach(({ type, expected }) => {
        const file = new File([''], 'test', { type })
        expect(isValidImageFile(file)).toBe(expected)
      })
    })

    it('handles case variations in MIME types', () => {
      // Test edge cases - the function actually accepts any case, so let's test correctly
      const testCases = [
        { type: 'image/jpeg', expected: true },
        { type: 'image/png', expected: true },
        { type: 'image/JPG', expected: false }, // Wrong MIME type
        { type: 'application/json', expected: false },
      ]

      testCases.forEach(({ type, expected }) => {
        const file = new File([''], 'test', { type })
        expect(isValidImageFile(file)).toBe(expected)
      })
    })

    it('handles empty and null MIME types', () => {
      const file1 = new File([''], 'test.jpg', { type: '' })
      expect(isValidImageFile(file1)).toBe(false)

      // Test with undefined type (though File constructor requires a type)
      const file2 = new File([''], 'test.jpg', {
        type: undefined as unknown as string,
      })
      expect(isValidImageFile(file2)).toBe(false)
    })

    it('validates specific supported types', () => {
      // Test all four supported types explicitly
      expect(
        isValidImageFile(new File([''], 'test.jpg', { type: 'image/jpeg' }))
      ).toBe(true)
      expect(
        isValidImageFile(new File([''], 'test.png', { type: 'image/png' }))
      ).toBe(true)
      expect(
        isValidImageFile(new File([''], 'test.webp', { type: 'image/webp' }))
      ).toBe(true)
      expect(
        isValidImageFile(new File([''], 'test.gif', { type: 'image/gif' }))
      ).toBe(true)
    })

    it('validates against array of supported types', () => {
      // This tests the internal array lookup logic
      const supportedTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
      ]

      supportedTypes.forEach((type) => {
        const file = new File([''], 'test', { type })
        expect(isValidImageFile(file)).toBe(true)
      })

      // Test types not in the array
      const unsupportedTypes = [
        'image/bmp',
        'image/tiff',
        'image/svg+xml',
        'text/plain',
      ]

      unsupportedTypes.forEach((type) => {
        const file = new File([''], 'test', { type })
        expect(isValidImageFile(file)).toBe(false)
      })
    })
  })

  // Add comprehensive tests for other functions
  let mockCanvas: HTMLCanvasElement
  let mockContext: CanvasRenderingContext2D
  let mockImage: HTMLImageElement
  let mockFileReader: FileReader

  beforeEach(() => {
    // Mock Canvas and CanvasRenderingContext2D
    mockContext = {
      drawImage: vi.fn(),
    }

    mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => mockContext),
      toDataURL: vi.fn(() => 'data:image/jpeg;base64,mockbase64data'),
    }

    // Mock Image
    mockImage = {
      onload: null,
      onerror: null,
      src: '',
      naturalWidth: 800,
      naturalHeight: 600,
      width: 800,
      height: 600,
    }

    // Mock FileReader
    mockFileReader = {
      onload: null,
      onerror: null,
      result: 'data:image/jpeg;base64,mockdata',
      readAsDataURL: vi.fn(),
    }

    // Mock global constructors
    global.Image = vi.fn(() => mockImage) as unknown as typeof Image
    global.FileReader = vi.fn(
      () => mockFileReader
    ) as unknown as typeof FileReader

    // Mock document.createElement
    const originalCreateElement = document.createElement
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'canvas') {
        return mockCanvas
      }
      return originalCreateElement.call(document, tagName)
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('resizeImage', () => {
    it('resizes image with default options', async () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' })

      // Start the resize operation
      const resizePromise = resizeImage(file)

      // Simulate FileReader success
      mockFileReader.onload({
        target: { result: 'data:image/jpeg;base64,test' },
      })

      // Simulate Image load success
      mockImage.onload()

      const result = await resizePromise

      expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(file)
      expect(mockCanvas.getContext).toHaveBeenCalledWith('2d')
      expect(mockContext.drawImage).toHaveBeenCalled()
      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/jpeg', 0.8)
      expect(result).toBe('data:image/jpeg;base64,mockbase64data')
    })

    it('resizes image with custom options', async () => {
      const file = new File([''], 'test.png', { type: 'image/png' })
      const options = {
        maxWidth: 500,
        maxHeight: 400,
        quality: 0.9,
        format: 'png' as const,
      }

      const resizePromise = resizeImage(file, options)

      // Simulate FileReader and Image success
      mockFileReader.onload({
        target: { result: 'data:image/png;base64,test' },
      })
      mockImage.onload()

      const result = await resizePromise

      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/png', 0.9)
      expect(result).toBe('data:image/jpeg;base64,mockbase64data')
    })

    it('calculates correct dimensions when width exceeds max', async () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' })

      // Set up image with large width
      mockImage.width = 2000
      mockImage.height = 1000

      const resizePromise = resizeImage(file, { maxWidth: 800, maxHeight: 600 })

      mockFileReader.onload({
        target: { result: 'data:image/jpeg;base64,test' },
      })
      mockImage.onload()

      await resizePromise

      // Width should be limited to 800, height should be proportionally scaled
      expect(mockCanvas.width).toBe(800)
      expect(mockCanvas.height).toBe(400)
    })

    it('calculates correct dimensions when height exceeds max', async () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' })

      // Set up image with large height
      mockImage.width = 600
      mockImage.height = 1200

      const resizePromise = resizeImage(file, { maxWidth: 800, maxHeight: 400 })

      mockFileReader.onload({
        target: { result: 'data:image/jpeg;base64,test' },
      })
      mockImage.onload()

      await resizePromise

      // Height should be limited to 400, width should be proportionally scaled
      expect(mockCanvas.width).toBe(200)
      expect(mockCanvas.height).toBe(400)
    })

    it('rejects when canvas context is not available', async () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' })

      // Mock canvas.getContext to return null
      mockCanvas.getContext.mockReturnValue(null)

      await expect(resizeImage(file)).rejects.toThrow(
        'Canvas context not available'
      )
    })

    it('rejects when image fails to load', async () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' })

      const resizePromise = resizeImage(file)

      // Simulate FileReader success but Image error
      mockFileReader.onload({
        target: { result: 'data:image/jpeg;base64,test' },
      })
      mockImage.onerror()

      await expect(resizePromise).rejects.toThrow(
        'Failed to load image for resizing'
      )
    })

    it('rejects when FileReader fails', async () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' })

      const resizePromise = resizeImage(file)

      // Simulate FileReader error
      mockFileReader.onerror()

      await expect(resizePromise).rejects.toThrow('Failed to read image file')
    })
  })

  describe('getImageDimensions', () => {
    it('returns correct dimensions for valid image', async () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' })

      const dimensionsPromise = getImageDimensions(file)

      // Simulate FileReader and Image success
      mockFileReader.onload({
        target: { result: 'data:image/jpeg;base64,test' },
      })
      mockImage.onload()

      const dimensions = await dimensionsPromise

      expect(dimensions).toEqual({
        width: 800,
        height: 600,
      })
      expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(file)
    })

    it('rejects when image fails to load', async () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' })

      const dimensionsPromise = getImageDimensions(file)

      // Simulate FileReader success but Image error
      mockFileReader.onload({
        target: { result: 'data:image/jpeg;base64,test' },
      })
      mockImage.onerror()

      await expect(dimensionsPromise).rejects.toThrow(
        'Failed to load image to get dimensions'
      )
    })

    it('rejects when FileReader fails', async () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' })

      const dimensionsPromise = getImageDimensions(file)

      // Simulate FileReader error
      mockFileReader.onerror()

      await expect(dimensionsPromise).rejects.toThrow(
        'Failed to read image file'
      )
    })
  })

  describe('processImageForStorage', () => {
    it('rejects unsupported file format', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })

      await expect(processImageForStorage(file)).rejects.toThrow(
        'Unsupported image format: text/plain. Supported formats: JPEG, PNG, WebP, GIF'
      )
    })

    it('rejects file that is too large', async () => {
      // Create a large file (> 10MB)
      const largeContent = new Array(11 * 1024 * 1024).fill('a').join('')
      const file = new File([largeContent], 'large.jpg', { type: 'image/jpeg' })

      await expect(processImageForStorage(file)).rejects.toThrow(
        'Image file too large: 11MB. Maximum allowed: 10MB'
      )
    })
  })
})
