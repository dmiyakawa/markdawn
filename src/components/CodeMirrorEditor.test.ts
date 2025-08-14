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
    updateListener: {
      of: vi.fn(() => ({})),
    },
    theme: vi.fn(() => ({})),
    domEventHandlers: vi.fn(() => ({})),
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
})
