<template>
  <div
    ref="editorContainer"
    class="w-full h-full codemirror-container"
    data-testid="codemirror-editor"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { EditorView, basicSetup } from 'codemirror'
import { keymap } from '@codemirror/view'
import { Prec } from '@codemirror/state'
import { markdown } from '@codemirror/lang-markdown'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorState } from '@codemirror/state'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import {
  searchKeymap,
  highlightSelectionMatches,
  SearchQuery,
  findNext,
  findPrevious,
  replaceNext,
  replaceAll,
} from '@codemirror/search'

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
  scroll: [
    scrollInfo: {
      scrollTop: number
      scrollHeight: number
      clientHeight: number
    },
  ]
}>()

// Template refs
const editorContainer = ref<HTMLDivElement>()

// State
let editorView: EditorView | null = null
let keydownHandler: ((event: KeyboardEvent) => void) | null = null
let pasteHandler: ((event: ClipboardEvent) => void) | null = null

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

// List indentation functions
const indentListItem = (view: EditorView): boolean => {
  const { state } = view
  const { selection } = state
  const line = state.doc.lineAt(selection.main.head)
  const lineText = line.text

  // Check if current line is a list item
  const listItemMatch = lineText.match(/^(\s*)([-*+]|\d+\.)\s/)
  if (listItemMatch) {
    const [, indent] = listItemMatch
    const newIndent = indent + '  ' // Add 2 spaces for indentation
    const newLineText = newIndent + lineText.slice(indent.length)

    view.dispatch({
      changes: {
        from: line.from,
        to: line.to,
        insert: newLineText,
      },
      selection: {
        anchor: selection.main.head + 2, // Move cursor 2 spaces right
      },
    })
    return true
  }

  // If not a list item, convert to list item
  const trimmedLine = lineText.trim()
  if (trimmedLine) {
    const leadingSpaces = lineText.match(/^\s*/)?.[0] || ''
    const newLineText = leadingSpaces + '- ' + trimmedLine

    view.dispatch({
      changes: {
        from: line.from,
        to: line.to,
        insert: newLineText,
      },
      selection: {
        anchor: line.from + leadingSpaces.length + 2 + trimmedLine.length,
      },
    })
    return true
  }

  return false
}

const unindentListItem = (view: EditorView): boolean => {
  const { state } = view
  const { selection } = state
  const line = state.doc.lineAt(selection.main.head)
  const lineText = line.text

  // Check if current line is a list item
  const listItemMatch = lineText.match(/^(\s*)([-*+]|\d+\.)\s/)
  if (listItemMatch) {
    const [, indent, marker] = listItemMatch

    if (indent.length >= 2) {
      // Remove 2 spaces of indentation
      const newIndent = indent.slice(2)
      const newLineText = newIndent + lineText.slice(indent.length)

      view.dispatch({
        changes: {
          from: line.from,
          to: line.to,
          insert: newLineText,
        },
        selection: {
          anchor: Math.max(
            line.from + newIndent.length + marker.length + 1,
            selection.main.head - 2
          ),
        },
      })
      return true
    } else if (indent.length === 0) {
      // Remove list marker entirely if no indentation
      const contentAfterMarker = lineText.slice(listItemMatch[0].length)

      view.dispatch({
        changes: {
          from: line.from,
          to: line.to,
          insert: contentAfterMarker,
        },
        selection: {
          anchor: line.from + contentAfterMarker.length,
        },
      })
      return true
    }
  }

  return false
}

