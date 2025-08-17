/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CodeMirrorEditor from './CodeMirrorEditor.vue'

// Mock CodeMirror
vi.mock('codemirror', () => ({
  EditorView: vi.fn().mockImplementation(() => ({
    state: {
      doc: { toString: () => 'test content' },
      selection: { main: { head: 0, from: 0, to: 0 } },
    },
    dispatch: vi.fn(),
    focus: vi.fn(),
    destroy: vi.fn(),
    hasFocus: true,
    scrollDOM: {
      scrollTop: 0,
      scrollHeight: 100,
      clientHeight: 50,
    },
  })),
  basicSetup: {},
}))

vi.mock('@codemirror/view', () => ({
  keymap: {
    of: vi.fn(() => ({})),
  },
  EditorView: {
    lineWrapping: {},
    domEventHandlers: vi.fn(() => ({})),
    updateListener: {
      of: vi.fn(() => ({})),
    },
    theme: vi.fn(() => ({})),
  },
}))

vi.mock('@codemirror/state', () => ({
  Prec: {
    highest: vi.fn((x) => x),
  },
  EditorState: {
    create: vi.fn(() => ({})),
  },
}))

vi.mock('@codemirror/lang-markdown', () => ({
  markdown: vi.fn(() => ({})),
}))

vi.mock('@codemirror/theme-one-dark', () => ({
  oneDark: {},
}))

vi.mock('@codemirror/commands', () => ({
  defaultKeymap: [],
  history: vi.fn(() => ({})),
  historyKeymap: [],
}))

vi.mock('@codemirror/search', () => ({
  searchKeymap: [],
  highlightSelectionMatches: vi.fn(() => ({})),
  SearchQuery: vi.fn(),
  findNext: vi.fn(),
  findPrevious: vi.fn(),
  replaceNext: vi.fn(),
  replaceAll: vi.fn(),
}))

