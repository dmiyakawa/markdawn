<template>
  <div
    id="tab-bar"
    class="flex items-center bg-gray-50 border-b border-gray-200 min-h-[42px] px-4"
  >
    <!-- Scroll Left Button -->
    <button
      v-show="showScrollControls && canScrollLeft"
      @click="scrollLeft"
      class="p-1 rounded hover:bg-gray-200 transition-colors duration-200 mr-1"
      title="Scroll tabs left"
    >
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path
          fill-rule="evenodd"
          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
          clip-rule="evenodd"
        />
      </svg>
    </button>

    <!-- Document Tabs -->
    <div
      ref="tabContainer"
      id="tab-container"
      class="flex-1 flex items-center space-x-1 overflow-x-hidden scrollbar-hidden"
      @scroll="handleTabScroll"
    >
      <div
        v-for="(document, index) in sortedDocuments"
        :key="document.id"
        :data-document-id="document.id"
        :class="[
          'flex items-center px-3 py-2 rounded-t-lg cursor-pointer border-b-2 transition-colors duration-200 min-w-[120px] max-w-[200px] group relative',
          document.id === activeDocumentId
            ? 'bg-white border-blue-500 text-gray-900 shadow-sm'
            : 'bg-gray-100 border-transparent text-gray-600 hover:bg-gray-200 hover:text-gray-800',
          document.isPinned
            ? 'bg-gradient-to-r from-blue-50 to-transparent border-l-2 border-blue-300'
            : '',
          dragState.isDragging && dragState.draggedIndex === index
            ? 'opacity-50 scale-95 transform z-10'
            : '',
          dragState.isDragging &&
          dragState.dragOverIndex === index &&
          dragState.draggedIndex !== index
            ? 'border-l-4 border-blue-500'
            : '',
        ]"
        :draggable="true"
        @click="switchToDocument(document.id)"
        @contextmenu.prevent="showContextMenu($event, document.id)"
        @dragstart="handleDragStart($event, index)"
        @dragend="handleDragEnd"
        @dragover.prevent="handleDragOver($event, index)"
        @dragleave="handleDragLeave"
        @drop.prevent="handleDrop($event, index)"
      >
        <!-- Pin Icon -->
        <div
          v-if="document.isPinned"
          class="mr-1 text-blue-500"
          title="Pinned tab"
        >
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              d="M10 3a1 1 0 011 1v1.52l2.42 2.42a1 1 0 01.3.71V12a1 1 0 01-.3.71L11 15.14V17a1 1 0 01-1 1 1 1 0 01-1-1v-1.86l-2.42-2.43A1 1 0 016.58 12V8.65a1 1 0 01.3-.71L9.3 5.52V4a1 1 0 011-1z"
            />
          </svg>
        </div>

        <!-- Document Title -->
        <div
          v-if="editingDocumentId !== document.id"
          :class="[
            'flex-1 text-sm truncate select-none',
            document.id === activeDocumentId ? 'font-medium' : 'font-normal',
          ]"
          @dblclick="startEditing(document.id)"
        >
          {{ document.title }}
        </div>

        <!-- Inline Title Editor -->
        <input
          v-else
          ref="titleInput"
          v-model="editingTitle"
          :class="[
            'flex-1 text-sm bg-transparent border-none outline-none',
            document.id === activeDocumentId ? 'font-medium' : 'font-normal',
          ]"
          @blur="finishEditing"
          @keydown.enter="finishEditing"
          @keydown.escape="cancelEditing"
        />

        <!-- Unsaved Indicator -->
        <div
          v-if="document.isUnsaved"
          class="ml-2 w-2 h-2 bg-blue-500 rounded-full"
          title="Unsaved changes"
        />

        <!-- Close Button -->
        <button
          v-if="documents.length > 1"
          :class="[
            'ml-2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-300 transition-opacity duration-200',
            document.id === activeDocumentId
              ? 'opacity-60 hover:opacity-100'
              : '',
            document.isPinned ? 'cursor-not-allowed opacity-30' : '',
          ]"
          @click.stop="document.isPinned ? null : closeDocument(document.id)"
          :title="document.isPinned ? 'Cannot close pinned tab' : 'Close tab'"
        >
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Scroll Right Button -->
    <button
      v-show="showScrollControls && canScrollRight"
      @click="scrollRight"
      class="p-1 rounded hover:bg-gray-200 transition-colors duration-200 ml-1"
      title="Scroll tabs right"
    >
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path
          fill-rule="evenodd"
          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
          clip-rule="evenodd"
        />
      </svg>
    </button>

    <!-- Tab Overflow Dropdown -->
    <div v-if="showOverflowDropdown" class="relative ml-1">
      <button
        @click="toggleOverflowMenu"
        class="p-1 rounded hover:bg-gray-200 transition-colors duration-200"
        title="More tabs"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"
          />
        </svg>
      </button>

      <!-- Overflow Menu -->
      <div
        v-if="overflowMenu.show"
        class="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[200px] max-h-[300px] overflow-y-auto z-50"
      >
        <button
          v-for="document in hiddenDocuments"
          :key="document.id"
          @click="switchToDocumentAndScroll(document.id)"
          :class="[
            'w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between',
            document.id === activeDocumentId ? 'bg-blue-50 text-blue-700' : '',
          ]"
        >
          <span class="truncate">{{ document.title }}</span>
          <div class="flex items-center space-x-1">
            <div
              v-if="document.isUnsaved"
              class="w-2 h-2 bg-blue-500 rounded-full"
              title="Unsaved changes"
            />
            <button
              v-if="documents.length > 1"
              @click.stop="closeDocument(document.id)"
              class="p-1 hover:bg-gray-200 rounded"
              title="Close"
            >
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
        </button>
      </div>
    </div>

    <!-- New Tab Button -->
    <button
      class="ml-2 p-2 rounded hover:bg-gray-200 transition-colors duration-200"
      @click="() => createNewDocument()"
      title="New document"
    >
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path
          fill-rule="evenodd"
          d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
          clip-rule="evenodd"
        />
      </svg>
    </button>

    <!-- Context Menu -->
    <div
      v-if="contextMenu.show"
      :style="{
        position: 'fixed',
        left: `${contextMenu.x}px`,
        top: `${contextMenu.y}px`,
        zIndex: 1000,
      }"
      class="bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[150px]"
    >
      <button
        class="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors duration-200"
        @click="renameDocument"
      >
        Rename
      </button>
      <button
        class="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors duration-200"
        @click="duplicateCurrentDocument"
      >
        Duplicate
      </button>
      <hr class="my-1 border-gray-200" />
      <button
        class="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors duration-200 flex items-center"
        @click="togglePin"
      >
        <svg
          v-if="!isCurrentDocumentPinned"
          class="w-4 h-4 mr-2"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            d="M10 3a1 1 0 011 1v1.52l2.42 2.42a1 1 0 01.3.71V12a1 1 0 01-.3.71L11 15.14V17a1 1 0 01-1 1 1 1 0 01-1-1v-1.86l-2.42-2.43A1 1 0 016.58 12V8.65a1 1 0 01.3-.71L9.3 5.52V4a1 1 0 011-1z"
          />
        </svg>
        <svg
          v-else
          class="w-4 h-4 mr-2 text-blue-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            d="M10 3a1 1 0 011 1v1.52l2.42 2.42a1 1 0 01.3.71V12a1 1 0 01-.3.71L11 15.14V17a1 1 0 01-1 1 1 1 0 01-1-1v-1.86l-2.42-2.43A1 1 0 016.58 12V8.65a1 1 0 01.3-.71L9.3 5.52V4a1 1 0 011-1z"
          />
        </svg>
        {{ isCurrentDocumentPinned ? 'Unpin Tab' : 'Pin Tab' }}
      </button>
      <hr class="my-1 border-gray-200" />
      <button
        :disabled="documents.length <= 1"
        :class="[
          'w-full text-left px-3 py-2 text-sm transition-colors duration-200',
          documents.length > 1
            ? 'hover:bg-red-50 hover:text-red-700'
            : 'text-gray-400 cursor-not-allowed',
        ]"
        @click="closeCurrentDocument"
      >
        Close
      </button>
    </div>
  </div>

  <!-- Click overlay to close context menu -->
  <div
    v-if="contextMenu.show"
    class="fixed inset-0 z-40"
    @click="hideContextMenu"
  />
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { useDocuments } from '../composables/useDocuments'
import type { TabContextMenuOptions } from '../types/document'

