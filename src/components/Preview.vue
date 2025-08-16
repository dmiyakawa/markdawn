<template>
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
      class="px-3 border-b border-gray-200 bg-gray-50 rounded-t-lg flex items-center min-h-8"
    >
      <h3 class="text-sm font-medium text-gray-700">
        {{ isWysiwygMode ? 'WYSIWYG Editor' : 'Preview' }}
      </h3>
      <button
        @click="$emit('toggle-wysiwyg-mode')"
        :class="[
          'ml-2 px-2 py-1 text-xs rounded transition-colors duration-200',
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
    <div class="flex-1 overflow-hidden">
      <div
        ref="wysiwygScrollContainer"
        class="h-full overflow-auto"
        style="padding: 0 16px"
        @scroll="$emit('wysiwyg-scroll', $event)"
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
          @input="$emit('wysiwyg-input', $event)"
          @blur="$emit('wysiwyg-blur')"
          @paste="$emit('wysiwyg-paste', $event)"
          v-html="htmlContent"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'

// Component name for linting
defineOptions({
  name: 'PreviewPanel',
})

// Props using defineProps with object syntax to avoid interface conflicts
const props = defineProps({
  showPreview: {
    type: Boolean,
    required: true,
  },
  leftPaneWidth: {
    type: Number,
    required: true,
  },
  isWysiwygMode: {
    type: Boolean,
    required: true,
  },
  htmlContent: {
    type: String,
    required: true,
  },
})

// Emits
const emit = defineEmits<{
  'toggle-wysiwyg-mode': []
  'wysiwyg-scroll': [event: Event]
  'wysiwyg-input': [event: Event]
  'wysiwyg-blur': []
  'wysiwyg-paste': [event: ClipboardEvent]
  'content-updated': []
}>()

// Refs
const wysiwygScrollContainer = ref<HTMLElement>()
const wysiwygEditor = ref<HTMLElement>()

// Expose methods
const getScrollInfo = () => {
  if (!wysiwygScrollContainer.value)
    return { scrollTop: 0, scrollHeight: 0, clientHeight: 0 }

  const container = wysiwygScrollContainer.value
  return {
    scrollTop: container.scrollTop,
    scrollHeight: container.scrollHeight,
    clientHeight: container.clientHeight,
  }
}

const scrollToPercentage = (percentage: number) => {
  if (!wysiwygScrollContainer.value) return

  const container = wysiwygScrollContainer.value
  const maxScroll = container.scrollHeight - container.clientHeight
  container.scrollTop = maxScroll * (percentage / 100)
}

const focus = () => {
  if (wysiwygEditor.value && props.isWysiwygMode) {
    wysiwygEditor.value.focus()
  }
}

// Image resize functionality
const addResizeHandlesToImages = () => {
  if (!wysiwygEditor.value || !props.isWysiwygMode) return

  const images = wysiwygEditor.value.querySelectorAll('img')
  images.forEach(addResizeHandlesToImage)
}

const addResizeHandlesToImage = (img: HTMLImageElement) => {
  // Check if already has handles
  if (img.parentElement?.classList.contains('image-with-handles')) {
    return
  }

  // Create wrapper
  const wrapper = document.createElement('div')
  wrapper.className = 'image-with-handles'

  // Insert wrapper before image
  img.parentNode?.insertBefore(wrapper, img)
  wrapper.appendChild(img)

  // Create resize handles
  const handles = ['top-left', 'top-right', 'bottom-left', 'bottom-right']
  handles.forEach((position) => {
    const handle = document.createElement('div')
    handle.className = `image-resize-handle ${position}`
    handle.addEventListener('mousedown', (e) => startResize(e, img, position))
    wrapper.appendChild(handle)
  })
}

const startResize = (
  e: MouseEvent,
  img: HTMLImageElement,
  position: string
) => {
  e.preventDefault()
  e.stopPropagation()

  const wrapper = img.parentElement!
  wrapper.classList.add('resizing')

  const startX = e.clientX
  const startY = e.clientY
  const startWidth = img.offsetWidth
  const startHeight = img.offsetHeight
  const aspectRatio = startWidth / startHeight

  const handleMouseMove = (e: MouseEvent) => {
    const deltaX = e.clientX - startX
    const deltaY = e.clientY - startY

    let newWidth = startWidth
    let newHeight = startHeight

    // Calculate new dimensions based on handle position
    switch (position) {
      case 'bottom-right':
        newWidth = Math.max(50, startWidth + deltaX)
        newHeight = Math.max(50, startHeight + deltaY)
        break
      case 'bottom-left':
        newWidth = Math.max(50, startWidth - deltaX)
        newHeight = Math.max(50, startHeight + deltaY)
        break
      case 'top-right':
        newWidth = Math.max(50, startWidth + deltaX)
        newHeight = Math.max(50, startHeight - deltaY)
        break
      case 'top-left':
        newWidth = Math.max(50, startWidth - deltaX)
        newHeight = Math.max(50, startHeight - deltaY)
        break
    }

    // Maintain aspect ratio
    if (e.shiftKey) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        newHeight = newWidth / aspectRatio
      } else {
        newWidth = newHeight * aspectRatio
      }
    }

    // Apply new dimensions
    img.style.width = `${newWidth}px`
    img.style.height = `${newHeight}px`

    // Update data attributes for markdown conversion
    img.setAttribute('data-width', `${Math.round(newWidth)}px`)
    img.setAttribute('data-height', `${Math.round(newHeight)}px`)
  }

  const handleMouseUp = () => {
    wrapper.classList.remove('resizing')
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)

    // Emit content updated to trigger markdown sync
    emit('content-updated')
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

// Watch for content changes to add resize handles
watch(
  () => props.htmlContent,
  () => {
    if (props.isWysiwygMode) {
      nextTick(() => {
        addResizeHandlesToImages()
      })
    }
  },
  { flush: 'post' }
)

watch(
  () => props.isWysiwygMode,
  (newValue) => {
    if (newValue) {
      nextTick(() => {
        addResizeHandlesToImages()
      })
    }
  }
)

onMounted(() => {
  if (props.isWysiwygMode) {
    nextTick(() => {
      addResizeHandlesToImages()
    })
  }
})

defineExpose({
  getScrollInfo,
  scrollToPercentage,
  focus,
  wysiwygScrollContainer,
  wysiwygEditor,
})
</script>

<style scoped>
.wysiwyg-editor {
  min-height: 100%;
  padding: 16px;
  line-height: 1.6;
}

.wysiwyg-editor:focus {
  outline: none;
}

/* Ensure proper styling for WYSIWYG content */
.wysiwyg-editor p {
  margin-bottom: 1em;
}

.wysiwyg-editor h1,
.wysiwyg-editor h2,
.wysiwyg-editor h3,
.wysiwyg-editor h4,
.wysiwyg-editor h5,
.wysiwyg-editor h6 {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

.wysiwyg-editor ul,
.wysiwyg-editor ol {
  margin-bottom: 1em;
  padding-left: 2em;
}

.wysiwyg-editor blockquote {
  margin: 1em 0;
  padding-left: 1em;
  border-left: 4px solid #e5e7eb;
}

.wysiwyg-editor code {
  background-color: #f3f4f6;
  padding: 0.125em 0.25em;
  border-radius: 0.25rem;
  font-size: 0.875em;
}

.wysiwyg-editor pre {
  background-color: #f3f4f6;
  padding: 1em;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1em 0;
}

.wysiwyg-editor img {
  max-width: 100%;
  height: auto;
  margin: 1em 0;
}
</style>