// Initialize CodeMirror editor
const initializeEditor = async () => {
  if (!editorContainer.value) return

  // DOM event handler to prevent browser defaults and handle scroll
  const domEventHandlers = EditorView.domEventHandlers({
    keydown(event, view) {
      // Handle Tab key for list indentation
      if (event.key === 'Tab') {
        event.preventDefault()
        if (event.shiftKey) {
          // Shift+Tab: unindent list item
          unindentListItem(view)
        } else {
          // Tab: indent list item
          indentListItem(view)
        }
        return true
      }

      // Intercept emacs shortcuts before they reach the browser
      if (event.ctrlKey) {
        switch (event.key) {
          case 'n':
            event.preventDefault()
            moveToNextLine(view)
            return true
          case 'p':
            event.preventDefault()
            moveToPreviousLine(view)
            return true
          case 'a':
            event.preventDefault()
            moveToLineStart(view)
            return true
          case 'e':
            event.preventDefault()
            moveToLineEnd(view)
            return true
          case 'b':
            event.preventDefault()
            moveCharLeft(view)
            return true
          case 'f':
            event.preventDefault()
            moveCharRight(view)
            return true
          case 'k':
            event.preventDefault()
            killToLineEnd(view)
            return true
          case 'y':
            event.preventDefault()
            yankText(view)
            return true
          case 'h':
            event.preventDefault()
            toggleFindReplace(view)
            return true
        }
      }
      return false
    },
    scroll(event, view) {
      const scrollElement = view.scrollDOM
      emit('scroll', {
        scrollTop: scrollElement.scrollTop,
        scrollHeight: scrollElement.scrollHeight,
        clientHeight: scrollElement.clientHeight,
      })
      return false // Don't prevent default
    },
  })

  // Create editor state with extensions
  const extensions = [
    basicSetup,
    markdown(),
    EditorView.lineWrapping,
    highlightSelectionMatches(), // Highlight matching selections
    domEventHandlers,
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
    keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap]),
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

  // Add paste event listener for clipboard images
  pasteHandler = async (event: ClipboardEvent) => {
    if (!editorView || !event.clipboardData) return

    const items = Array.from(event.clipboardData.items)
    const imageItem = items.find((item) => item.type.startsWith('image/'))

    if (imageItem) {
      event.preventDefault()
      event.stopPropagation()

      try {
        const file = imageItem.getAsFile()
        if (!file) return

        // Import image processing utilities
        const {
          processImageForStorage,
          saveImageToStorage,
          generateImageMarkdown,
        } = await import('../utils/imageOperations')

        // Process and save the image
        const processedImage = await processImageForStorage(file)
        const saved = saveImageToStorage(processedImage)

        if (saved) {
          // Generate markdown for the image
          const imageMarkdown = generateImageMarkdown(processedImage)

          // Insert at current cursor position
          const selection = editorView.state.selection.main
          const needsNewlineBefore =
            selection.from > 0 &&
            !editorView.state.doc
              .sliceString(selection.from - 1, selection.from)
              .match(/\n/)
          const needsNewlineAfter =
            selection.to < editorView.state.doc.length &&
            !editorView.state.doc
              .sliceString(selection.to, selection.to + 1)
              .match(/\n/)

          const finalMarkdown = `${needsNewlineBefore ? '\n' : ''}${imageMarkdown}${needsNewlineAfter ? '\n' : ''}`

          editorView.dispatch({
            changes: {
              from: selection.from,
              to: selection.to,
              insert: finalMarkdown,
            },
            selection: {
              anchor: selection.from + finalMarkdown.length,
            },
          })

          // Emit the change
          emit('update:modelValue', editorView.state.doc.toString())
        }
      } catch (error) {
        console.error('Failed to process pasted image:', error)
      }
    }
  }

  // Add direct event listener to override browser shortcuts
  keydownHandler = (event: KeyboardEvent) => {
    // Only handle if editor is focused
    if (!editorView || !editorView.hasFocus) {
      return
    }

    // Handle Tab key for list indentation
    if (event.key === 'Tab') {
      event.preventDefault()
      event.stopPropagation()
      if (event.shiftKey) {
        // Shift+Tab: unindent list item
        unindentListItem(editorView)
      } else {
        // Tab: indent list item
        indentListItem(editorView)
      }
      return
    }

    if (event.ctrlKey) {
      switch (event.key) {
        case 'n':
          event.preventDefault()
          event.stopPropagation()
          moveToNextLine(editorView)
          break
        case 'p':
          event.preventDefault()
          event.stopPropagation()
          moveToPreviousLine(editorView)
          break
        case 'a':
          event.preventDefault()
          event.stopPropagation()
          moveToLineStart(editorView)
          break
        case 'e':
          event.preventDefault()
          event.stopPropagation()
          moveToLineEnd(editorView)
          break
        case 'b':
          event.preventDefault()
          event.stopPropagation()
          moveCharLeft(editorView)
          break
        case 'f':
          event.preventDefault()
          event.stopPropagation()
          moveCharRight(editorView)
          break
        case 'k':
          event.preventDefault()
          event.stopPropagation()
          killToLineEnd(editorView)
          break
        case 'y':
          event.preventDefault()
          event.stopPropagation()
          yankText(editorView)
          break
        case 'h':
          event.preventDefault()
          event.stopPropagation()
          toggleFindReplace(editorView)
          break
      }
    }
  }

  // Add event listener to document with capture = true for maximum override power
  document.addEventListener('keydown', keydownHandler, true)

  // Also add to container as fallback
  editorContainer.value.addEventListener('keydown', keydownHandler, true)

  // Add paste event listener for clipboard images
  editorContainer.value.addEventListener('paste', pasteHandler as EventListener)
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
onBeforeUnmount(() => {
  if (editorView) {
    editorView.destroy()
  }
  if (keydownHandler) {
    document.removeEventListener('keydown', keydownHandler, true)
    if (editorContainer.value) {
      editorContainer.value.removeEventListener('keydown', keydownHandler, true)
    }
  }
  if (pasteHandler && editorContainer.value) {
    editorContainer.value.removeEventListener(
      'paste',
      pasteHandler as EventListener
    )
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

// Search functionality
interface SearchOptions {
  caseSensitive?: boolean
  useRegex?: boolean
}

const performSearch = (query: string, options: SearchOptions = {}) => {
  if (!editorView || !query) return null

  const searchQuery = new SearchQuery({
    search: query,
    caseSensitive: options.caseSensitive || false,
    regexp: options.useRegex || false,
    replace: '',
  })

  // Set the search query in the editor
  // setSearchQuery(editorView, searchQuery)
  // TODO

  return searchQuery
}

const searchNext = (query: string, options: SearchOptions = {}) => {
  if (!editorView) return false

  const searchQuery = performSearch(query, options)
  if (!searchQuery) return false

  return findNext(editorView)
}

const searchPrevious = (query: string, options: SearchOptions = {}) => {
  if (!editorView) return false

  const searchQuery = performSearch(query, options)
  if (!searchQuery) return false

  return findPrevious(editorView)
}

const performReplace = (
  findText: string,
  replaceText: string,
  options: SearchOptions = {}
) => {
  if (!editorView || !findText) return false

  // Create search query for replacement
  new SearchQuery({
    search: findText,
    caseSensitive: options.caseSensitive || false,
    regexp: options.useRegex || false,
    replace: replaceText,
  })

  // TODO: Set the search query in the editor when setSearchQuery is available

  return replaceNext(editorView)
}

const performReplaceAll = (
  findText: string,
  replaceText: string,
  options: SearchOptions = {}
) => {
  if (!editorView || !findText) return false

  // Create search query for replacement
  new SearchQuery({
    search: findText,
    caseSensitive: options.caseSensitive || false,
    regexp: options.useRegex || false,
    replace: replaceText,
  })

  // TODO: Set the search query in the editor when setSearchQuery is available

  return replaceAll(editorView)
}

const clearSearch = () => {
  if (!editorView) return

  // setSearchQuery(editorView, new SearchQuery({ search: '', replace: '' }))
}

const scrollToPosition = (scrollTop: number) => {
  if (!editorView) return

  editorView.scrollDOM.scrollTop = scrollTop
}

const getScrollInfo = () => {
  if (!editorView) return null

  const scrollElement = editorView.scrollDOM
  return {
    scrollTop: scrollElement.scrollTop,
    scrollHeight: scrollElement.scrollHeight,
    clientHeight: scrollElement.clientHeight,
  }
}

defineExpose({
  focus,
  getSelection,
  insertText,
  replaceSelection,
  searchNext,
  searchPrevious,
  performReplace,
  performReplaceAll,
  clearSearch,
  scrollToPosition,
  getScrollInfo,
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
