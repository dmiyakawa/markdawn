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
              <button
                @click="togglePreview"
                :class="[
                  'px-2 py-1 text-xs rounded',
                  showPreview
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-blue-500 text-white',
                ]"
                title="Toggle preview pane"
              >
                {{ showPreview ? 'Hide Preview' : 'Show Preview' }}
              </button>
            </div>
          </div>

          <!-- Information Pane -->
          <div class="ml-auto flex items-center text-xs text-gray-600">
            <div class="flex items-center" style="margin-right: 16px">
              <span style="margin-right: 8px">Words: {{ stats.words }}</span>
              <span style="margin-right: 8px"
                >Chars: {{ stats.characters.withSpaces }}</span
              >
              <span>Lines: {{ stats.lines }}</span>
            </div>
            <div class="flex items-center">
              <span
                v-if="lastSaved"
                class="text-green-600"
                style="margin-right: 6px"
              >
                Saved: {{ formatTimestamp(lastSaved) }}
              </span>
              <span v-if="saveStatus" :class="saveStatusClass">
                {{ saveStatus }}
              </span>
            </div>
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

    <!-- Tab Bar -->
    <TabBar />

    <main class="w-full px-4 sm:px-6 lg:px-8 py-4">
      <div
        id="editor-container"
        ref="containerRef"
        class="flex flex-row gap-3 w-full h-[calc(100vh-200px)] min-h-[400px] max-h-[calc(100vh-150px)]"
      >
        <!-- Editor Panel (Left Side) -->
        <div
          id="left-pane"
          ref="editorContainer"
          data-testid="editor-panel"
          :class="[
            'bg-white flex flex-col rounded-lg shadow border border-gray-200 h-full',
            { 'border-blue-400 bg-blue-50': isDragging },
          ]"
          :style="{ width: showPreview ? `${leftPaneWidth}%` : '100%' }"
        >
          <div
            class="px-3 border-b border-gray-200 bg-gray-50 rounded-t-lg flex items-center justify-between min-h-8"
          >
            <h3 class="text-sm font-medium text-gray-700">Markdown Editor</h3>
            <div class="flex items-center space-x-2">
              <!-- Editor controls can be added here if needed -->
            </div>
          </div>
          <div class="flex-1 overflow-hidden">
            <CodeMirrorEditor
              ref="codeMirrorEditor"
              v-model="markdownContent"
              :dark-mode="false"
              placeholder="Start typing your markdown here..."
              class="w-full h-full"
              @toggle-find-replace="toggleFindReplace"
              @scroll="handleEditorScroll"
            />
          </div>
        </div>

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
        <div
          id="right-pane"
          v-show="showPreview"
          data-testid="preview-panel"
          :class="[
            'bg-white rounded-lg shadow border border-gray-200 flex flex-col h-full',
          ]"
          :style="{ width: `${100 - leftPaneWidth}%` }"
        >
          <div
            class="px-3 border-b border-gray-200 bg-gray-50 rounded-t-lg flex items-center justify-between min-h-8"
          >
            <h3 class="text-sm font-medium text-gray-700">
              {{ isWysiwygMode ? 'WYSIWYG Editor' : 'Preview' }}
            </h3>
            <div class="flex items-center space-x-2">
              <button
                @click="toggleWysiwygMode"
                :class="[
                  'px-2 py-1 text-xs rounded transition-colors duration-200',
                  isWysiwygMode
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                ]"
                :title="
                  isWysiwygMode
                    ? 'Switch to Preview mode'
                    : 'Switch to WYSIWYG editing mode'
                "
              >
                {{ isWysiwygMode ? 'Preview' : 'Edit' }}
              </button>
            </div>
          </div>
          <div class="flex-1 overflow-hidden">
            <div
              ref="wysiwygScrollContainer"
              class="h-full overflow-auto"
              style="padding: 0 16px"
              @scroll="handleWysiwygScroll"
            >
              <div
                id="wysiwyg-editor"
                ref="wysiwygEditor"
                :contenteditable="isWysiwygMode"
                :class="[
                  'w-full h-full prose prose-sm max-w-none wysiwyg-editor',
                  isWysiwygMode ? 'focus:outline-none' : 'cursor-default',
                  !isWysiwygMode ? 'bg-gray-50' : '',
                ]"
                @input="handleWysiwygInput"
                @blur="syncWysiwygContent"
                @paste="handleWysiwygPaste"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { convertMarkdownToHtml, convertHtmlToMarkdown } from './utils/markdown'
import ImageUploader from './components/ImageUploader.vue'
import CodeMirrorEditor from './components/CodeMirrorEditor.vue'
import FindReplace from './components/FindReplace.vue'
import TabBar from './components/TabBar.vue'
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

// Document management
const {
  activeDocument,
  activeDocumentId,
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
const isWysiwygMode = ref(false) // false = Preview mode, true = WYSIWYG mode

// Template refs for drag-and-drop
const editorContainer = ref<HTMLElement | null>(null)
const findReplaceRef = ref<InstanceType<typeof FindReplace> | null>(null)
const wysiwygEditor = ref<HTMLElement | null>(null)
const wysiwygScrollContainer = ref<HTMLElement | null>(null)
const codeMirrorEditor = ref<InstanceType<typeof CodeMirrorEditor> | null>(null)

// File operations
const fileInput = ref<HTMLInputElement>()
const lastSaved = ref<string | null>(null)
const saveStatus = ref<string>('')
const exportingZip = ref(false)

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

const togglePreview = () => {
  showPreview.value = !showPreview.value
}

const toggleFindReplace = () => {
  showFindReplace.value = !showFindReplace.value

  // Clear search when closing Find/Replace panel
  if (!showFindReplace.value && codeMirrorEditor.value) {
    codeMirrorEditor.value.clearSearch()
  }
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
      const {
        processImageForStorage,
        saveImageToStorage,
        generateImageMarkdown,
      } = await import('./utils/imageOperations')

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
    const {
      processImageForStorage,
      saveImageToStorage,
      generateImageMarkdown,
    } = await import('./utils/imageOperations')

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
    lastSaved.value = getSaveTimestamp()
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
    })
  }
})
</script>

<style scoped></style>
