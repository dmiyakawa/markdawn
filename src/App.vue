<template>
  <div class="min-h-screen bg-gray-100">
    <header id="menu-bar" class="bg-white shadow-sm border-b">
      <div class="px-4 sm:px-6 lg:px-8">
        <div class="flex items-center py-2">
          <!-- Menu Bar Controls -->
          <div class="flex flex-wrap items-center gap-x-6 gap-y-2">
            <!-- File Menu -->
            <div class="flex items-center space-x-1">
              <span
                class="text-xs font-medium text-gray-600 mr-1 sm:mr-2 hidden sm:inline"
                >File</span
              >
              <input
                ref="fileInput"
                type="file"
                accept=".md,.markdown"
                @change="handleFileImport"
                class="hidden"
              />
              <button
                @click="newDocument"
                class="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                title="New document"
              >
                New
              </button>
              <button
                @click="triggerFileImport"
                class="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                title="Import markdown file"
              >
                Import
              </button>
              <button
                @click="saveDocument"
                class="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                title="Save to browser storage"
              >
                Save
              </button>
              <button
                @click="loadDocument"
                class="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                title="Load from browser storage"
              >
                Load
              </button>
            </div>

            <!-- Edit Menu -->
            <div class="flex items-center space-x-1">
              <span
                class="text-xs font-medium text-gray-600 mr-1 sm:mr-2 hidden sm:inline"
                >Edit</span
              >
              <button
                @click="performUndo"
                :disabled="!canUndo"
                class="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Undo (Ctrl+Z)"
              >
                ↶ Undo
              </button>
              <button
                @click="performRedo"
                :disabled="!canRedo"
                class="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Redo (Ctrl+Y)"
              >
                ↷ Redo
              </button>
            </div>

            <!-- Export Menu -->
            <div class="flex items-center space-x-1">
              <span
                class="text-xs font-medium text-gray-600 mr-1 sm:mr-2 hidden sm:inline"
                >Export</span
              >
              <button
                @click="exportFile"
                class="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                title="Export as markdown file"
              >
                MD
              </button>
              <button
                @click="openHTMLExportModal"
                :disabled="exportingHTML"
                class="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Export as styled HTML file"
              >
                <span v-if="!exportingHTML">HTML</span>
                <span v-else>⏳</span>
              </button>
              <button
                @click="openPDFExportModal"
                :disabled="exportingPDF"
                class="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Export as PDF (print dialog)"
              >
                <span v-if="!exportingPDF">PDF</span>
                <span v-else>⏳</span>
              </button>
              <button
                @click="exportAllFilesWithImages"
                :disabled="exportingZip"
                class="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Export markdown + images as ZIP file"
              >
                <span v-if="!exportingZip">ZIP</span>
                <span v-else>⏳</span>
              </button>
            </div>

            <!-- Insert Menu -->
            <div class="flex items-center space-x-1">
              <span
                class="text-xs font-medium text-gray-600 mr-1 sm:mr-2 hidden sm:inline"
                >Insert</span
              >
              <ImageUploader :onImageInsert="insertImageIntoEditor" />
              <button
                @click="toggleImageManager"
                class="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                title="Manage stored images"
              >
                Gallery
              </button>
            </div>

            <!-- View Menu -->
            <div class="flex items-center space-x-1">
              <span
                class="text-xs font-medium text-gray-600 mr-1 sm:mr-2 hidden sm:inline"
                >View</span
              >
              <button
                @click="toggleFindReplace"
                :class="[
                  'px-2 py-1 text-xs rounded',
                  showFindReplace
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                ]"
                title="Toggle Find/Replace (Ctrl+H)"
              >
                🔍
              </button>
            </div>
          </div>

          <!-- GitHub Link -->
          <div class="ml-auto">
            <a
              href="https://github.com/dmiyakawa/markdawn"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center px-2 py-1 text-xs rounded text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors duration-200"
              title="View source code on GitHub"
            >
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                  clip-rule="evenodd"
                />
              </svg>
              <span class="hidden sm:inline">GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </header>

    <!-- Find/Replace Panel -->
    <FindReplace
      v-model:visible="showFindReplace"
      @find-next="handleFindNext"
      @find-previous="handleFindPrevious"
      @replace-next="handleReplaceNext"
      @replace-all="handleReplaceAll"
      ref="findReplaceRef"
    />

    <!-- Export Modal -->
    <ExportModal
      v-model:visible="showExportModal"
      :export-type="exportModalType"
      :default-title="activeDocument?.title || 'Markdown Document'"
      @confirm="handleExportConfirm"
      @cancel="handleExportCancel"
    />

    <!-- Image Manager Modal -->
    <div
      v-if="showImageManager"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click="showImageManager = false"
    >
      <div class="w-full max-w-6xl max-h-full" @click.stop>
        <ImageManager
          :documents="documents"
          @close="showImageManager = false"
          @insert-image="handleImageManagerInsert"
        />
      </div>
    </div>

    <!-- Tab Bar -->
    <TabBar
      :lastSaved="lastSaved"
      :saveStatus="saveStatus"
      :saveStatusClass="saveStatusClass"
      :formatTimestamp="formatTimestamp"
      :showOutline="showOutline"
      :showPreview="showPreview"
      @toggle-outline="toggleOutline"
      @toggle-preview="togglePreview"
    />

    <main class="w-full px-4 sm:px-6 lg:px-8 py-4">
      <div
        id="editor-container"
        ref="containerRef"
        class="flex flex-row gap-3 w-full h-[calc(100vh-200px)] min-h-[400px] max-h-[calc(100vh-150px)]"
      >
        <!-- Editor Panel (Left Side) -->
        <MarkdownEditor
          ref="markdownEditorRef"
          v-model:markdown-content="markdownContent"
          :show-preview="showPreview"
          :left-pane-width="leftPaneWidth"
          :is-dragging="isDragging"
          :stats="stats"
          @toggle-find-replace="toggleFindReplace"
          @scroll="handleEditorScroll"
        />

        <!-- Resize Handle -->
        <div
          v-show="showPreview"
          ref="resizeHandleRef"
          data-testid="resize-handle"
          @mousedown="startResize"
          class="hidden md:flex w-1 bg-gray-300 hover:bg-blue-400 cursor-col-resize transition-colors duration-200 mx-1 group relative"
          :class="{ 'bg-blue-500': isResizing }"
        >
          <!-- Resize handle visual indicator -->
          <div
            class="absolute inset-y-0 -left-1 -right-1 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <div class="w-1 h-8 bg-blue-400 rounded-full"></div>
          </div>
        </div>

        <!-- Preview Panel (Right Side) -->
        <Preview
          ref="previewRef"
          :show-preview="showPreview"
          :left-pane-width="leftPaneWidth"
          :is-wysiwyg-mode="isWysiwygMode"
          :html-content="htmlContent"
          @toggle-wysiwyg-mode="toggleWysiwygMode"
          @wysiwyg-scroll="handleWysiwygScroll"
          @wysiwyg-input="handleWysiwygInput"
          @wysiwyg-blur="syncWysiwygContent"
          @wysiwyg-paste="handleWysiwygPaste"
        />

        <!-- Document Outline Sidebar -->
        <DocumentOutline
          v-show="showOutline"
          ref="documentOutlineRef"
          :markdown-content="markdownContent"
          :word-count="stats.words"
          :visible="showOutline"
          @scroll-to-line="scrollToLine"
          @scroll-to-position="scrollToPosition"
        />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { convertMarkdownToHtml, convertHtmlToMarkdown } from './utils/markdown'
