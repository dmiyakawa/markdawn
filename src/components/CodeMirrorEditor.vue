<template>
  <div
    ref="editorContainer"
    class="w-full h-full codemirror-container"
    data-testid="codemirror-editor"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { EditorView, basicSetup } from 'codemirror'
import { keymap } from '@codemirror/view'
import { Prec } from '@codemirror/state'
import { markdown } from '@codemirror/lang-markdown'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorState } from '@codemirror/state'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'

// Props and emits
interface Props {
  modelValue: string
  placeholder?: string
  darkMode?: boolean
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Start typing your markdown here...',
  darkMode: false,
  readonly: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'toggle-find-replace': []
}>()

// Template refs
const editorContainer = ref<HTMLDivElement>()

// State
let editorView: EditorView | null = null

// Kill ring for emacs-like yank functionality
let killRing = ''

// Emacs-like command functions
const moveToLineStart = (view: EditorView) => {
  const { selection } = view.state
  const line = view.state.doc.lineAt(selection.main.head)
  view.dispatch({
    selection: { anchor: line.from },
  })
  return true
}

const moveToLineEnd = (view: EditorView) => {
  const { selection } = view.state
  const line = view.state.doc.lineAt(selection.main.head)
  view.dispatch({
    selection: { anchor: line.to },
  })
  return true
}

const killToLineEnd = (view: EditorView) => {
  const { selection } = view.state
  const { head } = selection.main
  const line = view.state.doc.lineAt(head)
  const from = head
  const to = line.to

  if (from < to) {
    killRing = view.state.doc.sliceString(from, to)
    view.dispatch({
      changes: { from, to },
      selection: { anchor: from },
    })
  }
  return true
}

const yankText = (view: EditorView) => {
  if (killRing) {
    const { selection } = view.state
    const { head } = selection.main
    view.dispatch({
      changes: { from: head, insert: killRing },
      selection: { anchor: head + killRing.length },
    })
  }
  return true
}

const moveCharLeft = (view: EditorView) => {
  const { selection } = view.state
  const { head } = selection.main
  if (head > 0) {
    view.dispatch({
      selection: { anchor: head - 1 },
    })
  }
  return true
}

const moveCharRight = (view: EditorView) => {
  const { selection } = view.state
  const { head } = selection.main
  const docLength = view.state.doc.length
  if (head < docLength) {
    view.dispatch({
      selection: { anchor: head + 1 },
    })
  }
  return true
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const toggleFindReplace = (view: EditorView) => {
  emit('toggle-find-replace')
  return true
}

const moveToNextLine = (view: EditorView) => {
  const { selection } = view.state
  const { head } = selection.main
  const currentLine = view.state.doc.lineAt(head)

  // If not on last line, move to next line
  if (currentLine.number < view.state.doc.lines) {
    const nextLine = view.state.doc.line(currentLine.number + 1)
    const currentCol = head - currentLine.from
    const newPos = Math.min(nextLine.from + currentCol, nextLine.to)

    view.dispatch({
      selection: { anchor: newPos },
    })
  }
  return true
}

const moveToPreviousLine = (view: EditorView) => {
  const { selection } = view.state
  const { head } = selection.main
  const currentLine = view.state.doc.lineAt(head)

  // If not on first line, move to previous line
  if (currentLine.number > 1) {
    const prevLine = view.state.doc.line(currentLine.number - 1)
    const currentCol = head - currentLine.from
    const newPos = Math.min(prevLine.from + currentCol, prevLine.to)

    view.dispatch({
      selection: { anchor: newPos },
    })
  }
  return true
}

// Initialize CodeMirror editor
const initializeEditor = async () => {
  if (!editorContainer.value) return

  // Create editor state with extensions
  const extensions = [
    basicSetup,
    markdown(),
    Prec.highest(
      keymap.of([
        // Emacs-like keyboard shortcuts with highest precedence
        {
          key: 'Ctrl-a',
          run: moveToLineStart,
          preventDefault: true,
        },
        {
          key: 'Ctrl-e',
          run: moveToLineEnd,
          preventDefault: true,
        },
        {
          key: 'Ctrl-k',
          run: killToLineEnd,
          preventDefault: true,
        },
        {
          key: 'Ctrl-y',
          run: yankText,
          preventDefault: true,
        },
        {
          key: 'Ctrl-b',
          run: moveCharLeft,
          preventDefault: true,
        },
        {
          key: 'Ctrl-f',
          run: moveCharRight,
          preventDefault: true,
        },
        {
          key: 'Ctrl-h',
          run: toggleFindReplace,
          preventDefault: true,
        },
        {
          key: 'Ctrl-n',
          run: moveToNextLine,
          preventDefault: true,
        },
        {
          key: 'Ctrl-p',
          run: moveToPreviousLine,
          preventDefault: true,
        },
      ])
    ),
    keymap.of([...defaultKeymap, ...historyKeymap]),
    history(),
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const newValue = update.state.doc.toString()
        if (newValue !== props.modelValue) {
          emit('update:modelValue', newValue)
        }
      }
    }),
    EditorView.theme({
      '&': {
        fontSize: '14px',
        fontFamily:
          'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
      },
      '.cm-focused': {
        outline: 'none',
      },
      '.cm-editor': {
        height: '100%',
      },
      '.cm-scroller': {
        height: '100%',
        fontFamily: 'inherit',
      },
      '.cm-content': {
        padding: '16px',
        minHeight: '100%',
      },
      '.cm-line': {
        lineHeight: '1.6',
      },
    }),
  ]

  // Add dark theme if enabled
  if (props.darkMode) {
    extensions.push(oneDark)
  }

  // Create editor state
  const state = EditorState.create({
    doc: props.modelValue,
    extensions,
  })

  // Create editor view
  editorView = new EditorView({
    state,
    parent: editorContainer.value,
  })
}