// Document management
const {
  documents,
  activeDocumentId,
  createNewDocument,
  switchToDocument,
  closeDocument,
  duplicateDocument,
  updateDocumentTitle,
  reorderDocuments,
  toggleDocumentPin,
} = useDocuments()

// Template refs
const titleInput = ref<HTMLInputElement>()
const tabContainer = ref<HTMLDivElement>()

// Inline editing state
const editingDocumentId = ref<string | null>(null)
const editingTitle = ref<string>('')
const originalTitle = ref<string>('')

// Context menu state
const contextMenu = ref<TabContextMenuOptions>({
  x: 0,
  y: 0,
  documentId: '',
  show: false,
})

// Drag and drop state
interface DragState {
  isDragging: boolean
  draggedIndex: number | null
  dragOverIndex: number | null
}

const dragState = ref<DragState>({
  isDragging: false,
  draggedIndex: null,
  dragOverIndex: null,
})

// Tab overflow management state
const showScrollControls = ref(false)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)
const showOverflowDropdown = ref(false)

const overflowMenu = ref({
  show: false,
})

// Computed properties for overflow management
// Note: visibleDocuments currently not used but may be needed for future overflow optimizations
// const visibleDocuments = computed(() => {
//   if (!showOverflowDropdown.value) return sortedDocuments.value
//
//   // When overflow menu is needed, we might want to show only visible tabs
//   // For now, return all documents as the container will handle overflow
//   return sortedDocuments.value
// })

