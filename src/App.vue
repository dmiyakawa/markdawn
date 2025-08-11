<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow-sm border-b">
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
              <span style="margin-right: 8px">Chars: {{ stats.characters.withSpaces }}</span>
              <span>Lines: {{ stats.lines }}</span>
            </div>
            <div class="flex items-center">
              <span v-if="lastSaved" class="text-green-600" style="margin-right: 6px">
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

    <main class="w-full px-4 sm:px-6 lg:px-8 py-4">
      <div
        ref="containerRef"
        class="flex flex-row gap-3 w-full h-auto md:h-[calc(100vh-180px)] min-h-[400px] md:min-h-[500px]"
      >
        <!-- Editor Panel (Left Side) -->
        <div
          ref="editorContainer"
          data-testid="editor-panel"
          :class="[
            'bg-white flex flex-col rounded-lg shadow border border-gray-200 min-h-[250px] md:min-h-[300px]',
            { 'border-blue-400 bg-blue-50': isDragging },
          ]"
          :style="{ width: showPreview ? `${leftPaneWidth}%` : '100%' }"
        >
          <div
            class="px-3 py-2 border-b border-gray-200 bg-gray-50 rounded-t-lg flex items-center justify-between"
          >
            <h3 class="text-sm font-medium text-gray-700">
              Markdown Editor
            </h3>
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
          v-show="showPreview"
          data-testid="preview-panel"
          :class="[
            'bg-white rounded-lg shadow border border-gray-200 flex flex-col min-h-[250px] md:min-h-[300px]',
          ]"
          :style="{ width: `${100 - leftPaneWidth}%` }"
        >
          <div
            class="px-3 py-2 border-b border-gray-200 bg-gray-50 rounded-t-lg flex items-center justify-between"
          >
            <h3 class="text-sm font-medium text-gray-700">
              WYSIWYG Editor
            </h3>
            <div class="flex items-center space-x-2">
              <!-- Preview controls can be added here if needed -->
            </div>
          </div>
          <div class="flex-1 overflow-hidden">
            <div
              ref="wysiwygEditor"
              contenteditable="true"
              class="w-full h-full focus:outline-none prose prose-sm max-w-none overflow-auto p-4"
              @input="handleWysiwygInput"
              @blur="syncWysiwygContent"
            />
          </div>
        </div>
      </div>
    </main>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { convertMarkdownToHtml, convertHtmlToMarkdown } from './utils/markdown'
import ImageUploader from './components/ImageUploader.vue'
import CodeMirrorEditor from './components/CodeMirrorEditor.vue'
import FindReplace from './components/FindReplace.vue'
import { useDragAndDrop } from './composables/useDragAndDrop'
import { useResizablePanes } from './composables/useResizablePanes'
import {
  importMarkdownFile,
  exportMarkdownFile,
  exportAllFiles,
  saveToLocalStorage,
  loadFromLocalStorage,
  getSaveTimestamp,
  hasSavedContent,
  getWordCount,
  getCharacterCount,
  getLineCount,
  getExportStats,
} from './utils/fileOperations'

const markdownContent = ref(
  `# Welcome to Markdown Editor

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

> **Tip**: Toggle between edit and preview modes using the buttons above!`
)
const showPreview = ref(true)
const showFindReplace = ref(false)

// Template refs for drag-and-drop
const editorContainer = ref<HTMLElement | null>(null)
const findReplaceRef = ref<InstanceType<typeof FindReplace> | null>(null)
const wysiwygEditor = ref<HTMLElement | null>(null)
const codeMirrorEditor = ref<InstanceType<typeof CodeMirrorEditor> | null>(null)

// File operations
const fileInput = ref<HTMLInputElement>()
const lastSaved = ref<string | null>(null)
const saveStatus = ref<string>('')
const exportingZip = ref(false)

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
}

const renderedHtml = computed(() => {
  return convertMarkdownToHtml(markdownContent.value)
})

let isUpdatingWysiwyg = false