import type { StoredImage } from './utils/imageStorage'
import ImageUploader from './components/ImageUploader.vue'
import ImageManager from './components/ImageManager.vue'
import MarkdownEditor from './components/MarkdownEditor.vue'
import Preview from './components/Preview.vue'
import FindReplace from './components/FindReplace.vue'
import TabBar from './components/TabBar.vue'
import DocumentOutline from './components/DocumentOutline.vue'
import ExportModal from './components/ExportModal.vue'
import { useDragAndDrop } from './composables/useDragAndDrop'
import { useResizablePanes } from './composables/useResizablePanes'
import { useDocuments } from './composables/useDocuments'
import {
  importMarkdownFile,
  exportMarkdownFile,
  exportAllDocuments,
  saveToLocalStorage,
  loadFromLocalStorage,
  getSaveTimestamp,
  hasSavedContent,
  getWordCount,
  getCharacterCount,
  getLineCount,
  getExportStats,
} from './utils/fileOperations'
import {
  exportAsHTML as exportHTMLFile,
  exportAsPDF as exportPDFFile,
  type ExportOptions,
} from './utils/advancedExport'

// Document management
const {
  activeDocument,
  activeDocumentId,
  documents,
  switchToDocument,
  updateDocumentContent,
  markDocumentAsSaved,
  initializeDocuments,
  getAllDocuments,
} = useDocuments()