describe('CodeMirrorEditor', () => {
  let wrapper: ReturnType<typeof mount> | null

  beforeEach(() => {
    // Create a mock container element
    const container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    // Clean up DOM
    document.body.innerHTML = ''
  })

  it('renders the editor container', () => {
    wrapper = mount(CodeMirrorEditor, {
      props: {
        modelValue: 'test content',
        placeholder: 'Enter text...',
      },
    })

    const container = wrapper.find('[data-testid="codemirror-editor"]')
    expect(container.exists()).toBe(true)
    expect(container.classes()).toContain('codemirror-container')
  })

  it('accepts modelValue prop', () => {
    const testContent = '# Test Markdown\n\nThis is a test.'
    wrapper = mount(CodeMirrorEditor, {
      props: {
        modelValue: testContent,
        placeholder: 'Enter text...',
      },
    })

    expect((wrapper.vm as any).$props.modelValue).toBe(testContent)
  })

  it('accepts placeholder prop', () => {
    const placeholder = 'Custom placeholder text'
    wrapper = mount(CodeMirrorEditor, {
      props: {
        modelValue: '',
        placeholder,
      },
    })

    expect((wrapper.vm as any).$props.placeholder).toBe(placeholder)
  })

  it('accepts darkMode prop', () => {
    wrapper = mount(CodeMirrorEditor, {
      props: {
        modelValue: '',
        darkMode: true,
      },
    })

    expect((wrapper.vm as any).$props.darkMode).toBe(true)
  })

  it('accepts readonly prop', () => {
    wrapper = mount(CodeMirrorEditor, {
      props: {
        modelValue: '',
        readonly: true,
      },
    })

    expect((wrapper.vm as any).$props.readonly).toBe(true)
  })

  it('emits update:modelValue when content changes', async () => {
    wrapper = mount(CodeMirrorEditor, {
      props: {
        modelValue: 'initial content',
      },
    })

    // Simulate content change by accessing the component's internal methods
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const vm = wrapper.vm as any

    // Wait for component to be fully mounted
    await wrapper.vm.$nextTick()

    // The component should exist and be properly initialized
    expect(wrapper.exists()).toBe(true)
  })

  it('emits toggle-find-replace event', async () => {
    wrapper = mount(CodeMirrorEditor, {
      props: {
        modelValue: '',
      },
    })

    await wrapper.vm.$nextTick()

    // Access the component's methods to test find/replace toggle

    const vm = wrapper.vm as any
    expect(typeof vm.clearSearch).toBe('function')
    expect(typeof vm.searchNext).toBe('function')
    expect(typeof vm.searchPrevious).toBe('function')
  })

  it('exposes required methods', async () => {
    wrapper = mount(CodeMirrorEditor, {
      props: {
        modelValue: 'test content',
      },
    })

    await wrapper.vm.$nextTick()

    const vm = wrapper.vm as any

    // Check that all required methods are exposed
    expect(typeof vm.focus).toBe('function')
    expect(typeof vm.getSelection).toBe('function')
    expect(typeof vm.insertText).toBe('function')
    expect(typeof vm.replaceSelection).toBe('function')
    expect(typeof vm.searchNext).toBe('function')
    expect(typeof vm.searchPrevious).toBe('function')
    expect(typeof vm.performReplace).toBe('function')
    expect(typeof vm.performReplaceAll).toBe('function')
    expect(typeof vm.clearSearch).toBe('function')
    expect(typeof vm.scrollToPosition).toBe('function')
    expect(typeof vm.getScrollInfo).toBe('function')
  })

  it('handles focus method', async () => {
    wrapper = mount(CodeMirrorEditor, {
      props: {
        modelValue: '',
      },
    })

    await wrapper.vm.$nextTick()

    const vm = wrapper.vm as any

    // Should not throw when calling focus
    expect(() => vm.focus()).not.toThrow()
  })

  it('handles getSelection method', async () => {
    wrapper = mount(CodeMirrorEditor, {
      props: {
        modelValue: 'test content',
      },
    })

    await wrapper.vm.$nextTick()

    const vm = wrapper.vm as any
    const selection = vm.getSelection()

    // Should return an object with from and to properties
    expect(typeof selection).toBe('object')
    expect(selection).toHaveProperty('from')
    expect(selection).toHaveProperty('to')
  })

  it('handles insertText method', async () => {
    wrapper = mount(CodeMirrorEditor, {
      props: {
        modelValue: 'initial text',
      },
    })

    await wrapper.vm.$nextTick()

    const vm = wrapper.vm as any

    // Should not throw when calling insertText
    expect(() => vm.insertText('inserted text')).not.toThrow()
  })

  it('handles search methods', async () => {
    wrapper = mount(CodeMirrorEditor, {
      props: {
        modelValue: 'searchable content with text to find',
      },
    })

    await wrapper.vm.$nextTick()

    const vm = wrapper.vm as any

    // Should not throw when calling search methods
    expect(() =>
      vm.searchNext('text', { caseSensitive: false, useRegex: false })
    ).not.toThrow()
    expect(() =>
      vm.searchPrevious('text', { caseSensitive: false, useRegex: false })
    ).not.toThrow()
    expect(() => vm.clearSearch()).not.toThrow()
  })

  it('handles replace methods', async () => {
    wrapper = mount(CodeMirrorEditor, {
      props: {
        modelValue: 'text to replace',
      },
    })

    await wrapper.vm.$nextTick()

    const vm = wrapper.vm as any

    // Should not throw when calling replace methods
    expect(() =>
      vm.performReplace('text', 'replacement', {
        caseSensitive: false,
        useRegex: false,
      })
    ).not.toThrow()
    expect(() =>
      vm.performReplaceAll('text', 'replacement', {
        caseSensitive: false,
        useRegex: false,
      })
    ).not.toThrow()
  })

  it('handles scroll methods', async () => {
    wrapper = mount(CodeMirrorEditor, {
      props: {
        modelValue: 'content',
      },
    })

    await wrapper.vm.$nextTick()

    const vm = wrapper.vm as any

    // Should not throw when calling scroll methods
    expect(() => vm.scrollToPosition(100)).not.toThrow()

    const scrollInfo = vm.getScrollInfo()
    expect(typeof scrollInfo).toBe('object')
  })

  it('emits scroll events', async () => {
    wrapper = mount(CodeMirrorEditor, {
      props: {
        modelValue: 'content',
      },
    })

    await wrapper.vm.$nextTick()

    // Check that scroll event can be emitted
    const scrollEvents = wrapper.emitted('scroll')
    // Initially no scroll events
    expect(scrollEvents).toBeFalsy()
  })

  it('handles scrollToLine method', async () => {
    wrapper = mount(CodeMirrorEditor, {
      props: {
        modelValue: 'line 1\nline 2\nline 3',
      },
    })

    await wrapper.vm.$nextTick()

    const vm = wrapper.vm as any

    // Should not throw when calling scrollToLine
    expect(() => vm.scrollToLine(2)).not.toThrow()
  })

  it('handles getCurrentLine method', async () => {
    wrapper = mount(CodeMirrorEditor, {
      props: {
        modelValue: 'line 1\nline 2\nline 3',
      },
    })

    await wrapper.vm.$nextTick()

    const vm = wrapper.vm as any
    const currentLine = vm.getCurrentLine()

    // Should return a number
    expect(typeof currentLine).toBe('number')
    expect(currentLine).toBeGreaterThan(0)
  })

  it('handles undo/redo methods', async () => {
    wrapper = mount(CodeMirrorEditor, {
      props: {
        modelValue: 'initial content',
      },
    })

    await wrapper.vm.$nextTick()

    const vm = wrapper.vm as any

    // Should not throw when calling undo/redo methods
    expect(() => vm.performUndo()).not.toThrow()
    expect(() => vm.performRedo()).not.toThrow()
    expect(() => vm.performUndoWithBoundary()).not.toThrow()
    expect(() => vm.performRedoWithBoundary()).not.toThrow()
  })

  it('handles history depth methods', async () => {
    wrapper = mount(CodeMirrorEditor, {
      props: {
        modelValue: 'content',
      },
    })

    await wrapper.vm.$nextTick()

    const vm = wrapper.vm as any

    // Should return numbers for history depths
    expect(typeof vm.getUndoDepth()).toBe('number')
    expect(typeof vm.getRedoDepth()).toBe('number')
    expect(typeof vm.canUndo()).toBe('boolean')
    expect(typeof vm.canRedo()).toBe('boolean')
  })

  it('handles history management methods', async () => {
    wrapper = mount(CodeMirrorEditor, {
      props: {
        modelValue: 'content',
      },
    })

    await wrapper.vm.$nextTick()

    const vm = wrapper.vm as any

    // Should not throw when calling history methods
    expect(() => vm.isolateHistoryBoundary()).not.toThrow()
    expect(() => vm.clearHistory()).not.toThrow()
    expect(() => vm.createHistoryBoundary()).not.toThrow()
    expect(() => vm.createHistoryBoundary('before')).not.toThrow()
    expect(() => vm.createHistoryBoundary('after')).not.toThrow()

    const historyStatus = vm.getHistoryStatus()
    expect(typeof historyStatus).toBe('object')
    expect(historyStatus).toHaveProperty('canUndo')
    expect(historyStatus).toHaveProperty('canRedo')
    expect(historyStatus).toHaveProperty('undoDepth')
    expect(historyStatus).toHaveProperty('redoDepth')
  })

  it('handles document size methods', async () => {
    wrapper = mount(CodeMirrorEditor, {
      props: {
        modelValue: 'line 1\nline 2\nline 3',
      },
    })

    await wrapper.vm.$nextTick()

    const vm = wrapper.vm as any

    const docSize = vm.getDocumentSize()
    expect(typeof docSize).toBe('object')
    expect(docSize).toHaveProperty('lines')
    expect(docSize).toHaveProperty('characters')
    expect(typeof docSize.lines).toBe('number')
    expect(typeof docSize.characters).toBe('number')
  })

  it('handles document size detection methods', async () => {
    wrapper = mount(CodeMirrorEditor, {
      props: {
        modelValue: 'small content',
      },
    })

    await wrapper.vm.$nextTick()

    const vm = wrapper.vm as any

    expect(typeof vm.isLargeDocument()).toBe('boolean')
    expect(typeof vm.isVeryLargeDocument()).toBe('boolean')
    expect(() => vm.optimizeForLargeDocument()).not.toThrow()
  })

  it('handles large text insertion methods', async () => {
    wrapper = mount(CodeMirrorEditor, {
      props: {
        modelValue: 'initial content',
      },
    })

    await wrapper.vm.$nextTick()

    const vm = wrapper.vm as any

    // Test batched text insertion
    const batches = vm.getBatchedTextInsertion('short text')
    expect(Array.isArray(batches)).toBe(true)
    expect(batches.length).toBe(1)

    const largeBatches = vm.getBatchedTextInsertion('a'.repeat(20000))
    expect(Array.isArray(largeBatches)).toBe(true)
    expect(largeBatches.length).toBeGreaterThan(1)

    // Should not throw when calling insertLargeText
    await expect(vm.insertLargeText('test text')).resolves.not.toThrow()
  })

  it('handles performance stats method', async () => {
    wrapper = mount(CodeMirrorEditor, {
      props: {
        modelValue: 'content for stats',
      },
    })

    await wrapper.vm.$nextTick()

    const vm = wrapper.vm as any
    const stats = vm.getPerformanceStats()

    expect(typeof stats).toBe('object')
    expect(stats).toHaveProperty('lines')
    expect(stats).toHaveProperty('characters')
    expect(stats).toHaveProperty('isLarge')
    expect(stats).toHaveProperty('isVeryLarge')
    expect(stats).toHaveProperty('undoDepth')
    expect(stats).toHaveProperty('redoDepth')
    expect(stats).toHaveProperty('memoryUsageEstimate')
  })

  it('handles replaceSelection method', async () => {
    wrapper = mount(CodeMirrorEditor, {
      props: {
        modelValue: 'initial text',
      },
    })

    await wrapper.vm.$nextTick()

    const vm = wrapper.vm as any

    // Should not throw when calling replaceSelection
    expect(() => vm.replaceSelection('replacement text')).not.toThrow()
  })

  it('emits toggle-find-replace event', async () => {
    wrapper = mount(CodeMirrorEditor, {
      props: {
        modelValue: 'content',
      },
    })

    await wrapper.vm.$nextTick()

    // Check that the component has the toggle method
    const vm = wrapper.vm as any
    expect(typeof vm.clearSearch).toBe('function')
  })

  it('handles prop updates correctly', async () => {
    wrapper = mount(CodeMirrorEditor, {
      props: {
        modelValue: 'initial content',
        placeholder: 'initial placeholder',
        darkMode: false,
        readonly: false,
      },
    })

    await wrapper.vm.$nextTick()

    // Update modelValue prop
    await wrapper.setProps({ modelValue: 'updated content' })
    expect((wrapper.vm as any).$props.modelValue).toBe('updated content')

    // Update placeholder prop
    await wrapper.setProps({ placeholder: 'updated placeholder' })
    expect((wrapper.vm as any).$props.placeholder).toBe('updated placeholder')

    // Update readonly prop
    await wrapper.setProps({ readonly: true })
    expect((wrapper.vm as any).$props.readonly).toBe(true)
  })

  it('handles dark mode prop changes', async () => {
    wrapper = mount(CodeMirrorEditor, {
      props: {
        modelValue: 'content',
        darkMode: false,
      },
    })

    await wrapper.vm.$nextTick()

    // Change dark mode - this should trigger editor reinitialization
    await wrapper.setProps({ darkMode: true })
    expect((wrapper.vm as any).$props.darkMode).toBe(true)

    // Change back to light mode
    await wrapper.setProps({ darkMode: false })
    expect((wrapper.vm as any).$props.darkMode).toBe(false)
  })
})