const handleWysiwygInput = (event: Event) => {
  if (isUpdatingWysiwyg) return
  
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
  // Sync content when focus is lost
  if (wysiwygEditor.value) {
    const target = wysiwygEditor.value
    if (target.innerHTML) {
      const newMarkdown = convertHtmlToMarkdown(target.innerHTML)
      if (newMarkdown !== markdownContent.value) {
        markdownContent.value = newMarkdown
      }
    }
  }
}

const updateWysiwygContent = () => {
  if (!wysiwygEditor.value) return
  
  isUpdatingWysiwyg = true
  const currentHtml = wysiwygEditor.value.innerHTML
  const newHtml = convertMarkdownToHtml(markdownContent.value)
  
  // Only update if HTML content is different and WYSIWYG editor is not focused
  if (currentHtml !== newHtml && document.activeElement !== wysiwygEditor.value) {
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
    const stats = getExportStats(markdownContent.value)

    // Show export info
    if (stats.imageCount > 0) {
      saveStatus.value = `Creating ZIP with ${stats.imageCount} image(s)...`
    } else {
      saveStatus.value = 'Creating ZIP file...'
    }

    await exportAllFiles(markdownContent.value)

    saveStatus.value =
      stats.imageCount > 0
        ? `ZIP exported successfully with ${stats.imageCount} image(s)`
        : 'ZIP exported successfully'

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
    const success = saveToLocalStorage(markdownContent.value)
    if (success) {
      lastSaved.value = new Date().toISOString()
      saveStatus.value = 'Document saved'
      setTimeout(() => {
        saveStatus.value = ''
      }, 3000)
    } else {
      saveStatus.value = 'Save error: Storage failed'
      setTimeout(() => {
        saveStatus.value = ''
      }, 5000)
    }
  } catch (error) {
    saveStatus.value = `Save error: ${error instanceof Error ? error.message : 'Unknown error'}`
    setTimeout(() => {
      saveStatus.value = ''
    }, 5000)
  }
}

const loadDocument = () => {
  try {
    const content = loadFromLocalStorage()
    if (content) {
      markdownContent.value = content
      lastSaved.value = getSaveTimestamp()
      saveStatus.value = 'Document loaded'
      setTimeout(() => {
        saveStatus.value = ''
      }, 3000)
    } else {
      saveStatus.value = 'No saved document found'
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
  if (
    markdownContent.value.trim() &&
    !confirm(
      'Are you sure you want to create a new document? Unsaved changes will be lost.'
    )
  ) {
    return
  }

  markdownContent.value = `# New Document

Start writing your markdown here...`
  lastSaved.value = null
  saveStatus.value = 'New document created'
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
    const needsNewlineBefore = currentContent.length > 0 && !currentContent.endsWith('\n')
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
  
  const needsNewlineBefore = beforeCursor.length > 0 && !beforeCursor.endsWith('\n')
  const needsNewlineAfter = afterCursor.length > 0 && !afterCursor.startsWith('\n')

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
  // TODO: Implement find functionality with CodeMirror
  console.log('Find next:', text, options)
}

const handleFindPrevious = (text: string, options: SearchOptions) => {
  // TODO: Implement find previous functionality with CodeMirror
  console.log('Find previous:', text, options)
}

const handleReplaceNext = (
  findText: string,
  replaceText: string,
  options: SearchOptions
) => {
  // TODO: Implement replace functionality with CodeMirror
  console.log('Replace next:', findText, 'with', replaceText, options)
}

const handleReplaceAll = (
  findText: string,
  replaceText: string,
  options: SearchOptions
) => {
  // TODO: Implement replace all functionality with CodeMirror
  console.log('Replace all:', findText, 'with', replaceText, options)
}

// Initialize on mount
onMounted(async () => {
  // Load existing saved content if available, otherwise keep welcome content
  if (hasSavedContent()) {
    const savedContent = loadFromLocalStorage()
    if (savedContent) {
      markdownContent.value = savedContent
      lastSaved.value = getSaveTimestamp()
    }
  }

  // Enable auto-save
  enableAutoSave()

  // Initialize WYSIWYG content
  await nextTick()
  updateWysiwygContent()
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