// Computed markdown content from active document
const markdownContent = computed({
  get: () => activeDocument.value?.content || '',
  set: (value: string) => {
    if (activeDocumentId.value) {
      updateDocumentContent(activeDocumentId.value, value)
    }
  },
})
const showPreview = ref(true)
const showFindReplace = ref(false)
const showOutline = ref(false)
const showImageManager = ref(false)
const isWysiwygMode = ref(false) // false = Preview mode, true = WYSIWYG mode

// Template refs for drag-and-drop
const editorContainer = ref<HTMLElement | null>(null)
const findReplaceRef = ref<InstanceType<typeof FindReplace> | null>(null)
const documentOutlineRef = ref<InstanceType<typeof DocumentOutline> | null>(
  null
)
const markdownEditorRef = ref<InstanceType<typeof MarkdownEditor> | null>(null)
const previewRef = ref<InstanceType<typeof Preview> | null>(null)

// Legacy ref getters for compatibility
const wysiwygEditor = computed(() => previewRef.value?.wysiwygEditor || null)
const wysiwygScrollContainer = computed(
  () => previewRef.value?.wysiwygScrollContainer || null
)
const codeMirrorEditor = computed(
  () => markdownEditorRef.value?.codeMirrorEditor || null
)

// File operations
const fileInput = ref<HTMLInputElement>()
const lastSaved = ref<string | undefined>(undefined)
const saveStatus = ref<string>('')
const exportingZip = ref(false)
const exportingHTML = ref(false)
const exportingPDF = ref(false)
const showExportModal = ref(false)
const exportModalType = ref<'html' | 'pdf'>('html')

// Undo/Redo state
const canUndo = ref(false)
const canRedo = ref(false)

// Global keyboard handler
let globalKeydownHandler: ((event: KeyboardEvent) => void) | null = null

// Statistics
const stats = computed(() => ({
  words: getWordCount(markdownContent.value),
  characters: getCharacterCount(markdownContent.value),
  lines: getLineCount(markdownContent.value),
}))

const saveStatusClass = computed(() => ({
  'text-green-600': saveStatus.value.includes('saved'),
  'text-red-600': saveStatus.value.includes('error'),
  'text-yellow-600': saveStatus.value.includes('loading'),
}))

// HTML content for preview
const htmlContent = computed(() => convertMarkdownToHtml(markdownContent.value))

const togglePreview = () => {
  showPreview.value = !showPreview.value
}

const toggleOutline = () => {
  showOutline.value = !showOutline.value
}

const toggleFindReplace = () => {
  showFindReplace.value = !showFindReplace.value

  // Clear search when closing Find/Replace panel
  if (!showFindReplace.value && codeMirrorEditor.value) {
    codeMirrorEditor.value.clearSearch()
  }
}

const toggleImageManager = () => {
  showImageManager.value = !showImageManager.value
}

const handleImageManagerInsert = (image: StoredImage) => {
  // Generate markdown for the stored image
  const imageMarkdown = `![${image.name}](stored:${image.id})`
  insertImageIntoEditor(imageMarkdown)
  showImageManager.value = false
}

const toggleWysiwygMode = () => {
  isWysiwygMode.value = !isWysiwygMode.value

  // When switching to WYSIWYG mode, update content
  if (isWysiwygMode.value) {
    nextTick(() => {
      updateWysiwygContent()
    })
  }
}

// Remove renderedHtml since we no longer use it in template (WYSIWYG is now separate)

let isUpdatingWysiwyg = false
let isSyncingScroll = false // Prevent scroll sync loops

const handleWysiwygInput = (event: Event) => {
  // Only handle input in WYSIWYG mode
  if (!isWysiwygMode.value || isUpdatingWysiwyg) return

  const target = event.target as HTMLElement
  // Convert HTML content back to markdown without triggering re-render
  if (target.innerHTML) {
    const newMarkdown = convertHtmlToMarkdown(target.innerHTML)
    // Only update if content actually changed to avoid cursor issues
    if (newMarkdown !== markdownContent.value) {
      markdownContent.value = newMarkdown
    }
  } else {
    const newMarkdown = target.innerText || ''
    if (newMarkdown !== markdownContent.value) {
      markdownContent.value = newMarkdown
    }
  }
}

