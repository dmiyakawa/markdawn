<template>
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
        @toggle-find-replace="$emit('toggle-find-replace')"
        @scroll="handleEditorScroll"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import CodeMirrorEditor from './CodeMirrorEditor.vue'

// Props using defineProps with object syntax to avoid interface conflicts
const props = defineProps({
  markdownContent: {
    type: String,
    required: true,
  },
  showPreview: {
    type: Boolean,
    required: true,
  },
  leftPaneWidth: {
    type: Number,
    required: true,
  },
  isDragging: {
    type: Boolean,
    required: true,
  },
})

// Emits
const emit = defineEmits<{
  'update:markdownContent': [value: string]
  'toggle-find-replace': []
  scroll: [
    scrollInfo: {
      scrollTop: number
      scrollHeight: number
      clientHeight: number
    },
  ]
}>()

// Refs
const editorContainer = ref<HTMLElement>()
const codeMirrorEditor = ref<InstanceType<typeof CodeMirrorEditor>>()

// Computed for v-model
const markdownContent = computed({
  get: () => props.markdownContent,
  set: (value: string) => emit('update:markdownContent', value),
})

// Handle scroll events
const handleEditorScroll = (scrollInfo: {
  scrollTop: number
  scrollHeight: number
  clientHeight: number
}) => {
  emit('scroll', scrollInfo)
}

// Expose editor methods
const focus = () => codeMirrorEditor.value?.focus()
const getScrollInfo = () => codeMirrorEditor.value?.getScrollInfo()
const scrollToPosition = (position: number) =>
  codeMirrorEditor.value?.scrollToPosition(position)
const scrollToLine = (line: number) =>
  codeMirrorEditor.value?.scrollToLine(line)

defineExpose({
  focus,
  getScrollInfo,
  scrollToPosition,
  scrollToLine,
  editorContainer,
  codeMirrorEditor,
})
</script>