const hiddenDocuments = computed(() => {
  if (!showOverflowDropdown.value) return []

  // This is a simplified implementation - in a real scenario,
  // you'd calculate which tabs are actually hidden based on container width
  return sortedDocuments.value.slice(8) // Show first 8 tabs, rest in dropdown
})

// Sort documents to show pinned tabs first
const sortedDocuments = computed(() => {
  return [...documents.value].sort((a, b) => {
    // Pinned tabs come first
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return 0 // Maintain original order for tabs with same pin status
  })
})

// Check if current document is pinned for context menu
const isCurrentDocumentPinned = computed(() => {
  const doc = documents.value.find(
    (doc) => doc.id === contextMenu.value.documentId
  )
  return doc?.isPinned || false
})

// Start inline editing
const startEditing = (documentId: string) => {
  const document = documents.value.find((doc) => doc.id === documentId)
  if (!document) return

  editingDocumentId.value = documentId
  editingTitle.value = document.title
  originalTitle.value = document.title

  nextTick(() => {
    if (titleInput.value) {
      titleInput.value.focus()
      titleInput.value.select()
    }
  })
}

// Finish editing and save
const finishEditing = () => {
  if (editingDocumentId.value) {
    const newTitle = editingTitle.value.trim()
    if (newTitle && newTitle !== originalTitle.value) {
      updateDocumentTitle(editingDocumentId.value, newTitle)
    }
  }

  editingDocumentId.value = null
  editingTitle.value = ''
  originalTitle.value = ''
}

// Cancel editing
const cancelEditing = () => {
  editingDocumentId.value = null
  editingTitle.value = ''
  originalTitle.value = ''
}

// Context menu functions
const showContextMenu = (event: MouseEvent, documentId: string) => {
  contextMenu.value = {
    x: event.clientX,
    y: event.clientY,
    documentId,
    show: true,
  }
}

const hideContextMenu = () => {
  contextMenu.value.show = false
}

const renameDocument = () => {
  startEditing(contextMenu.value.documentId)
  hideContextMenu()
}

const duplicateCurrentDocument = () => {
  duplicateDocument(contextMenu.value.documentId)
  hideContextMenu()
}

const closeCurrentDocument = () => {
  closeDocument(contextMenu.value.documentId)
  hideContextMenu()
}

const togglePin = () => {
  toggleDocumentPin(contextMenu.value.documentId)
  hideContextMenu()
}

// Drag and drop handlers
const handleDragStart = (event: DragEvent, index: number) => {
  if (editingDocumentId.value !== null) {
    // Don't allow dragging while editing
    event.preventDefault()
    return
  }

  dragState.value.isDragging = true
  dragState.value.draggedIndex = index

  // Set drag data
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', documents.value[index].id)

    // Add drag image styling
    const draggedElement = event.target as HTMLElement
    if (draggedElement) {
      draggedElement.style.opacity = '0.5'
    }
  }
}

const handleDragEnd = (event: DragEvent) => {
  // Reset drag state
  dragState.value.isDragging = false
  dragState.value.draggedIndex = null
  dragState.value.dragOverIndex = null

  // Reset element styling
  const draggedElement = event.target as HTMLElement
  if (draggedElement) {
    draggedElement.style.opacity = ''
  }
}