const syncWysiwygContent = () => {
  // Only sync in WYSIWYG mode
  if (!isWysiwygMode.value || !wysiwygEditor.value) return

  const target = wysiwygEditor.value
  if (target.innerHTML) {
    const newMarkdown = convertHtmlToMarkdown(target.innerHTML)
    if (newMarkdown !== markdownContent.value) {
      markdownContent.value = newMarkdown
    }
  }
}

const handleWysiwygPaste = async (event: ClipboardEvent) => {
  // Only handle paste in WYSIWYG mode
  if (!isWysiwygMode.value || !event.clipboardData) return

  const items = Array.from(event.clipboardData.items)
  const imageItem = items.find((item) => item.type.startsWith('image/'))

  if (imageItem) {
    event.preventDefault()
    event.stopPropagation()

    try {
      const file = imageItem.getAsFile()
      if (!file) return

      // Import image processing utilities
      const { processImageForStorage } = await import('./utils/imageProcessing')
      const { saveImageToStorage, generateImageMarkdown } = await import(
        './utils/imageStorage'
      )

      // Process and save the image
      const processedImage = await processImageForStorage(file)
      const saved = saveImageToStorage(processedImage)

      if (saved) {
        // Generate markdown for the image
        const imageMarkdown = generateImageMarkdown(processedImage)

        // Insert into the current markdown content at cursor/selection
        const selection = window.getSelection()
        if (selection && wysiwygEditor.value?.contains(selection.focusNode)) {
          // Convert to markdown and insert
          const currentMarkdown = markdownContent.value
          const needsNewlines = !currentMarkdown.endsWith('\n\n')
          markdownContent.value =
            currentMarkdown +
            (needsNewlines ? '\n\n' : '') +
            imageMarkdown +
            '\n\n'
        }
      }
    } catch (error) {
      console.error('Failed to process pasted image in WYSIWYG:', error)
    }
  }
}

const updateWysiwygContent = () => {
  if (!wysiwygEditor.value) return

  isUpdatingWysiwyg = true
  const currentHtml = wysiwygEditor.value.innerHTML
  const newHtml = convertMarkdownToHtml(markdownContent.value)

  // Only update if HTML content is different and WYSIWYG editor is not focused
  if (
    currentHtml !== newHtml &&
    document.activeElement !== wysiwygEditor.value
  ) {
    wysiwygEditor.value.innerHTML = newHtml
  }
  isUpdatingWysiwyg = false
}

// File Operations
const triggerFileImport = () => {
  fileInput.value?.click()
}

const handleFileImport = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  try {
    saveStatus.value = 'Importing file...'
    const content = await importMarkdownFile(file)
    markdownContent.value = content
    saveStatus.value = 'File imported successfully'
    setTimeout(() => {
      saveStatus.value = ''
    }, 3000)
  } catch (error) {
    saveStatus.value = `Import error: ${error instanceof Error ? error.message : 'Unknown error'}`
    setTimeout(() => {
      saveStatus.value = ''
    }, 5000)
  }

  // Clear the input so the same file can be selected again
  input.value = ''
}

const exportFile = () => {
  try {
    exportMarkdownFile(markdownContent.value)
    saveStatus.value = 'File exported successfully'
    setTimeout(() => {
      saveStatus.value = ''
    }, 3000)
  } catch (error) {
    saveStatus.value = `Export error: ${error instanceof Error ? error.message : 'Unknown error'}`
    setTimeout(() => {
      saveStatus.value = ''
    }, 5000)
  }
}

const exportAllFilesWithImages = async () => {
  exportingZip.value = true

  try {
    const allDocs = getAllDocuments()
    const totalImages = allDocs.reduce((count, doc) => {
      return count + getExportStats(doc.content).imageCount
    }, 0)

    // Show export info
    if (totalImages > 0) {
      saveStatus.value = `Creating ZIP with ${allDocs.length} document(s) and ${totalImages} image(s)...`
    } else {
      saveStatus.value = `Creating ZIP with ${allDocs.length} document(s)...`
    }

    // Export all documents using the new multi-document function
    await exportAllDocuments(allDocs)

    saveStatus.value =
      totalImages > 0
        ? `ZIP exported successfully with ${allDocs.length} document(s) and ${totalImages} image(s)`
        : `ZIP exported successfully with ${allDocs.length} document(s)`

    setTimeout(() => {
      saveStatus.value = ''
    }, 3000)
  } catch (error) {
    saveStatus.value = `ZIP export error: ${error instanceof Error ? error.message : 'Unknown error'}`
    setTimeout(() => {
      saveStatus.value = ''
    }, 5000)
  } finally {
    exportingZip.value = false
  }
}

