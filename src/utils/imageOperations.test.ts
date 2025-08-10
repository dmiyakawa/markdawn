import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  generateImageId,
  isValidImageFile,
  getStoredImages,
  saveImageToStorage,
  getStoredImage,
  deleteStoredImage,
  getImagesStorageSize,
  clearImageStorage,
  generateImageMarkdown,
  type StoredImage,
} from './imageOperations'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

vi.stubGlobal('localStorage', localStorageMock)

// Mock canvas and image elements for testing
const mockCanvas = {
  width: 0,
  height: 0,
  getContext: vi.fn(() => ({
    drawImage: vi.fn(),
  })),
  toDataURL: vi.fn(() => 'data:image/jpeg;base64,mockbase64data'),
}

const mockImage = {
  width: 800,
  height: 600,
  onload: null as ((this: GlobalEventHandlers, ev: Event) => void) | null,
  onerror: null as ((this: GlobalEventHandlers, ev: ErrorEvent) => void) | null,
  src: '',
}

vi.stubGlobal(
  'Image',
  vi.fn(() => mockImage)
)
vi.stubGlobal('document', {
  createElement: vi.fn((tag: string) => {
    if (tag === 'canvas') return mockCanvas
    return {}
  }),
})

// Mock URL
vi.stubGlobal('URL', {
  createObjectURL: vi.fn(() => 'mock-object-url'),
  revokeObjectURL: vi.fn(),
})