const handleDragOver = (event: DragEvent, index: number) => {
  event.preventDefault()

  if (dragState.value.isDragging && dragState.value.draggedIndex !== index) {
    dragState.value.dragOverIndex = index

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move'
    }
  }
}

const handleDragLeave = (event: DragEvent) => {
  // Only clear dragOverIndex if we're leaving the tab container
  const target = event.target as HTMLElement
  if (!target.closest('[draggable="true"]')) {
    dragState.value.dragOverIndex = null
  }
}

const handleDrop = (event: DragEvent, dropIndex: number) => {
  event.preventDefault()

  const draggedIndex = dragState.value.draggedIndex

  if (draggedIndex !== null && draggedIndex !== dropIndex) {
    // Perform the reorder
    reorderDocuments(draggedIndex, dropIndex)
  }

  // Reset drag state
  dragState.value.isDragging = false
  dragState.value.draggedIndex = null
  dragState.value.dragOverIndex = null
}

// Tab overflow management functions
const checkTabOverflow = () => {
  if (!tabContainer.value) return

  const container = tabContainer.value
  const hasOverflow = container.scrollWidth > container.clientWidth

  showScrollControls.value = hasOverflow
  showOverflowDropdown.value = documents.value.length > 8 // Show dropdown for more than 8 tabs

  // Check scroll position
  canScrollLeft.value = container.scrollLeft > 0
  canScrollRight.value =
    container.scrollLeft < container.scrollWidth - container.clientWidth
}

const scrollLeft = () => {
  if (!tabContainer.value) return

  const container = tabContainer.value
  const scrollAmount = 200 // Scroll 200px at a time

  container.scrollBy({
    left: -scrollAmount,
    behavior: 'smooth',
  })
}

const scrollRight = () => {
  if (!tabContainer.value) return

  const container = tabContainer.value
  const scrollAmount = 200 // Scroll 200px at a time

  container.scrollBy({
    left: scrollAmount,
    behavior: 'smooth',
  })
}

const handleTabScroll = () => {
  checkTabOverflow()
}

const toggleOverflowMenu = () => {
  overflowMenu.value.show = !overflowMenu.value.show
}

const switchToDocumentAndScroll = (documentId: string) => {
  switchToDocument(documentId)
  overflowMenu.value.show = false

  // Scroll the active tab into view if needed
  nextTick(() => {
    scrollActiveTabIntoView()
  })
}

const scrollActiveTabIntoView = () => {
  if (!tabContainer.value || !activeDocumentId.value) return

  const activeTab = tabContainer.value.querySelector(
    `[data-document-id="${activeDocumentId.value}"]`
  ) as HTMLElement
  if (activeTab) {
    activeTab.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    })
  }
}

// Global click handler for context menu and overflow menu
const handleGlobalClick = (event: Event) => {
  // Close context menu on outside clicks
  if (contextMenu.value.show) {
    const target = event.target as HTMLElement
    if (!target.closest('.context-menu')) {
      hideContextMenu()
    }
  }

  // Close overflow menu on outside clicks
  if (overflowMenu.value.show) {
    const target = event.target as HTMLElement
    if (!target.closest('.relative')) {
      overflowMenu.value.show = false
    }
  }
}

// Resize observer to handle tab overflow
let resizeObserver: ResizeObserver | null = null

// Lifecycle hooks
onMounted(() => {
  document.addEventListener('click', handleGlobalClick)

  // Set up resize observer for tab overflow detection
  if (tabContainer.value) {
    resizeObserver = new ResizeObserver(() => {
      checkTabOverflow()
    })
    resizeObserver.observe(tabContainer.value)

    // Initial check
    nextTick(() => {
      checkTabOverflow()
    })
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleGlobalClick)

  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})
</script>

<style scoped>
/* Custom scrollbar for tab overflow */
.overflow-x-auto::-webkit-scrollbar {
  height: 4px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Hidden scrollbar for controlled scrolling */
.scrollbar-hidden {
  overflow-x: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer and Edge */
}

.scrollbar-hidden::-webkit-scrollbar {
  display: none; /* Chrome, Safari, and Opera */
}

/* Drag and drop styles */
.group[draggable='true'] {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

.group[draggable='true']:hover {
  cursor: grab;
}

.group[draggable='true']:active {
  cursor: grabbing;
}

/* Drag indicator */
.border-l-4 {
  position: relative;
}

.border-l-4::before {
  content: '';
  position: absolute;
  left: -2px;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #3b82f6;
  border-radius: 1px;
}
</style>
