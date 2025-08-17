/**
 * Tests for useDocuments composable
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useDocuments } from './useDocuments'
import type { Document } from '../types/document'

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

// Mock global functions
const mockAlert = vi.fn()
const mockConfirm = vi.fn()

describe('useDocuments', () => {
  // Helper to get a fresh document state for tests
  const getFreshDocuments = () => {
    const docs = useDocuments()
    // Clear all existing documents to start fresh
    const allDocs = docs.getAllDocuments()
    allDocs.forEach((doc) => {
      if (doc.isPinned) {
        docs.unpinDocument(doc.id)
      }
      docs.closeDocument(doc.id)
    })
    return docs
  }

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()
    mockLocalStorage.clear()

    // Mock global objects
    Object.defineProperty(global, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    })

    global.alert = mockAlert
    global.confirm = mockConfirm

    // Mock console.error to avoid noise in tests
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Basic Operations', () => {
    it('creates a new document with default title', () => {
      const docs = useDocuments()

      const newDoc = docs.createNewDocument()

      expect(newDoc).toMatchObject({
        id: expect.stringMatching(/^doc_\d+_/),
        title: expect.stringMatching(/^Document \d+$/),
        content: expect.stringContaining('Start writing your markdown here...'),
        isUnsaved: false,
        isPinned: false,
      })

      expect(docs.documents.value.some((d) => d.id === newDoc.id)).toBe(true)
      expect(docs.activeDocument.value?.id).toBe(newDoc.id)
    })

    it('creates a new document with custom title', () => {
      const docs = useDocuments()

      const newDoc = docs.createNewDocument('My Custom Document')

      expect(newDoc.title).toBe('My Custom Document')
      expect(newDoc.content).toBe(
        '# My Custom Document\n\nStart writing your markdown here...'
      )
    })

    it('switches to an existing document', () => {
      const docs = useDocuments()

      const doc1 = docs.createNewDocument('Document 1')
      docs.createNewDocument('Document 2')

      docs.switchToDocument(doc1.id)

      expect(docs.activeDocument.value?.id).toBe(doc1.id)
    })

    it('updates document content and marks as unsaved', () => {
      const docs = useDocuments()

      const doc = docs.createNewDocument()
      const newContent = '# Updated Content\n\nThis is new content.'

      docs.updateDocumentContent(doc.id, newContent)

      expect(docs.activeDocument.value?.content).toBe(newContent)
      expect(docs.activeDocument.value?.isUnsaved).toBe(true)
      expect(docs.hasUnsavedChanges.value).toBe(true)
    })

    it('updates document title', () => {
      const docs = useDocuments()

      const doc = docs.createNewDocument()

      docs.updateDocumentTitle(doc.id, 'New Title')

      expect(docs.activeDocument.value?.title).toBe('New Title')
      expect(docs.activeDocument.value?.isUnsaved).toBe(true)
    })

    it('marks document as saved', () => {
      const docs = useDocuments()

      const doc = docs.createNewDocument()
      docs.updateDocumentContent(doc.id, 'Some content')

      expect(docs.activeDocument.value?.isUnsaved).toBe(true)

      docs.markDocumentAsSaved(doc.id)

      expect(docs.activeDocument.value?.isUnsaved).toBe(false)
    })
  })

  describe('Document Closing', () => {
    it('closes unpinned document without confirmation', () => {
      const docs = useDocuments()

      const doc1 = docs.createNewDocument('Document 1')
      docs.createNewDocument('Document 2')

      const result = docs.closeDocument(doc1.id)

      expect(result).toBe(true)
      expect(docs.documents.value.find((d) => d.id === doc1.id)).toBeUndefined()
    })

    it('prevents closing pinned document', () => {
      const docs = useDocuments()

      const doc = docs.createNewDocument()
      docs.pinDocument(doc.id)

      const result = docs.closeDocument(doc.id)

      expect(result).toBe(false)
      expect(docs.documents.value.find((d) => d.id === doc.id)).toBeDefined()
      expect(mockAlert).toHaveBeenCalledWith(
        expect.stringContaining('is pinned and cannot be closed')
      )
    })

    it('closes document with unsaved changes when confirmed', () => {
      const docs = useDocuments()

      const doc = docs.createNewDocument()
      docs.updateDocumentContent(doc.id, 'Modified content')

      mockConfirm.mockReturnValue(true)

      const result = docs.closeDocument(doc.id)

      expect(result).toBe(true)
      expect(docs.documents.value.find((d) => d.id === doc.id)).toBeUndefined()
      expect(mockConfirm).toHaveBeenCalledWith(
        expect.stringContaining('has unsaved changes')
      )
    })

    it('does not close document with unsaved changes when not confirmed', () => {
      const docs = useDocuments()

      const doc = docs.createNewDocument()
      docs.updateDocumentContent(doc.id, 'Modified content')

      mockConfirm.mockReturnValue(false)

      const result = docs.closeDocument(doc.id)

      expect(result).toBe(false)
      expect(docs.documents.value.find((d) => d.id === doc.id)).toBeDefined()
    })
  })

  describe('Document Duplication', () => {
    it('duplicates an existing document', () => {
      const docs = useDocuments()

      const originalDoc = docs.createNewDocument('Original Document')
      docs.updateDocumentContent(originalDoc.id, '# Original Content')

      const duplicatedDoc = docs.duplicateDocument(originalDoc.id)

      expect(duplicatedDoc).toMatchObject({
        title: 'Original Document (Copy)',
        content: '# Original Content',
        isUnsaved: true,
        isPinned: false,
      })

      expect(duplicatedDoc!.id).not.toBe(originalDoc.id)
      expect(docs.activeDocumentId.value).toBe(duplicatedDoc!.id)
    })

    it('returns null when duplicating non-existent document', () => {
      const docs = useDocuments()

      const result = docs.duplicateDocument('non-existent-id')

      expect(result).toBeNull()
    })
  })

  describe('Document Pinning', () => {
    it('pins and unpins documents', () => {
      const docs = useDocuments()

      const doc = docs.createNewDocument()

      expect(doc.isPinned).toBe(false)

      const pinned = docs.pinDocument(doc.id)
      expect(pinned).toBe(true)
      expect(docs.activeDocument.value?.isPinned).toBe(true)

      const unpinned = docs.unpinDocument(doc.id)
      expect(unpinned).toBe(true)
      expect(docs.activeDocument.value?.isPinned).toBe(false)
    })

    it('toggles document pin status', () => {
      const docs = useDocuments()

      const doc = docs.createNewDocument()

      const firstToggle = docs.toggleDocumentPin(doc.id)
      expect(firstToggle).toBe(true)
      expect(docs.activeDocument.value?.isPinned).toBe(true)

      const secondToggle = docs.toggleDocumentPin(doc.id)
      expect(secondToggle).toBe(false)
      expect(docs.activeDocument.value?.isPinned).toBe(false)
    })

    it('computes pinned and unpinned documents correctly', () => {
      const docs = getFreshDocuments()

      const doc1 = docs.createNewDocument('Document 1')
      const doc2 = docs.createNewDocument('Document 2')
      const doc3 = docs.createNewDocument('Document 3')

      docs.pinDocument(doc1.id)
      docs.pinDocument(doc3.id)

      // Filter to only the documents we created for this test
      const testDocs = [doc1, doc2, doc3]
      const pinnedTestDocs = docs.pinnedDocuments.value.filter((d) =>
        testDocs.some((td) => td.id === d.id)
      )
      const unpinnedTestDocs = docs.unpinnedDocuments.value.filter((d) =>
        testDocs.some((td) => td.id === d.id)
      )

      expect(pinnedTestDocs).toHaveLength(2)
      expect(pinnedTestDocs.some((d) => d.id === doc1.id)).toBe(true)
      expect(pinnedTestDocs.some((d) => d.id === doc3.id)).toBe(true)

      expect(unpinnedTestDocs).toHaveLength(1)
      expect(unpinnedTestDocs[0].id).toBe(doc2.id)
    })
  })

  describe('Document Reordering', () => {
    it('reorders documents correctly', () => {
      const docs = getFreshDocuments()

      const doc1 = docs.createNewDocument('Document 1')
      const doc2 = docs.createNewDocument('Document 2')
      const doc3 = docs.createNewDocument('Document 3')

      const doc1Index = docs.getDocumentIndex(doc1.id)
      const doc3Index = docs.getDocumentIndex(doc3.id)

      // Move first document to last position
      docs.reorderDocuments(doc1Index, doc3Index)

      const newDoc1Index = docs.getDocumentIndex(doc1.id)
      const newDoc2Index = docs.getDocumentIndex(doc2.id)
      const newDoc3Index = docs.getDocumentIndex(doc3.id)

      // doc1 should now be after doc3
      expect(newDoc1Index).toBeGreaterThan(newDoc3Index)
      expect(newDoc2Index).toBeLessThan(newDoc3Index)
    })

    it('does not reorder with invalid indices', () => {
      const docs = getFreshDocuments()

      const doc1 = docs.createNewDocument('Document 1')
      const doc2 = docs.createNewDocument('Document 2')

      const originalDoc1Index = docs.getDocumentIndex(doc1.id)
      const originalDoc2Index = docs.getDocumentIndex(doc2.id)

      // Test various invalid scenarios
      docs.reorderDocuments(-1, 1)
      expect(docs.getDocumentIndex(doc1.id)).toBe(originalDoc1Index)
      expect(docs.getDocumentIndex(doc2.id)).toBe(originalDoc2Index)

      docs.reorderDocuments(originalDoc1Index, 999)
      expect(docs.getDocumentIndex(doc1.id)).toBe(originalDoc1Index)
      expect(docs.getDocumentIndex(doc2.id)).toBe(originalDoc2Index)

      docs.reorderDocuments(originalDoc1Index, originalDoc1Index)
      expect(docs.getDocumentIndex(doc1.id)).toBe(originalDoc1Index)
      expect(docs.getDocumentIndex(doc2.id)).toBe(originalDoc2Index)
    })

    it('returns correct document index', () => {
      const docs = getFreshDocuments()

      const doc1 = docs.createNewDocument('Document 1')
      const doc2 = docs.createNewDocument('Document 2')

      const doc1Index = docs.getDocumentIndex(doc1.id)
      const doc2Index = docs.getDocumentIndex(doc2.id)

      // Document indices should be valid and doc2 should come after doc1
      expect(doc1Index).toBeGreaterThanOrEqual(0)
      expect(doc2Index).toBeGreaterThanOrEqual(0)
      expect(doc2Index).toBeGreaterThan(doc1Index)
      expect(docs.getDocumentIndex('non-existent-id')).toBe(-1)
    })
  })

  describe('Error Handling', () => {
    it('handles non-existent document operations gracefully', () => {
      const docs = useDocuments()

      const doc = docs.createNewDocument()
      const originalContent = doc.content
      const originalTitle = doc.title

      // These should not affect the existing document
      docs.updateDocumentContent('non-existent-id', 'New content')
      docs.updateDocumentTitle('non-existent-id', 'New Title')
      docs.markDocumentAsSaved('non-existent-id')

      expect(docs.activeDocument.value?.content).toBe(originalContent)
      expect(docs.activeDocument.value?.title).toBe(originalTitle)

      expect(docs.closeDocument('non-existent-id')).toBe(false)
      expect(docs.pinDocument('non-existent-id')).toBe(false)
      expect(docs.unpinDocument('non-existent-id')).toBe(false)
      expect(docs.toggleDocumentPin('non-existent-id')).toBe(false)
    })

    it('handles empty and whitespace-only titles', () => {
      const docs = useDocuments()

      const doc = docs.createNewDocument()

      docs.updateDocumentTitle(doc.id, '')
      expect(docs.activeDocument.value?.title).toBe('Untitled Document')

      docs.updateDocumentTitle(doc.id, '   ')
      expect(docs.activeDocument.value?.title).toBe('Untitled Document')

      docs.updateDocumentTitle(doc.id, '  Valid Title  ')
      expect(docs.activeDocument.value?.title).toBe('Valid Title')
    })
  })

  describe('localStorage Integration', () => {
    it('saves and loads documents correctly', () => {
      const docs = useDocuments()

      const doc1 = docs.createNewDocument('Test Document')
      docs.updateDocumentContent(doc1.id, '# Test Content')
      docs.pinDocument(doc1.id)

      docs.saveToStorage()

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'markdown_editor_documents',
        expect.stringContaining(doc1.id)
      )
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'markdown_editor_active_document',
        doc1.id
      )
    })

    it('handles localStorage errors gracefully', () => {
      const docs = useDocuments()

      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })

      docs.createNewDocument()

      expect(console.error).toHaveBeenCalledWith(
        'Failed to save documents to storage:',
        expect.any(Error)
      )
    })

    it('loads documents from localStorage', () => {
      const storedDocuments: Document[] = [
        {
          id: 'stored-doc-1',
          title: 'Stored Document',
          content: '# Stored Content',
          isUnsaved: false,
          isPinned: true,
          createdAt: '2022-01-01T00:00:00.000Z',
          lastModified: '2022-01-01T00:00:00.000Z',
        },
      ]

      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'markdown_editor_documents') {
          return JSON.stringify(storedDocuments)
        }
        if (key === 'markdown_editor_active_document') {
          return 'stored-doc-1'
        }
        return null
      })

      const docs = useDocuments()
      docs.loadFromStorage()

      expect(docs.documents.value).toHaveLength(1)
      expect(docs.documents.value[0]).toMatchObject(storedDocuments[0])
      expect(docs.activeDocumentId.value).toBe('stored-doc-1')
    })

    it('handles backward compatibility for documents without isPinned', () => {
      const storedDocuments = [
        {
          id: 'legacy-doc',
          title: 'Legacy Document',
          content: '# Legacy',
          isUnsaved: false,
          createdAt: '2022-01-01T00:00:00.000Z',
          lastModified: '2022-01-01T00:00:00.000Z',
          // Missing isPinned property
        },
      ]

      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'markdown_editor_documents') {
          return JSON.stringify(storedDocuments)
        }
        return null
      })

      const docs = useDocuments()
      docs.loadFromStorage()

      expect(docs.documents.value[0].isPinned).toBe(false)
    })

    it('handles localStorage load errors gracefully', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Storage access denied')
      })

      const docs = useDocuments()
      docs.loadFromStorage()

      expect(console.error).toHaveBeenCalledWith(
        'Failed to load documents from storage:',
        expect.any(Error)
      )
    })
  })

  describe('Document Initialization', () => {
    it('creates welcome document when no documents exist', () => {
      const docs = getFreshDocuments()

      docs.initializeDocuments()

      expect(docs.documents.value).toHaveLength(1)
      expect(docs.documents.value[0].title).toBe('Welcome to Markdown Editor')
      expect(docs.documents.value[0].content).toContain(
        '# Welcome to Markdown Editor'
      )
      expect(docs.documents.value[0].isUnsaved).toBe(false)
      expect(docs.documents.value[0].isPinned).toBe(false)
    })

    it('does not create welcome document when documents already exist', () => {
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'markdown_editor_documents') {
          return JSON.stringify([
            {
              id: 'existing-doc',
              title: 'Existing Document',
              content: '# Existing',
              isUnsaved: false,
              isPinned: false,
              createdAt: '2022-01-01T00:00:00.000Z',
              lastModified: '2022-01-01T00:00:00.000Z',
            },
          ])
        }
        return null
      })

      const docs = getFreshDocuments()
      docs.initializeDocuments()

      // After loading from storage, should have 1 existing document
      expect(docs.documents.value.length).toBeGreaterThanOrEqual(1)
      expect(
        docs.documents.value.some((d) => d.title === 'Existing Document')
      ).toBe(true)
    })
  })

  describe('Computed Properties', () => {
    it('computes document count correctly', () => {
      const docs = getFreshDocuments()

      expect(docs.documentCount.value).toBe(0)

      docs.createNewDocument()
      expect(docs.documentCount.value).toBe(1)

      docs.createNewDocument()
      expect(docs.documentCount.value).toBe(2)
    })

    it('computes hasUnsavedChanges correctly', () => {
      const docs = getFreshDocuments()

      expect(docs.hasUnsavedChanges.value).toBe(false)

      const doc = docs.createNewDocument()
      expect(docs.hasUnsavedChanges.value).toBe(false)

      docs.updateDocumentContent(doc.id, 'New content')
      expect(docs.hasUnsavedChanges.value).toBe(true)

      docs.markDocumentAsSaved(doc.id)
      expect(docs.hasUnsavedChanges.value).toBe(false)
    })

    it('returns all documents for export', () => {
      const docs = getFreshDocuments()

      const doc1 = docs.createNewDocument('Document 1')
      const doc2 = docs.createNewDocument('Document 2')

      const allDocs = docs.getAllDocuments()

      expect(allDocs).toHaveLength(2)
      expect(allDocs.some((d) => d.id === doc1.id)).toBe(true)
      expect(allDocs.some((d) => d.id === doc2.id)).toBe(true)

      // Should return a copy, not the original array
      expect(allDocs).not.toBe(docs.documents.value)
    })
  })
})