// Update editor content when prop changes
const updateEditorContent = (newValue: string) => {
  if (!editorView) return

  const currentValue = editorView.state.doc.toString()
  if (currentValue !== newValue) {
    editorView.dispatch({
      changes: {
        from: 0,
        to: editorView.state.doc.length,
        insert: newValue,
      },
    })
  }
}

// Watch for prop changes
watch(
  () => props.modelValue,
  (newValue) => {
    updateEditorContent(newValue)
  }
)

watch(
  () => props.darkMode,
  async () => {
    // Reinitialize editor with new theme
    if (editorView) {
      editorView.destroy()
      editorView = null
    }
    await nextTick()
    await initializeEditor()
  }
)

// Lifecycle hooks
onMounted(async () => {
  await nextTick()
  await initializeEditor()
})

// Cleanup
import { onBeforeUnmount } from 'vue'
onBeforeUnmount(() => {
  if (editorView) {
    editorView.destroy()
  }
})

// Expose methods for parent component
const focus = () => {
  if (editorView) {
    editorView.focus()
  }
}

const getSelection = () => {
  if (!editorView) return { from: 0, to: 0 }

  const selection = editorView.state.selection.main
  return {
    from: selection.from,
    to: selection.to,
  }
}

const insertText = (text: string) => {
  if (!editorView) return

  const selection = editorView.state.selection.main
  editorView.dispatch({
    changes: {
      from: selection.from,
      to: selection.to,
      insert: text,
    },
    selection: {
      anchor: selection.from + text.length,
    },
  })
}

const replaceSelection = (text: string) => {
  if (!editorView) return

  const selection = editorView.state.selection.main
  editorView.dispatch({
    changes: {
      from: selection.from,
      to: selection.to,
      insert: text,
    },
    selection: {
      anchor: selection.from + text.length,
    },
  })
}

defineExpose({
  focus,
  getSelection,
  insertText,
  replaceSelection,
})
</script>

<style scoped>
.codemirror-container {
  /* Ensure proper height and overflow handling */
  overflow: hidden;
}

.codemirror-container :deep(.cm-editor) {
  height: 100%;
  border: none;
  outline: none;
}

.codemirror-container :deep(.cm-focused) {
  outline: none !important;
}
</style>
