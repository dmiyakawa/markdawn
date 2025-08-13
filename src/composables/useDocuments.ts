/**
 * Composable for managing multiple documents with tabs
 */

import { ref, computed } from 'vue'
import type { Document, DocumentState } from '../types/document'

const DOCUMENTS_STORAGE_KEY = 'markdown_editor_documents'
const ACTIVE_DOCUMENT_KEY = 'markdown_editor_active_document'

// Global state for document management
const documentState = ref<DocumentState>({
  documents: [],
  activeDocumentId: null,
  nextDocumentNumber: 1,
})

export function useDocuments() {
  // Computed properties
  const activeDocument = computed(() => {
    if (!documentState.value.activeDocumentId) return null
    return (
      documentState.value.documents.find(
        (doc) => doc.id === documentState.value.activeDocumentId
      ) || null
    )
  })

  const hasUnsavedChanges = computed(() => {
    return documentState.value.documents.some((doc) => doc.isUnsaved)
  })

  const documentCount = computed(() => {
    return documentState.value.documents.length
  })

  // Generate unique document ID
  const generateDocumentId = (): string => {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Create new document
  const createNewDocument = (title?: string): Document => {
    const now = new Date().toISOString()
    const docNumber = documentState.value.nextDocumentNumber

    const newDocument: Document = {
      id: generateDocumentId(),
      title: title || `Document ${docNumber}`,
      content: `# ${title || `Document ${docNumber}`}

Start writing your markdown here...`,
      isUnsaved: false,
      createdAt: now,
      lastModified: now,
    }

    documentState.value.documents.push(newDocument)
    documentState.value.nextDocumentNumber += 1
    documentState.value.activeDocumentId = newDocument.id

    saveToStorage()
    return newDocument
  }

  // Switch to document
  const switchToDocument = (documentId: string): void => {
    const document = documentState.value.documents.find(
      (doc) => doc.id === documentId
    )
    if (document) {
      documentState.value.activeDocumentId = documentId
      saveToStorage()
    }
  }

  // Update document content
  const updateDocumentContent = (documentId: string, content: string): void => {
    const document = documentState.value.documents.find(
      (doc) => doc.id === documentId
    )
    if (document) {
      document.content = content
      document.lastModified = new Date().toISOString()
      document.isUnsaved = true
      saveToStorage()
    }
  }

  // Update document title
  const updateDocumentTitle = (documentId: string, title: string): void => {
    const document = documentState.value.documents.find(
      (doc) => doc.id === documentId
    )
    if (document) {
      document.title = title.trim() || 'Untitled Document'
      document.lastModified = new Date().toISOString()
      document.isUnsaved = true
      saveToStorage()
    }
  }

  // Mark document as saved
  const markDocumentAsSaved = (documentId: string): void => {
    const document = documentState.value.documents.find(
      (doc) => doc.id === documentId
    )
    if (document) {
      document.isUnsaved = false
      saveToStorage()
    }
  }

  // Close document
  const closeDocument = (documentId: string): boolean => {
    const documentIndex = documentState.value.documents.findIndex(
      (doc) => doc.id === documentId
    )
    if (documentIndex === -1) return false

    const document = documentState.value.documents[documentIndex]

    // Check for unsaved changes
    if (document.isUnsaved) {
      const confirmed = confirm(
        `"${document.title}" has unsaved changes. Are you sure you want to close it?`
      )
      if (!confirmed) return false
    }

    // Remove document
    documentState.value.documents.splice(documentIndex, 1)

    // Update active document if necessary
    if (documentState.value.activeDocumentId === documentId) {
      if (documentState.value.documents.length > 0) {
        // Switch to the next available document
        const nextIndex = Math.min(
          documentIndex,
          documentState.value.documents.length - 1
        )
        documentState.value.activeDocumentId =
          documentState.value.documents[nextIndex]?.id || null
      } else {
        documentState.value.activeDocumentId = null
      }
    }

    saveToStorage()
    return true
  }

  // Duplicate document
  const duplicateDocument = (documentId: string): Document | null => {
    const originalDoc = documentState.value.documents.find(
      (doc) => doc.id === documentId
    )
    if (!originalDoc) return null

    const now = new Date().toISOString()
    const duplicatedDoc: Document = {
      id: generateDocumentId(),
      title: `${originalDoc.title} (Copy)`,
      content: originalDoc.content,
      isUnsaved: true,
      createdAt: now,
      lastModified: now,
    }

    documentState.value.documents.push(duplicatedDoc)
    documentState.value.activeDocumentId = duplicatedDoc.id

    saveToStorage()
    return duplicatedDoc
  }

  // Get all documents for export
  const getAllDocuments = (): Document[] => {
    return [...documentState.value.documents]
  }

  // Save to localStorage
  const saveToStorage = (): void => {
    try {
      localStorage.setItem(
        DOCUMENTS_STORAGE_KEY,
        JSON.stringify(documentState.value.documents)
      )
      if (documentState.value.activeDocumentId) {
        localStorage.setItem(
          ACTIVE_DOCUMENT_KEY,
          documentState.value.activeDocumentId
        )
      } else {
        localStorage.removeItem(ACTIVE_DOCUMENT_KEY)
      }
    } catch (error) {
      console.error('Failed to save documents to storage:', error)
    }
  }

  // Load from localStorage
  const loadFromStorage = (): void => {
    try {
      const stored = localStorage.getItem(DOCUMENTS_STORAGE_KEY)
      const activeId = localStorage.getItem(ACTIVE_DOCUMENT_KEY)

      if (stored) {
        const documents: Document[] = JSON.parse(stored)
        documentState.value.documents = documents

        // Calculate next document number
        const maxNumber = documents.reduce((max, doc) => {
          const match = doc.title.match(/^Document (\d+)$/)
          if (match) {
            return Math.max(max, parseInt(match[1], 10))
          }
          return max
        }, 0)
        documentState.value.nextDocumentNumber = maxNumber + 1
      }

      if (
        activeId &&
        documentState.value.documents.find((doc) => doc.id === activeId)
      ) {
        documentState.value.activeDocumentId = activeId
      } else if (documentState.value.documents.length > 0) {
        documentState.value.activeDocumentId =
          documentState.value.documents[0].id
      }
    } catch (error) {
      console.error('Failed to load documents from storage:', error)
    }
  }

  // Initialize with default document if none exist
  const initializeDocuments = (): void => {
    loadFromStorage()

    if (documentState.value.documents.length === 0) {
      createNewDocument('Welcome to Markdown Editor')
      const welcomeDoc = activeDocument.value
      if (welcomeDoc) {
        welcomeDoc.content = `# Welcome to Markdown Editor

Start editing your **markdown** content here! This editor supports:

## Features
- **Bold text** and *italic text*
- [Links](https://example.com)
- \`inline code\`
- Lists and more!

### Code Example
\`\`\`javascript
function hello() {
  console.log("Hello, world!");
}
\`\`\`

### Task List
- [x] Set up markdown editor
- [ ] Add more features
- [ ] Deploy the app

> **Tip**: Use tabs to work with multiple documents simultaneously!`
        welcomeDoc.isUnsaved = false
        saveToStorage()
      }
    }
  }

  return {
    // State
    documents: computed(() => documentState.value.documents),
    activeDocument,
    activeDocumentId: computed(() => documentState.value.activeDocumentId),
    hasUnsavedChanges,
    documentCount,

    // Actions
    createNewDocument,
    switchToDocument,
    updateDocumentContent,
    updateDocumentTitle,
    markDocumentAsSaved,
    closeDocument,
    duplicateDocument,
    getAllDocuments,
    initializeDocuments,
    saveToStorage,
    loadFromStorage,
  }
}
