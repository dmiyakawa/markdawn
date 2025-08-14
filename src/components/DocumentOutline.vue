<template>
  <div
    id="document-outline"
    v-show="isVisible"
    class="document-outline bg-white border-l border-gray-200 w-64 flex-shrink-0 overflow-y-auto"
    data-testid="document-outline"
  >
    <div class="p-4">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-medium text-gray-900">Outline</h3>
        <button
          @click="hide"
          class="text-gray-400 hover:text-gray-600 text-sm"
          title="Close outline"
        >
          ✕
        </button>
      </div>

      <div v-if="headings.length === 0" class="text-sm text-gray-500 italic">
        No headings found
      </div>

      <nav v-else class="space-y-1">
        <div
          v-for="heading in headings"
          :key="heading.id"
          :class="[
            'block text-sm cursor-pointer rounded px-2 py-1 hover:bg-gray-100 transition-colors',
            {
              'text-blue-600 bg-blue-50': heading.id === activeHeadingId,
              'text-gray-700': heading.id !== activeHeadingId,
              'font-medium': heading.level === 1,
              'font-normal': heading.level > 1,
              'pl-2': heading.level === 1,
              'pl-4': heading.level === 2,
              'pl-6': heading.level === 3,
              'pl-8': heading.level === 4,
              'pl-10': heading.level === 5,
              'pl-12': heading.level === 6,
            },
          ]"
          @click="scrollToHeading(heading)"
        >
          <span class="text-xs text-gray-400 mr-2">H{{ heading.level }}</span>
          <span>{{ heading.title }}</span>
        </div>
      </nav>

      <div
        v-if="headings.length > 0"
        class="mt-4 pt-4 border-t border-gray-200"
      >
        <div class="text-xs text-gray-500 space-y-1">
          <div>
            {{ headings.length }} heading{{ headings.length === 1 ? '' : 's' }}
          </div>
          <div>{{ words }} words</div>
          <div>{{ readingTime }} min read</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

// Types
interface Heading {
  id: string
  level: number
  title: string
  line: number
  position: number
}

// Props
interface Props {
  markdownContent: string
  visible?: boolean
  wordCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  wordCount: 0,
})

// Emits
const emit = defineEmits<{
  'update:visible': [visible: boolean]
  'scroll-to-line': [line: number]
  'scroll-to-position': [position: number]
}>()

// State
const isVisible = ref(props.visible)
const activeHeadingId = ref<string>('')

// Computed
const headings = computed(() => {
  return extractHeadings(props.markdownContent)
})

const words = computed(() => {
  return props.wordCount || 0
})

const readingTime = computed(() => {
  // Assume average reading speed of 200 words per minute
  return Math.max(1, Math.ceil(words.value / 200))
})

// Methods
const extractHeadings = (content: string): Heading[] => {
  const headings: Heading[] = []
  const lines = content.split('\n')
  let position = 0

  lines.forEach((line, lineIndex) => {
    // Match ATX headings (# ## ### etc.)
    const match = line.match(/^(#{1,6})\s+(.+)$/)
    if (match) {
      const level = match[1].length
      const title = match[2].trim()
      const id = generateHeadingId(title, headings.length)

      headings.push({
        id,
        level,
        title,
        line: lineIndex + 1, // 1-indexed
        position,
      })
    }

    position += line.length + 1 // +1 for newline
  })

  return headings
}

const generateHeadingId = (title: string, index: number): string => {
  // Create a URL-friendly id from the title
  const baseId = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens

  return baseId || `heading-${index + 1}`
}

const scrollToHeading = (heading: Heading) => {
  activeHeadingId.value = heading.id
  emit('scroll-to-line', heading.line)
  emit('scroll-to-position', heading.position)
}

const hide = () => {
  isVisible.value = false
}

const show = () => {
  isVisible.value = true
}

const setActiveHeading = (headingId: string) => {
  activeHeadingId.value = headingId
}

const getHeadingByLine = (line: number): Heading | null => {
  // Find the heading that is at or before the given line
  const sortedHeadings = [...headings.value].sort((a, b) => a.line - b.line)

  for (let i = sortedHeadings.length - 1; i >= 0; i--) {
    if (sortedHeadings[i].line <= line) {
      return sortedHeadings[i]
    }
  }

  return null
}

const updateActiveHeadingByLine = (line: number) => {
  const heading = getHeadingByLine(line)
  if (heading) {
    activeHeadingId.value = heading.id
  }
}

// Watchers
watch(
  () => props.visible,
  (newVisible) => {
    isVisible.value = newVisible
  }
)

watch(isVisible, (newVisible) => {
  emit('update:visible', newVisible)
})

// Expose methods for parent component
defineExpose({
  show,
  hide,
  setActiveHeading,
  updateActiveHeadingByLine,
  headings: headings.value,
})
</script>

<style scoped>
.document-outline {
  max-height: 100vh;
}

/* Custom scrollbar */
.document-outline::-webkit-scrollbar {
  width: 6px;
}

.document-outline::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.document-outline::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.document-outline::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
