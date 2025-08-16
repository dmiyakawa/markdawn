<template>
  <div
    id="find-replace-panel"
    v-show="isVisible"
    class="bg-gray-50 border-b border-gray-200 px-4 py-2"
    data-testid="find-replace-panel"
  >
    <div class="flex flex-wrap items-center gap-2">
      <!-- Find Input -->
      <div class="flex items-center space-x-2">
        <label for="find-input" class="text-sm font-medium text-gray-700">
          Find:
        </label>
        <input
          id="find-input"
          ref="findInputRef"
          v-model="findText"
          @keydown.enter="findNext"
          @keydown.escape="hide"
          class="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Search text..."
          type="text"
        />
        <div class="flex space-x-1">
          <button
            @click="findPrevious"
            :disabled="!findText"
            class="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Find previous (Shift+Enter)"
          >
            ↑
          </button>
          <button
            @click="findNext"
            :disabled="!findText"
            class="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Find next (Enter)"
          >
            ↓
          </button>
        </div>
        <span v-if="findText && searchResults" class="text-xs text-gray-600">
          {{ searchResults.current }}/{{ searchResults.total }}
        </span>
      </div>

      <!-- Replace Input -->
      <div class="flex items-center space-x-2">
        <label for="replace-input" class="text-sm font-medium text-gray-700">
          Replace:
        </label>
        <input
          id="replace-input"
          v-model="replaceText"
          @keydown.enter="replaceNext"
          @keydown.escape="hide"
          class="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Replace with..."
          type="text"
        />
        <div class="flex space-x-1">
          <button
            @click="replaceNext"
            :disabled="!findText"
            class="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Replace current match"
          >
            Replace
          </button>
          <button
            @click="replaceAll"
            :disabled="!findText"
            class="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Replace all matches"
          >
            All
          </button>
        </div>
      </div>

      <!-- Options -->
      <div class="flex items-center space-x-2">
        <label class="flex items-center text-sm">
          <input v-model="caseSensitive" type="checkbox" class="mr-1" />
          Case sensitive
        </label>
        <label class="flex items-center text-sm">
          <input v-model="useRegex" type="checkbox" class="mr-1" />
          Regex
        </label>
      </div>

      <!-- Close Button -->
      <button
        @click="hide"
        class="ml-auto px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        title="Close (Escape)"
      >
        ✕
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

// Props
interface Props {
  visible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
})

// Emits
const emit = defineEmits<{
  'update:visible': [visible: boolean]
  'find-next': [text: string, options: SearchOptions]
  'find-previous': [text: string, options: SearchOptions]
  'replace-next': [
    findText: string,
    replaceText: string,
    options: SearchOptions,
  ]
  'replace-all': [findText: string, replaceText: string, options: SearchOptions]
}>()

// Search options interface
interface SearchOptions {
  caseSensitive: boolean
  useRegex: boolean
}

interface SearchResults {
  current: number
  total: number
}

// State
const isVisible = ref(props.visible)
const findText = ref('')
const replaceText = ref('')
const caseSensitive = ref(false)
const useRegex = ref(false)
const searchResults = ref<SearchResults | null>(null)

// Template refs
const findInputRef = ref<HTMLInputElement>()

// Watch for props changes
watch(
  () => props.visible,
  (newVisible) => {
    isVisible.value = newVisible
    if (newVisible) {
      nextTick(() => {
        findInputRef.value?.focus()
      })
    }
  }
)

watch(isVisible, (newVisible) => {
  emit('update:visible', newVisible)
  if (!newVisible) {
    // Clear search results when hiding
    searchResults.value = null
  }
})

// Methods
const getSearchOptions = (): SearchOptions => ({
  caseSensitive: caseSensitive.value,
  useRegex: useRegex.value,
})

const findNext = () => {
  if (!findText.value) return
  emit('find-next', findText.value, getSearchOptions())
}

const findPrevious = () => {
  if (!findText.value) return
  emit('find-previous', findText.value, getSearchOptions())
}

const replaceNext = () => {
  if (!findText.value) return
  emit('replace-next', findText.value, replaceText.value, getSearchOptions())
}

const replaceAll = () => {
  if (!findText.value) return
  emit('replace-all', findText.value, replaceText.value, getSearchOptions())
}

const hide = () => {
  isVisible.value = false
}

const show = () => {
  isVisible.value = true
}

const updateSearchResults = (current: number, total: number) => {
  searchResults.value = { current, total }
}

// Expose methods for parent component
defineExpose({
  show,
  hide,
  updateSearchResults,
  focus: () => findInputRef.value?.focus(),
})
</script>