// Export modal handlers
const openHTMLExportModal = () => {
  exportModalType.value = 'html'
  showExportModal.value = true
}

const openPDFExportModal = () => {
  exportModalType.value = 'pdf'
  showExportModal.value = true
}

const handleExportConfirm = async (options: ExportOptions) => {
  if (exportModalType.value === 'html') {
    await exportAsHTML(options)
  } else if (exportModalType.value === 'pdf') {
    await exportAsPDF(options)
  }
  showExportModal.value = false
}

const handleExportCancel = () => {
  showExportModal.value = false
}

const exportAsHTML = async (options: ExportOptions) => {
  exportingHTML.value = true

  try {
    exportHTMLFile(markdownContent.value, options)

    saveStatus.value = 'HTML file exported successfully'
    setTimeout(() => {
      saveStatus.value = ''
    }, 3000)
  } catch (error) {
    saveStatus.value = `HTML export error: ${error instanceof Error ? error.message : 'Unknown error'}`
    setTimeout(() => {
      saveStatus.value = ''
    }, 5000)
  } finally {
    exportingHTML.value = false
  }
}

const exportAsPDF = async (options: ExportOptions) => {
  exportingPDF.value = true

  try {
    await exportPDFFile(markdownContent.value, options)

    saveStatus.value = 'PDF export opened in print dialog'
    setTimeout(() => {
      saveStatus.value = ''
    }, 3000)
  } catch (error) {
    saveStatus.value = `PDF export error: ${error instanceof Error ? error.message : 'Unknown error'}`
    setTimeout(() => {
      saveStatus.value = ''
    }, 5000)
  } finally {
    exportingPDF.value = false
  }
}

const saveDocument = () => {
  try {
    if (activeDocumentId.value) {
      markDocumentAsSaved(activeDocumentId.value)
      lastSaved.value = new Date().toISOString()
      saveStatus.value = 'Document saved'
      setTimeout(() => {
        saveStatus.value = ''
      }, 3000)
    } else {
      saveStatus.value = 'No active document to save'
      setTimeout(() => {
        saveStatus.value = ''
      }, 3000)
    }
  } catch (error) {
    saveStatus.value = `Save error: ${error instanceof Error ? error.message : 'Unknown error'}`
    setTimeout(() => {
      saveStatus.value = ''
    }, 5000)
  }
}

const saveAllDocuments = () => {
  try {
    const allDocs = getAllDocuments()
    if (allDocs.length === 0) {
      saveStatus.value = 'No documents to save'
      setTimeout(() => {
        saveStatus.value = ''
      }, 3000)
      return
    }

    let savedCount = 0
    allDocs.forEach((doc) => {
      if (doc.isUnsaved) {
        markDocumentAsSaved(doc.id)
        savedCount++
      }
    })

    lastSaved.value = new Date().toISOString()

    if (savedCount > 0) {
      saveStatus.value =
        savedCount === 1 ? '1 document saved' : `${savedCount} documents saved`
    } else {
      saveStatus.value = 'All documents already saved'
    }

    setTimeout(() => {
      saveStatus.value = ''
    }, 3000)
  } catch (error) {
    saveStatus.value = `Save error: ${error instanceof Error ? error.message : 'Unknown error'}`
    setTimeout(() => {
      saveStatus.value = ''
    }, 5000)
  }
}

const loadDocument = () => {
  try {
    // For legacy compatibility - import old single document if exists
    const content = loadFromLocalStorage()
    if (content && !activeDocument.value) {
      // Create new document from legacy content
      const { createNewDocument } = useDocuments()
      const newDoc = createNewDocument('Imported Document')
      updateDocumentContent(newDoc.id, content)
      markDocumentAsSaved(newDoc.id)

      saveStatus.value = 'Legacy document imported'
      setTimeout(() => {
        saveStatus.value = ''
      }, 3000)
    } else if (activeDocument.value) {
      saveStatus.value = 'Documents are automatically loaded'
      setTimeout(() => {
        saveStatus.value = ''
      }, 2000)
    } else {
      saveStatus.value = 'No documents to load'
      setTimeout(() => {
        saveStatus.value = ''
      }, 3000)
    }
  } catch (error) {
    saveStatus.value = `Load error: ${error instanceof Error ? error.message : 'Unknown error'}`
    setTimeout(() => {
      saveStatus.value = ''
    }, 5000)
  }
}

