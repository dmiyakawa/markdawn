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
          @input="handleInput"
          @blur="handleBlur"
          @paste="$emit('wysiwyg-paste', $event)"
          @focus="handleFocus"
          @keydown="handleKeydown"
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

// Track editing state to avoid DOM conflicts
const handleInput = (event: Event) => {
  isUserEditing = true
  emit('wysiwyg-input', event)

  // Reset editing flag after a delay to allow for DOM updates
  setTimeout(() => {
    isUserEditing = false
  }, 100)
}

const handleBlur = () => {
  isUserEditing = false
  emit('wysiwyg-blur')

  // Add resize handles after editing is complete
  if (props.isWysiwygMode) {
    nextTick(() => {
      addResizeHandlesToImages()
    })
  }
}

const handleFocus = () => {
  isUserEditing = false
}

const handleKeydown = () => {
  isUserEditing = true
}

// Image resize functionality
const addResizeHandlesToImages = () => {
  if (!wysiwygEditor.value || !props.isWysiwygMode) return

  const images = wysiwygEditor.value.querySelectorAll('img')
  images.forEach(addResizeHandlesToImage)
}

const positionHandle = (
  handle: HTMLElement,
  img: HTMLImageElement,
  position: string
) => {
  const rect = img.getBoundingClientRect()
  const parentRect = img.offsetParent?.getBoundingClientRect() || {
    left: 0,
    top: 0,
  }

  const left = rect.left - parentRect.left + (img.offsetParent?.scrollLeft || 0)
  const top = rect.top - parentRect.top + (img.offsetParent?.scrollTop || 0)

  switch (position) {
    case 'top-left':
      handle.style.left = `${left - 6}px`
      handle.style.top = `${top - 6}px`
      break
    case 'top-right':
      handle.style.left = `${left + img.offsetWidth - 6}px`
      handle.style.top = `${top - 6}px`
      break
    case 'bottom-left':
      handle.style.left = `${left - 6}px`
      handle.style.top = `${top + img.offsetHeight - 6}px`
      break
    case 'bottom-right':
      handle.style.left = `${left + img.offsetWidth - 6}px`
      handle.style.top = `${top + img.offsetHeight - 6}px`
      break
  }
}

const updateHandlePositions = (img: HTMLImageElement) => {
  if (!img.hasAttribute('data-has-handles')) return

  const parent = img.parentElement
  if (!parent) return

  const handles = parent.querySelectorAll(`[data-for-image="${img.src}"]`)
  handles.forEach((handle) => {
    const position = handle.className.match(
      /top-left|top-right|bottom-left|bottom-right/
    )?.[0]
    if (position && handle instanceof HTMLElement) {
      positionHandle(handle, img, position)
    }
  })
}

const removeAllResizeHandles = () => {
  if (!wysiwygEditor.value) return

  // Remove all handle elements
  const handles = wysiwygEditor.value.querySelectorAll(
    '[data-image-handle="true"]'
  )
  handles.forEach((handle) => handle.remove())

  // Clean up images
  const images = wysiwygEditor.value.querySelectorAll('img[data-has-handles]')
  images.forEach((imgElement) => {
    const img = imgElement as HTMLImageElement
    img.removeAttribute('data-has-handles')
    img.style.position = ''
    img.style.display = ''

    // Clean up observer
    const observer = (
      img as HTMLImageElement & { _handleObserver?: MutationObserver }
    )._handleObserver
    if (observer) {
      observer.disconnect()
      delete (img as HTMLImageElement & { _handleObserver?: MutationObserver })
        ._handleObserver
    }
  })
}

const addResizeHandlesToImage = (img: HTMLImageElement) => {
  // Check if already has handles
  if (img.hasAttribute('data-has-handles')) {
    return
  }

  // Skip if image is inside a code block or other non-editable content
  const codeBlock = img.closest('.enhanced-code-block, pre, code')
  if (codeBlock) {
    return
  }

  // Mark image as having handles to avoid duplicates
  img.setAttribute('data-has-handles', 'true')

  // Make image relatively positioned to allow absolute positioning of handles
  img.style.position = 'relative'
  img.style.display = 'inline-block'

  // Create resize handles as siblings (not in a wrapper)
  const parent = img.parentElement!
  const handles = ['top-left', 'top-right', 'bottom-left', 'bottom-right']

  handles.forEach((position) => {
    const handle = document.createElement('div')
    handle.className = `image-resize-handle ${position}`
    handle.setAttribute('data-image-handle', 'true')
    handle.setAttribute('data-for-image', img.src || '')
    handle.style.position = 'absolute'
    handle.addEventListener('mousedown', (e) => startResize(e, img, position))

    // Position handles relative to the image
    positionHandle(handle, img, position)

    // Insert handle right after the image
    parent.insertBefore(handle, img.nextSibling)
  })

  // Add event listeners to update handle positions when image moves
  const observer = new MutationObserver(() => {
    updateHandlePositions(img)
  })
  observer.observe(parent, { childList: true, subtree: true })

  // Store observer reference for cleanup
  ;(
    img as HTMLImageElement & { _handleObserver?: MutationObserver }
  )._handleObserver = observer
}

const startResize = (
  e: MouseEvent,
  img: HTMLImageElement,
  position: string
) => {
  e.preventDefault()
  e.stopPropagation()

  // Add resizing class to image
  img.classList.add('resizing')

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

    // Update handle positions
    updateHandlePositions(img)
  }

  const handleMouseUp = () => {
    img.classList.remove('resizing')
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)

    // Emit content updated to trigger markdown sync
    emit('content-updated')
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

// Watch for content changes to add resize handles
// Only when not actively editing to avoid DOM conflicts
let isUserEditing = false
watch(
  () => props.htmlContent,
  () => {
    if (props.isWysiwygMode && !isUserEditing) {
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
    } else {
      // Remove resize handles when switching out of WYSIWYG mode
      removeAllResizeHandles()
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