describe('imageOperations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  describe('generateImageId', () => {
    it('generates unique IDs', () => {
      const id1 = generateImageId()
      const id2 = generateImageId()

      expect(id1).toMatch(/^img_\d+_[a-z0-9]+$/)
      expect(id2).toMatch(/^img_\d+_[a-z0-9]+$/)
      expect(id1).not.toBe(id2)
    })
  })

  describe('isValidImageFile', () => {
    it('validates supported image formats', () => {
      const jpegFile = new File([''], 'test.jpg', { type: 'image/jpeg' })
      const pngFile = new File([''], 'test.png', { type: 'image/png' })
      const webpFile = new File([''], 'test.webp', { type: 'image/webp' })
      const gifFile = new File([''], 'test.gif', { type: 'image/gif' })

      expect(isValidImageFile(jpegFile)).toBe(true)
      expect(isValidImageFile(pngFile)).toBe(true)
      expect(isValidImageFile(webpFile)).toBe(true)
      expect(isValidImageFile(gifFile)).toBe(true)
    })

    it('rejects unsupported formats', () => {
      const textFile = new File([''], 'test.txt', { type: 'text/plain' })
      const pdfFile = new File([''], 'test.pdf', { type: 'application/pdf' })

      expect(isValidImageFile(textFile)).toBe(false)
      expect(isValidImageFile(pdfFile)).toBe(false)
    })
  })

  describe('localStorage operations', () => {
    const mockImage: StoredImage = {
      id: 'test-id',
      name: 'test.jpg',
      data: 'data:image/jpeg;base64,mockdata',
      size: 1024,
      width: 800,
      height: 600,
      type: 'image/jpeg',
      uploadedAt: '2024-01-01T00:00:00.000Z',
    }

    describe('getStoredImages', () => {
      it('returns empty array when no images stored', () => {
        localStorageMock.getItem.mockReturnValue(null)
        expect(getStoredImages()).toEqual([])
      })

      it('returns parsed images from localStorage', () => {
        const images = [mockImage]
        localStorageMock.getItem.mockReturnValue(JSON.stringify(images))
        expect(getStoredImages()).toEqual(images)
      })

      it('handles JSON parse errors gracefully', () => {
        localStorageMock.getItem.mockReturnValue('invalid-json')
        expect(getStoredImages()).toEqual([])
      })
    })

    describe('saveImageToStorage', () => {
      it('saves image to localStorage successfully', () => {
        localStorageMock.getItem.mockReturnValue('[]')

        const result = saveImageToStorage(mockImage)

        expect(result).toBe(true)
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'markdown_editor_images',
          JSON.stringify([mockImage])
        )
      })

      it('appends to existing images', () => {
        const existingImage = { ...mockImage, id: 'existing-id' }
        localStorageMock.getItem.mockReturnValue(
          JSON.stringify([existingImage])
        )

        const result = saveImageToStorage(mockImage)

        expect(result).toBe(true)
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'markdown_editor_images',
          JSON.stringify([existingImage, mockImage])
        )
      })

      it('handles storage errors gracefully', () => {
        localStorageMock.getItem.mockReturnValue('[]')
        localStorageMock.setItem.mockImplementation(() => {
          throw new Error('Storage full')
        })

        const result = saveImageToStorage(mockImage)
        expect(result).toBe(false)
      })
    })

    describe('getStoredImage', () => {
      it('returns image by ID', () => {
        localStorageMock.getItem.mockReturnValue(JSON.stringify([mockImage]))

        const result = getStoredImage('test-id')
        expect(result).toEqual(mockImage)
      })

      it('returns null for non-existent ID', () => {
        localStorageMock.getItem.mockReturnValue(JSON.stringify([mockImage]))

        const result = getStoredImage('non-existent')
        expect(result).toBeNull()
      })
    })

    describe('deleteStoredImage', () => {
      it('removes image by ID', () => {
        const images = [mockImage, { ...mockImage, id: 'keep-me' }]
        localStorageMock.getItem.mockReturnValue(JSON.stringify(images))
        // Reset setItem mock to not throw error
        localStorageMock.setItem.mockImplementation(() => {})

        const result = deleteStoredImage('test-id')

        expect(result).toBe(true)
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'markdown_editor_images',
          JSON.stringify([{ ...mockImage, id: 'keep-me' }])
        )
      })

      it('handles deletion errors gracefully', () => {
        localStorageMock.getItem.mockReturnValue(JSON.stringify([mockImage]))
        localStorageMock.setItem.mockImplementation(() => {
          throw new Error('Storage error')
        })

        const result = deleteStoredImage('test-id')
        expect(result).toBe(false)
      })
    })

    describe('getImagesStorageSize', () => {
      it('calculates total storage size', () => {
        const images = [
          { ...mockImage, size: 1024 },
          { ...mockImage, id: 'img2', size: 2048 },
        ]
        localStorageMock.getItem.mockReturnValue(JSON.stringify(images))

        expect(getImagesStorageSize()).toBe(3072)
      })

      it('returns 0 for no images', () => {
        localStorageMock.getItem.mockReturnValue('[]')
        expect(getImagesStorageSize()).toBe(0)
      })
    })

    describe('clearImageStorage', () => {
      it('clears all stored images', () => {
        const result = clearImageStorage()

        expect(result).toBe(true)
        expect(localStorageMock.removeItem).toHaveBeenCalledWith(
          'markdown_editor_images'
        )
      })

      it('handles clear errors gracefully', () => {
        localStorageMock.removeItem.mockImplementation(() => {
          throw new Error('Clear failed')
        })

        const result = clearImageStorage()
        expect(result).toBe(false)
      })
    })
  })

  describe('generateImageMarkdown', () => {
    const mockImage: StoredImage = {
      id: 'test-id',
      name: 'my-photo.jpg',
      data: 'data:image/jpeg;base64,mockdata',
      size: 1024,
      width: 800,
      height: 600,
      type: 'image/jpeg',
      uploadedAt: '2024-01-01T00:00:00.000Z',
    }

    it('generates markdown with custom alt text', () => {
      const result = generateImageMarkdown(mockImage, 'Custom Alt Text')
      expect(result).toBe('![Custom Alt Text](stored:test-id)')
    })

    it('uses filename as alt text when not provided', () => {
      const result = generateImageMarkdown(mockImage)
      expect(result).toBe('![my-photo](stored:test-id)')
    })

    it('handles filenames without extensions', () => {
      const imageNoExt = { ...mockImage, name: 'photo' }
      const result = generateImageMarkdown(imageNoExt)
      expect(result).toBe('![photo](stored:test-id)')
    })
  })
})