const newDocument = () => {
  const { createNewDocument } = useDocuments()
  const newDoc = createNewDocument()

  saveStatus.value = `New document "${newDoc.title}" created`
  setTimeout(() => {
    saveStatus.value = ''
  }, 3000)
}

const formatTimestamp = (timestamp: string | null): string => {
  if (!timestamp) return ''

  try {
    const date = new Date(timestamp)
    return date.toLocaleString()
  } catch {
    return 'Unknown'
  }
}

// Auto-save functionality (optional)
const enableAutoSave = () => {
  setInterval(() => {
    if (markdownContent.value.trim()) {
      saveToLocalStorage(markdownContent.value)
      lastSaved.value = new Date().toISOString()
    }
  }, 30000) // Auto-save every 30 seconds
}

// Image insertion method
const insertImageIntoEditor = (markdown: string) => {
  if (!codeMirrorEditor.value) {
    // Fallback: append to end of content
    const currentContent = markdownContent.value
    const needsNewlineBefore =
      currentContent.length > 0 && !currentContent.endsWith('\n')
    const needsNewlineAfter = true // Always add newline after image

    const imageMarkdown = `${needsNewlineBefore ? '\n' : ''}${markdown}${needsNewlineAfter ? '\n' : ''}`
    markdownContent.value = currentContent + imageMarkdown
    return
  }

  // Get current cursor position
  const selection = codeMirrorEditor.value.getSelection()
  const currentContent = markdownContent.value

  // Check if we need newlines around the image
  const beforeCursor = currentContent.substring(0, selection.from)
  const afterCursor = currentContent.substring(selection.to)

  const needsNewlineBefore =
    beforeCursor.length > 0 && !beforeCursor.endsWith('\n')
  const needsNewlineAfter =
    afterCursor.length > 0 && !afterCursor.startsWith('\n')

  const imageMarkdown = `${needsNewlineBefore ? '\n' : ''}${markdown}${needsNewlineAfter ? '\n' : ''}`

  // Insert the image at cursor position
  codeMirrorEditor.value.insertText(imageMarkdown)

  // Focus the editor after insertion
  codeMirrorEditor.value.focus()
}

