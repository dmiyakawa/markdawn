/**
 * Document management types for multi-tab functionality
 */

export interface Document {
  id: string
  title: string
  content: string
  isUnsaved: boolean
  isPinned: boolean
  createdAt: string
  lastModified: string
}

export interface DocumentState {
  documents: Document[]
  activeDocumentId: string | null
  nextDocumentNumber: number
}

export interface TabContextMenuOptions {
  x: number
  y: number
  documentId: string
  show: boolean
}
