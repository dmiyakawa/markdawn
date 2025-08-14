<template>
  <div
    v-if="isVisible"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click="handleBackdropClick"
  >
    <div
      class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
      @click.stop
    >
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">Export Options</h2>
        <p class="text-sm text-gray-600 mt-1">
          Customize your {{ exportType.toUpperCase() }} export settings
        </p>
      </div>

      <div class="px-6 py-4 space-y-4">
        <!-- Document Title -->
        <div>
          <label
            for="export-title"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Document Title
          </label>
          <input
            id="export-title"
            v-model="options.title"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter document title"
          />
        </div>

        <!-- Author -->
        <div>
          <label
            for="export-author"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Author (Optional)
          </label>
          <input
            id="export-author"
            v-model="options.author"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter author name"
          />
        </div>

        <!-- Theme Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Theme
          </label>
          <div class="grid grid-cols-2 gap-2">
            <label
              v-for="theme in themes"
              :key="theme.value"
              class="flex items-center space-x-2 p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
              :class="{
                'border-blue-500 bg-blue-50': options.theme === theme.value,
              }"
            >
              <input
                v-model="options.theme"
                :value="theme.value"
                type="radio"
                class="text-blue-600"
              />
              <div>
                <div class="text-sm font-medium text-gray-900">
                  {{ theme.name }}
                </div>
                <div class="text-xs text-gray-500">{{ theme.description }}</div>
              </div>
            </label>
          </div>
        </div>

        <!-- Font Size -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Font Size
          </label>
          <div class="flex space-x-2">
            <label
              v-for="size in fontSizes"
              :key="size.value"
              class="flex-1 flex items-center justify-center p-2 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
              :class="{
                'border-blue-500 bg-blue-50': options.fontSize === size.value,
              }"
            >
              <input
                v-model="options.fontSize"
                :value="size.value"
                type="radio"
                class="sr-only"
              />
              <span class="text-sm font-medium">{{ size.name }}</span>
            </label>
          </div>
        </div>

        <!-- Options Checkboxes -->
        <div class="space-y-3">
          <label class="flex items-center space-x-2">
            <input
              v-model="options.includeStyles"
              type="checkbox"
              class="rounded text-blue-600 focus:ring-blue-500"
            />
            <span class="text-sm text-gray-700">Include CSS styles</span>
          </label>

          <label class="flex items-center space-x-2">
            <input
              v-model="options.includeTOC"
              type="checkbox"
              class="rounded text-blue-600 focus:ring-blue-500"
            />
            <span class="text-sm text-gray-700">Include table of contents</span>
          </label>

          <label class="flex items-center space-x-2">
            <input
              v-model="options.embedImages"
              type="checkbox"
              class="rounded text-blue-600 focus:ring-blue-500"
            />
            <span class="text-sm text-gray-700">Embed images as base64</span>
          </label>

          <label class="flex items-center space-x-2">
            <input
              v-model="options.addTimestamp"
              type="checkbox"
              class="rounded text-blue-600 focus:ring-blue-500"
            />
            <span class="text-sm text-gray-700">Add generation timestamp</span>
          </label>
        </div>
      </div>

      <div
        class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3"
      >
        <button
          @click="cancel"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          @click="confirm"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Export {{ exportType.toUpperCase() }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ExportOptions } from '../utils/advancedExport'

// Props
interface Props {
  visible?: boolean
  exportType: 'html' | 'pdf'
  defaultTitle?: string
  defaultAuthor?: string
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  exportType: 'html',
  defaultTitle: 'Markdown Document',
  defaultAuthor: '',
})

// Emits
const emit = defineEmits<{
  'update:visible': [visible: boolean]
  confirm: [options: ExportOptions]
  cancel: []
}>()

// State
const isVisible = ref(props.visible)

// Export options
const options = ref<ExportOptions>({
  title: props.defaultTitle,
  author: props.defaultAuthor,
  includeStyles: true,
  includeTOC: true,
  theme: props.exportType === 'pdf' ? 'academic' : 'default',
  fontSize: 'medium',
  embedImages: true,
  addTimestamp: true,
})

// Theme options
const themes = [
  {
    value: 'default',
    name: 'Default',
    description: 'Clean, professional styling',
  },
  {
    value: 'github',
    name: 'GitHub',
    description: 'GitHub-style markdown',
  },
  {
    value: 'academic',
    name: 'Academic',
    description: 'Formal document style',
  },
  {
    value: 'minimal',
    name: 'Minimal',
    description: 'Simple, clean design',
  },
]

// Font size options
const fontSizes = [
  { value: 'small', name: 'Small' },
  { value: 'medium', name: 'Medium' },
  { value: 'large', name: 'Large' },
]

// Methods
const handleBackdropClick = () => {
  cancel()
}

const cancel = () => {
  isVisible.value = false
  emit('cancel')
}

const confirm = () => {
  emit('confirm', { ...options.value })
  isVisible.value = false
}

// Watchers
watch(
  () => props.visible,
  (newVisible) => {
    isVisible.value = newVisible
    if (newVisible) {
      // Reset options when modal opens
      options.value = {
        title: props.defaultTitle,
        author: props.defaultAuthor,
        includeStyles: true,
        includeTOC: true,
        theme: props.exportType === 'pdf' ? 'academic' : 'default',
        fontSize: 'medium',
        embedImages: true,
        addTimestamp: true,
      }
    }
  }
)

watch(isVisible, (newVisible) => {
  emit('update:visible', newVisible)
})

watch(
  () => props.exportType,
  (newType) => {
    // Adjust default theme based on export type
    if (newType === 'pdf') {
      options.value.theme = 'academic'
    } else {
      options.value.theme = 'default'
    }
  }
)
</script>

<style scoped>
/* Modal animations could be added here if needed */
</style>
