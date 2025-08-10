<template>
  <div
    class="min-h-screen bg-gray-100"
    :class="{ 'overflow-hidden': fullScreenMode }"
  >
    <header v-show="!fullScreenMode" class="bg-white shadow-sm border-b">
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
                @click="toggleFullScreen"
                :class="[
                  'px-2 py-1 text-xs rounded',
                  fullScreenMode
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                ]"
                title="Toggle full-screen editing"
              >
                {{ fullScreenMode ? '⤾' : '⤢' }}
              </button>
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

    <main
      :class="['w-full', fullScreenMode ? 'p-0' : 'px-4 sm:px-6 lg:px-8 py-4']"
    >
      <div
        ref="containerRef"
        :class="[
          'flex flex-row gap-3 w-full',
          fullScreenMode
            ? 'h-screen min-h-screen'
            : 'h-auto md:h-[calc(100vh-180px)] min-h-[400px] md:min-h-[500px]',
        ]"
      >
        <!-- Editor Panel (Left Side) -->
        <div
          ref="editorContainer"
          data-testid="editor-panel"
          :class="[
            'bg-white flex flex-col',
            fullScreenMode
              ? 'flex-1 min-h-screen border-0 shadow-none rounded-none'
              : 'rounded-lg shadow border border-gray-200 min-h-[250px] md:min-h-[300px]',
            { 'border-blue-400 bg-blue-50': isDragging && !fullScreenMode },
          ]"
          :style="!fullScreenMode ? { width: `${leftPaneWidth}%` } : {}"
        >
          <div
            class="px-3 py-2 border-b border-gray-200 bg-gray-50 rounded-t-lg flex items-center justify-between"
          >
            <h3 class="text-sm font-medium text-gray-700 flex items-center">
              <svg
                class="w-4 h-4 mr-1.5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              {{ wysiwygMode ? 'WYSIWYG Editor' : 'Markdown Editor' }}
            </h3>
            <div class="flex items-center space-x-2">
              <button
                v-if="fullScreenMode"
                @click="toggleFullScreen"
                class="px-2 py-1 text-xs rounded bg-red-500 text-white hover:bg-red-600"
                title="Exit full-screen mode"
              >
                ⤾ Exit
              </button>
              <button
                @click="toggleWysiwyg"
                :class="[
                  'px-2 py-1 text-xs rounded',
                  wysiwygMode
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300',
                ]"
                title="Toggle WYSIWYG mode"
              >
                {{ wysiwygMode ? 'MD' : 'WYSIWYG' }}
              </button>
            </div>
          </div>
          <div class="flex-1 overflow-hidden">
            <CodeMirrorEditor
              v-if="!wysiwygMode"
              v-model="markdownContent"
              :dark-mode="false"
              placeholder="Start typing your markdown here..."
              class="w-full h-full"
              @toggle-find-replace="toggleFindReplace"
            />
            <div
              v-else
              contenteditable="true"
              class="w-full h-full focus:outline-none prose prose-sm max-w-none overflow-auto p-3"
              @input="handleWysiwygInput"
              v-html="renderedHtml"
            />
          </div>
        </div>

        <!-- Resize Handle -->
        <div
          v-show="!fullScreenMode"
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
          v-show="!fullScreenMode"
          data-testid="preview-panel"
          :class="[
            'bg-white rounded-lg shadow border border-gray-200 flex flex-col min-h-[250px] md:min-h-[300px]',
          ]"
          :style="{ width: `${100 - leftPaneWidth}%` }"
        >
          <div
            class="px-3 py-2 border-b border-gray-200 bg-gray-50 rounded-t-lg flex items-center justify-between"
          >
            <h3 class="text-sm font-medium text-gray-700 flex items-center">
              <svg
                class="w-4 h-4 mr-1.5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              Preview
              <span v-if="!showPreview" class="ml-1 text-xs text-gray-500"
                >(Hidden)</span
              >
            </h3>
            <div class="flex items-center space-x-2">
              <button
                @click="togglePreview"
                :class="[
                  'px-2 py-1 text-xs rounded',
                  showPreview
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300',
                ]"
                title="Toggle preview"
              >
                {{ showPreview ? 'Hide' : 'Show' }}
              </button>
            </div>
          </div>
          <div
            class="flex-1 p-3 overflow-auto"
            :class="{ 'opacity-50': !showPreview }"
          >
            <div
              v-if="showPreview"
              class="prose prose-sm max-w-none"
              v-html="renderedHtml"
            />
            <div
              v-else
              class="flex items-center justify-center h-full text-gray-500"
            >
              <div class="text-center">
                <svg
                  class="w-12 h-12 mx-auto mb-4 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L9.878 9.878m4.242 4.242L9.878 9.878M4.929 19.071L19.071 4.93"
                  />
                </svg>
                <p class="text-lg font-medium">Preview Hidden</p>
                <p class="text-sm">
                  Click the Preview button to show the rendered markdown
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Status Bar -->
    <footer v-show="!fullScreenMode" class="bg-white border-t px-4 py-2">
      <div
        class="max-w-7xl mx-auto flex justify-between items-center text-sm text-gray-600"
      >
        <div class="flex space-x-4">
          <span>Words: {{ stats.words }}</span>
          <span>Characters: {{ stats.characters.withSpaces }}</span>
          <span>Lines: {{ stats.lines }}</span>
        </div>
        <div class="flex space-x-4">
          <span v-if="lastSaved" class="text-green-600">
            Last saved: {{ formatTimestamp(lastSaved) }}
          </span>
          <span v-if="saveStatus" :class="saveStatusClass">
            {{ saveStatus }}
          </span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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
