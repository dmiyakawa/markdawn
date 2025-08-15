/**
 * Tests for imageProcessing.ts focusing on statement coverage
 */

import { describe, it, expect } from 'vitest'
import { isValidImageFile } from './imageProcessing'

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
      const file2 = new File([''], 'test.jpg', { type: undefined as any })
      expect(isValidImageFile(file2)).toBe(false)
    })

    it('validates specific supported types', () => {
      // Test all four supported types explicitly
      expect(isValidImageFile(new File([''], 'test.jpg', { type: 'image/jpeg' }))).toBe(true)
      expect(isValidImageFile(new File([''], 'test.png', { type: 'image/png' }))).toBe(true)
      expect(isValidImageFile(new File([''], 'test.webp', { type: 'image/webp' }))).toBe(true)
      expect(isValidImageFile(new File([''], 'test.gif', { type: 'image/gif' }))).toBe(true)
    })

    it('validates against array of supported types', () => {
      // This tests the internal array lookup logic
      const supportedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      
      supportedTypes.forEach(type => {
        const file = new File([''], 'test', { type })
        expect(isValidImageFile(file)).toBe(true)
      })

      // Test types not in the array
      const unsupportedTypes = ['image/bmp', 'image/tiff', 'image/svg+xml', 'text/plain']
      
      unsupportedTypes.forEach(type => {
        const file = new File([''], 'test', { type })
        expect(isValidImageFile(file)).toBe(false)
      })
    })
  })
})