// Set up drag-and-drop
const { isDragging } = useDragAndDrop(editorContainer, {
  onFilesDropped: async (files: File[]) => {
    // Import processImageForStorage for drag-and-drop
    const { processImageForStorage } = await import('./utils/imageProcessing')
    const { saveImageToStorage, generateImageMarkdown } = await import(
      './utils/imageStorage'
    )

    for (const file of files) {
      try {
        const processedImage = await processImageForStorage(file)
        const saved = saveImageToStorage(processedImage)

        if (saved) {
          const markdown = generateImageMarkdown(processedImage)
          insertImageIntoEditor(markdown)
        }
      } catch (error) {
        console.error('Failed to process dropped image:', error)
        saveStatus.value = `Failed to process ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        setTimeout(() => {
          saveStatus.value = ''
        }, 5000)
      }
    }
  },
  acceptedTypes: ['image/*'],
  maxFiles: 10,
})

// Set up resizable panes
const {
  isDragging: isResizing,
  leftPaneWidth,
  containerRef,
  resizeHandleRef,
  startResize,
} = useResizablePanes()

// Find/Replace functionality
interface SearchOptions {
  caseSensitive: boolean
  useRegex: boolean
}

const handleFindNext = (text: string, options: SearchOptions) => {
  if (!codeMirrorEditor.value) return

  const result = codeMirrorEditor.value.searchNext(text, {
    caseSensitive: options.caseSensitive,
    useRegex: options.useRegex,
  })

  if (!result) {
    saveStatus.value = 'No matches found'
    setTimeout(() => {
      saveStatus.value = ''
    }, 2000)
  }
}

const handleFindPrevious = (text: string, options: SearchOptions) => {
  if (!codeMirrorEditor.value) return

  const result = codeMirrorEditor.value.searchPrevious(text, {
    caseSensitive: options.caseSensitive,
    useRegex: options.useRegex,
  })

  if (!result) {
    saveStatus.value = 'No matches found'
    setTimeout(() => {
      saveStatus.value = ''
    }, 2000)
  }
}

const handleReplaceNext = (
  findText: string,
  replaceText: string,
  options: SearchOptions
) => {
  if (!codeMirrorEditor.value) return

  const result = codeMirrorEditor.value.performReplace(findText, replaceText, {
    caseSensitive: options.caseSensitive,
    useRegex: options.useRegex,
  })

  if (result) {
    saveStatus.value = 'Text replaced'
    setTimeout(() => {
      saveStatus.value = ''
    }, 2000)
  } else {
    saveStatus.value = 'No matches found to replace'
    setTimeout(() => {
      saveStatus.value = ''
    }, 2000)
  }
}

const handleReplaceAll = (
  findText: string,
  replaceText: string,
  options: SearchOptions
) => {
  if (!codeMirrorEditor.value) return

  const result = codeMirrorEditor.value.performReplaceAll(
    findText,
    replaceText,
    {
      caseSensitive: options.caseSensitive,
      useRegex: options.useRegex,
    }
  )

  if (result) {
    saveStatus.value = 'All matches replaced'
    setTimeout(() => {
      saveStatus.value = ''
    }, 2000)
  } else {
    saveStatus.value = 'No matches found to replace'
    setTimeout(() => {
      saveStatus.value = ''
    }, 2000)
  }
}

// Enhanced Undo/Redo functionality
const performUndo = () => {
  if (!codeMirrorEditor.value) return

  const result = codeMirrorEditor.value.performUndo()
  if (result) {
    updateUndoRedoState()
  }
}

const performRedo = () => {
  if (!codeMirrorEditor.value) return

  const result = codeMirrorEditor.value.performRedo()
  if (result) {
    updateUndoRedoState()
  }
}

const updateUndoRedoState = () => {
  if (!codeMirrorEditor.value) return

  canUndo.value = codeMirrorEditor.value.canUndo()
  canRedo.value = codeMirrorEditor.value.canRedo()
}

// Document outline scroll methods
const scrollToLine = (line: number) => {
  if (!codeMirrorEditor.value) return

  // Use CodeMirror's built-in scrollToLine method
  codeMirrorEditor.value.scrollToLine(line)
  codeMirrorEditor.value.focus()
}

const scrollToPosition = (position: number) => {
  if (!codeMirrorEditor.value) return

  // Focus the editor and set cursor to the specified position
  codeMirrorEditor.value.focus()

  // Use CodeMirror's method to set selection at the position
  // This is a simplified approach - we could enhance it further
  console.log(`Scrolling to position: ${position}`)
}

// Scroll synchronization
interface ScrollInfo {
  scrollTop: number
  scrollHeight: number
  clientHeight: number
}

const handleEditorScroll = (scrollInfo: ScrollInfo) => {
  if (isSyncingScroll || !wysiwygScrollContainer.value) return

  isSyncingScroll = true

  // Calculate scroll percentage
  const scrollPercentage =
    scrollInfo.scrollHeight > scrollInfo.clientHeight
      ? scrollInfo.scrollTop /
        (scrollInfo.scrollHeight - scrollInfo.clientHeight)
      : 0

  // Apply to WYSIWYG container
  const wysiwygElement = wysiwygScrollContainer.value
  const wysiwygMaxScroll =
    wysiwygElement.scrollHeight - wysiwygElement.clientHeight

  if (wysiwygMaxScroll > 0) {
    wysiwygElement.scrollTop = scrollPercentage * wysiwygMaxScroll
  }

  // Reset flag after a brief delay
  setTimeout(() => {
    isSyncingScroll = false
  }, 50)
}

const handleWysiwygScroll = (event: Event) => {
  if (isSyncingScroll || !codeMirrorEditor.value) return

  const target = event.target as HTMLElement
  const scrollInfo = {
    scrollTop: target.scrollTop,
    scrollHeight: target.scrollHeight,
    clientHeight: target.clientHeight,
  }

  isSyncingScroll = true

  // Calculate scroll percentage
  const scrollPercentage =
    scrollInfo.scrollHeight > scrollInfo.clientHeight
      ? scrollInfo.scrollTop /
        (scrollInfo.scrollHeight - scrollInfo.clientHeight)
      : 0

  // Get CodeMirror scroll info and apply percentage
  const editorScrollInfo = codeMirrorEditor.value.getScrollInfo()
  if (editorScrollInfo) {
    const editorMaxScroll =
      editorScrollInfo.scrollHeight - editorScrollInfo.clientHeight
    if (editorMaxScroll > 0) {
      const newScrollTop = scrollPercentage * editorMaxScroll
      codeMirrorEditor.value.scrollToPosition(newScrollTop)
    }
  }

  // Reset flag after a brief delay
  setTimeout(() => {
    isSyncingScroll = false
  }, 50)
}

// Initialize on mount
onMounted(async () => {
  // Initialize document management system
  initializeDocuments()

  // Load existing saved content if available for backwards compatibility
  if (hasSavedContent()) {
    const savedContent = loadFromLocalStorage()
    if (savedContent && !activeDocument.value) {
      // Import legacy content as a new document
      const { createNewDocument } = useDocuments()
      const legacyDoc = createNewDocument('Imported Document')
      updateDocumentContent(legacyDoc.id, savedContent)
      markDocumentAsSaved(legacyDoc.id)
    }
    lastSaved.value = getSaveTimestamp() || undefined
  }

  // Enable auto-save
  enableAutoSave()

  // Initialize WYSIWYG content
  await nextTick()
  updateWysiwygContent()

  // Add global keyboard shortcuts
  globalKeydownHandler = (event: KeyboardEvent) => {
    // Ctrl-S: Save all documents
    if (event.ctrlKey && event.key === 's') {
      event.preventDefault()
      saveAllDocuments()
    }

    // Tab navigation shortcuts
    // Ctrl+Tab: Switch to next tab
    if (event.ctrlKey && event.key === 'Tab' && !event.shiftKey) {
      event.preventDefault()
      const currentIndex = documents.value.findIndex(
        (doc) => doc.id === activeDocumentId.value
      )
      const nextIndex = (currentIndex + 1) % documents.value.length
      if (documents.value[nextIndex]) {
        switchToDocument(documents.value[nextIndex].id)
      }
    }

    // Ctrl+Shift+Tab: Switch to previous tab
    if (event.ctrlKey && event.shiftKey && event.key === 'Tab') {
      event.preventDefault()
      const currentIndex = documents.value.findIndex(
        (doc) => doc.id === activeDocumentId.value
      )
      const prevIndex =
        currentIndex === 0 ? documents.value.length - 1 : currentIndex - 1
      if (documents.value[prevIndex]) {
        switchToDocument(documents.value[prevIndex].id)
      }
    }

    // Ctrl+1-9: Switch to specific tab by number
    if (event.ctrlKey && !event.shiftKey && !event.altKey) {
      const numKey = parseInt(event.key)
      if (numKey >= 1 && numKey <= 9) {
        event.preventDefault()
        const targetDoc = documents.value[numKey - 1]
        if (targetDoc) {
          switchToDocument(targetDoc.id)
        }
      }
    }

    // Ctrl-Z: Undo (only if not in CodeMirror editor)
    if (
      event.ctrlKey &&
      event.key === 'z' &&
      !event.shiftKey &&
      event.target !== codeMirrorEditor.value?.$el
    ) {
      event.preventDefault()
      performUndo()
    }
    // Ctrl-Y or Ctrl-Shift-Z: Redo (only if not in CodeMirror editor)
    if (
      (event.ctrlKey && event.key === 'y') ||
      (event.ctrlKey && event.shiftKey && event.key === 'z')
    ) {
      if (event.target !== codeMirrorEditor.value?.$el) {
        event.preventDefault()
        performRedo()
      }
    }
  }

  document.addEventListener('keydown', globalKeydownHandler)
})

// Cleanup on unmount
onBeforeUnmount(() => {
  if (globalKeydownHandler) {
    document.removeEventListener('keydown', globalKeydownHandler)
  }
})

// Watch for markdown content changes (but not when updating from WYSIWYG)
watch(markdownContent, () => {
  if (!isUpdatingWysiwyg) {
    nextTick(() => {
      updateWysiwygContent()
      updateUndoRedoState() // Update undo/redo state when content changes
    })
  }
})

// Initialize undo/redo state when CodeMirror editor is ready
watch(codeMirrorEditor, (newEditor) => {
  if (newEditor) {
    nextTick(() => {
      updateUndoRedoState()
    })
  }
})

// Update active heading when content changes
watch(markdownContent, () => {
  nextTick(() => {
    updateActiveHeading()
    updateUndoRedoState() // Update undo/redo state when content changes
  })
})

const updateActiveHeading = () => {
  if (!codeMirrorEditor.value || !documentOutlineRef.value) return

  const currentLine = codeMirrorEditor.value.getCurrentLine()
  documentOutlineRef.value.updateActiveHeadingByLine(currentLine)
}
</script>

<style scoped></style>