const wysiwygMode = ref(false)
const fullScreenMode = ref(false)
const showFindReplace = ref(false)

// Template refs for drag-and-drop
const editorContainer = ref<HTMLElement | null>(null)
const findReplaceRef = ref<InstanceType<typeof FindReplace> | null>(null)

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

const toggleWysiwyg = () => {
  wysiwygMode.value = !wysiwygMode.value
}

const toggleFullScreen = () => {
  fullScreenMode.value = !fullScreenMode.value
}

const toggleFindReplace = () => {
  showFindReplace.value = !showFindReplace.value
}

const renderedHtml = computed(() => {
  return convertMarkdownToHtml(markdownContent.value)
})

const handleWysiwygInput = (event: Event) => {
  const target = event.target as HTMLElement
  // Convert HTML content back to markdown
  if (target.innerHTML) {
    markdownContent.value = convertHtmlToMarkdown(target.innerHTML)
  } else {
    markdownContent.value = target.innerText || ''
  }
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
  const textarea = document.querySelector('textarea') as HTMLTextAreaElement
  if (textarea && !wysiwygMode.value) {
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const currentContent = markdownContent.value

    // Insert markdown at cursor position or append to end
    const insertAt = start !== undefined ? start : currentContent.length
    const beforeCursor = currentContent.substring(0, insertAt)
    const afterCursor = currentContent.substring(end || insertAt)

    // Add newlines around image if needed
    const needsNewlineBefore =
      beforeCursor.length > 0 && !beforeCursor.endsWith('\n')
    const needsNewlineAfter =
      afterCursor.length > 0 && !afterCursor.startsWith('\n')

    const imageMarkdown = `${needsNewlineBefore ? '\n' : ''}${markdown}${needsNewlineAfter ? '\n' : ''}`

    markdownContent.value = beforeCursor + imageMarkdown + afterCursor

    // Set cursor position after inserted image
    setTimeout(() => {
      const newPosition = insertAt + imageMarkdown.length
      textarea.setSelectionRange(newPosition, newPosition)
      textarea.focus()
    }, 0)
  } else {
    // Fallback: append to end of content
    markdownContent.value += `\n${markdown}\n`
  }
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
onMounted(() => {
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
})
</script>
