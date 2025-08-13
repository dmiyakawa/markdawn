<template>
  <div
    id="tab-bar"
    class="flex items-center bg-gray-50 border-b border-gray-200 min-h-[42px] px-4"
  >
    <!-- Document Tabs -->
    <div id="tab-container" class="flex-1 flex items-center space-x-1 overflow-x-auto">
      <div
        v-for="document in documents"
        :key="document.id"
        :class="[
          'flex items-center px-3 py-2 rounded-t-lg cursor-pointer border-b-2 transition-colors duration-200 min-w-[120px] max-w-[200px] group relative',
          document.id === activeDocumentId
            ? 'bg-white border-blue-500 text-gray-900 shadow-sm'
            : 'bg-gray-100 border-transparent text-gray-600 hover:bg-gray-200 hover:text-gray-800',
        ]"
        @click="switchToDocument(document.id)"
        @contextmenu.prevent="showContextMenu($event, document.id)"
      >
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
          ]"
          @click.stop="closeDocument(document.id)"
          title="Close tab"
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
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
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
} = useDocuments()

// Template refs
const titleInput = ref<HTMLInputElement>()

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

// Global click handler for context menu
const handleGlobalClick = (event: Event) => {
  // Close context menu on outside clicks
  if (contextMenu.value.show) {
    const target = event.target as HTMLElement
    if (!target.closest('.context-menu')) {
      hideContextMenu()
    }
  }
}

// Lifecycle hooks
onMounted(() => {
  document.addEventListener('click', handleGlobalClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleGlobalClick)
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
</style>
