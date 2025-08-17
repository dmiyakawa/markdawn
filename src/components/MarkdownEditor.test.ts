import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import MarkdownEditor from './MarkdownEditor.vue'
import CodeMirrorEditor from './CodeMirrorEditor.vue'

// Mock CodeMirrorEditor component
vi.mock('./CodeMirrorEditor.vue', () => ({
  default: {
    name: 'CodeMirrorEditor',
    template: '<div data-testid="codemirror-editor">{{ modelValue }}</div>',
    props: {
      modelValue: String,
      darkMode: Boolean,
      placeholder: String,
    },
    emits: ['update:modelValue', 'toggle-find-replace', 'scroll'],
    setup() {
      return {
        focus: vi.fn(),
        getScrollInfo: vi.fn(() => ({
          scrollTop: 100,
          scrollHeight: 1000,
          clientHeight: 500,
        })),
        scrollToPosition: vi.fn(),
        scrollToLine: vi.fn(),
      }
    },
  },
}))

describe('MarkdownEditor.vue', () => {
  const defaultProps = {
    markdownContent: '# Hello World\nThis is a test.',
    showPreview: true,
    leftPaneWidth: 50,
    isDragging: false,
    stats: {
      lines: 2,
      words: 5,
      characters: {
        withSpaces: 30,
        withoutSpaces: 25,
      },
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Component Mounting and Props', () => {
    it('mounts successfully with required props', () => {
      const wrapper = mount(MarkdownEditor, {
        props: defaultProps,
      })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('[data-testid="editor-panel"]').exists()).toBe(true)
    })

    it('passes correct props to CodeMirrorEditor', () => {
      const wrapper = mount(MarkdownEditor, {
        props: defaultProps,
      })

      const codeMirrorComponent = wrapper.findComponent(CodeMirrorEditor)
      expect(codeMirrorComponent.exists()).toBe(true)
      expect(codeMirrorComponent.props('modelValue')).toBe(
        defaultProps.markdownContent
      )
      expect(codeMirrorComponent.props('darkMode')).toBe(false)
      expect(codeMirrorComponent.props('placeholder')).toBe(
        'Start typing your markdown here...'
      )
    })

    it('displays correct header title', () => {
      const wrapper = mount(MarkdownEditor, {
        props: defaultProps,
      })

      expect(wrapper.text()).toContain('Markdown Editor')
    })

    it('sets correct width when showPreview is true', () => {
      const wrapper = mount(MarkdownEditor, {
        props: {
          ...defaultProps,
          showPreview: true,
          leftPaneWidth: 60,
        },
      })

      const panel = wrapper.find('[data-testid="editor-panel"]')
      expect(panel.attributes('style')).toContain('width: 60%')
    })

    it('sets full width when showPreview is false', () => {
      const wrapper = mount(MarkdownEditor, {
        props: {
          ...defaultProps,
          showPreview: false,
        },
      })

      const panel = wrapper.find('[data-testid="editor-panel"]')
      expect(panel.attributes('style')).toContain('width: 100%')
    })

    it('applies dragging styles when isDragging is true', () => {
      const wrapper = mount(MarkdownEditor, {
        props: {
          ...defaultProps,
          isDragging: true,
        },
      })

      const panel = wrapper.find('[data-testid="editor-panel"]')
      expect(panel.classes()).toContain('border-blue-400')
      expect(panel.classes()).toContain('bg-blue-50')
    })

    it('does not apply dragging styles when isDragging is false', () => {
      const wrapper = mount(MarkdownEditor, {
        props: {
          ...defaultProps,
          isDragging: false,
        },
      })

      const panel = wrapper.find('[data-testid="editor-panel"]')
      expect(panel.classes()).not.toContain('border-blue-400')
      expect(panel.classes()).not.toContain('bg-blue-50')
    })
  })

  describe('Statistics Display', () => {
    it('displays line count correctly', () => {
      const wrapper = mount(MarkdownEditor, {
        props: {
          ...defaultProps,
          stats: {
            lines: 10,
            words: 50,
            characters: { withSpaces: 200, withoutSpaces: 180 },
          },
        },
      })

      expect(wrapper.text()).toContain('Lines: 10')
    })

    it('displays word count correctly', () => {
      const wrapper = mount(MarkdownEditor, {
        props: {
          ...defaultProps,
          stats: {
            lines: 5,
            words: 25,
            characters: { withSpaces: 150, withoutSpaces: 130 },
          },
        },
      })

      expect(wrapper.text()).toContain('Words: 25')
    })

    it('displays character count correctly', () => {
      const wrapper = mount(MarkdownEditor, {
        props: {
          ...defaultProps,
          stats: {
            lines: 3,
            words: 15,
            characters: { withSpaces: 75, withoutSpaces: 65 },
          },
        },
      })

      expect(wrapper.text()).toContain('Chars: 75')
    })

    it('updates statistics when stats prop changes', async () => {
      const wrapper = mount(MarkdownEditor, {
        props: defaultProps,
      })

      expect(wrapper.text()).toContain('Lines: 2')
      expect(wrapper.text()).toContain('Words: 5')

      await wrapper.setProps({
        stats: {
          lines: 8,
          words: 40,
          characters: { withSpaces: 180, withoutSpaces: 160 },
        },
      })

      expect(wrapper.text()).toContain('Lines: 8')
      expect(wrapper.text()).toContain('Words: 40')
      expect(wrapper.text()).toContain('Chars: 180')
    })
  })

  describe('Content Management', () => {
    it('displays markdown content in CodeMirror editor', () => {
      const testContent = '# Test Heading\nSome content here.'
      const wrapper = mount(MarkdownEditor, {
        props: {
          ...defaultProps,
          markdownContent: testContent,
        },
      })

      const codeMirrorComponent = wrapper.findComponent(CodeMirrorEditor)
      expect(codeMirrorComponent.props('modelValue')).toBe(testContent)
    })

    it('emits update:markdownContent when content changes', async () => {
      const wrapper = mount(MarkdownEditor, {
        props: defaultProps,
      })

      // Simulate content change by setting the computed property
      wrapper.vm.markdownContent = '# New Content'
      await nextTick()

      expect(wrapper.emitted('update:markdownContent')).toBeTruthy()
      expect(wrapper.emitted('update:markdownContent')![0]).toEqual([
        '# New Content',
      ])
    })

    it('updates content when markdownContent prop changes', async () => {
      const wrapper = mount(MarkdownEditor, {
        props: defaultProps,
      })

      const newContent = '# Updated Content\nThis is updated.'
      await wrapper.setProps({ markdownContent: newContent })

      const codeMirrorComponent = wrapper.findComponent(CodeMirrorEditor)
      expect(codeMirrorComponent.props('modelValue')).toBe(newContent)
    })
  })

  describe('Event Handling', () => {
    it('emits toggle-find-replace when CodeMirror emits it', async () => {
      const wrapper = mount(MarkdownEditor, {
        props: defaultProps,
      })

      const codeMirrorComponent = wrapper.findComponent(CodeMirrorEditor)
      await codeMirrorComponent.vm.$emit('toggle-find-replace')

      expect(wrapper.emitted('toggle-find-replace')).toBeTruthy()
    })

    it('emits scroll event when editor scrolls', async () => {
      const wrapper = mount(MarkdownEditor, {
        props: defaultProps,
      })

      const scrollInfo = {
        scrollTop: 100,
        scrollHeight: 1000,
        clientHeight: 500,
      }

      await wrapper.vm.handleEditorScroll(scrollInfo)

      expect(wrapper.emitted('scroll')).toBeTruthy()
      expect(wrapper.emitted('scroll')![0]).toEqual([scrollInfo])
    })

    it('handles scroll event from CodeMirror component', async () => {
      const wrapper = mount(MarkdownEditor, {
        props: defaultProps,
      })

      const scrollInfo = {
        scrollTop: 200,
        scrollHeight: 2000,
        clientHeight: 600,
      }

      const codeMirrorComponent = wrapper.findComponent(CodeMirrorEditor)
      await codeMirrorComponent.vm.$emit('scroll', scrollInfo)

      expect(wrapper.emitted('scroll')).toBeTruthy()
      expect(wrapper.emitted('scroll')![0]).toEqual([scrollInfo])
    })
  })

  describe('Exposed Methods', () => {
    it('exposes focus method that calls CodeMirror focus', () => {
      const wrapper = mount(MarkdownEditor, {
        props: defaultProps,
      })

      const mockFocus = vi.fn()
      wrapper.vm.codeMirrorEditor = { focus: mockFocus }

      wrapper.vm.focus()

      expect(mockFocus).toHaveBeenCalled()
    })

    it('exposes getScrollInfo method that calls CodeMirror getScrollInfo', () => {
      const wrapper = mount(MarkdownEditor, {
        props: defaultProps,
      })

      const mockGetScrollInfo = vi.fn(() => ({
        scrollTop: 150,
        scrollHeight: 1500,
        clientHeight: 600,
      }))
      wrapper.vm.codeMirrorEditor = { getScrollInfo: mockGetScrollInfo }

      const result = wrapper.vm.getScrollInfo()

      expect(mockGetScrollInfo).toHaveBeenCalled()
      expect(result).toEqual({
        scrollTop: 150,
        scrollHeight: 1500,
        clientHeight: 600,
      })
    })

    it('exposes scrollToPosition method that calls CodeMirror scrollToPosition', () => {
      const wrapper = mount(MarkdownEditor, {
        props: defaultProps,
      })

      const mockScrollToPosition = vi.fn()
      wrapper.vm.codeMirrorEditor = { scrollToPosition: mockScrollToPosition }

      wrapper.vm.scrollToPosition(500)

      expect(mockScrollToPosition).toHaveBeenCalledWith(500)
    })

    it('exposes scrollToLine method that calls CodeMirror scrollToLine', () => {
      const wrapper = mount(MarkdownEditor, {
        props: defaultProps,
      })

      const mockScrollToLine = vi.fn()
      wrapper.vm.codeMirrorEditor = { scrollToLine: mockScrollToLine }

      wrapper.vm.scrollToLine(25)

      expect(mockScrollToLine).toHaveBeenCalledWith(25)
    })

    it('handles missing codeMirrorEditor ref gracefully in focus method', () => {
      const wrapper = mount(MarkdownEditor, {
        props: defaultProps,
      })

      wrapper.vm.codeMirrorEditor = null

      expect(() => wrapper.vm.focus()).not.toThrow()
    })

    it('handles missing codeMirrorEditor ref gracefully in getScrollInfo method', () => {
      const wrapper = mount(MarkdownEditor, {
        props: defaultProps,
      })

      wrapper.vm.codeMirrorEditor = null

      const result = wrapper.vm.getScrollInfo()

      expect(result).toBeUndefined()
    })

    it('handles missing codeMirrorEditor ref gracefully in scrollToPosition method', () => {
      const wrapper = mount(MarkdownEditor, {
        props: defaultProps,
      })

      wrapper.vm.codeMirrorEditor = null

      expect(() => wrapper.vm.scrollToPosition(100)).not.toThrow()
    })

    it('handles missing codeMirrorEditor ref gracefully in scrollToLine method', () => {
      const wrapper = mount(MarkdownEditor, {
        props: defaultProps,
      })

      wrapper.vm.codeMirrorEditor = null

      expect(() => wrapper.vm.scrollToLine(10)).not.toThrow()
    })
  })

  describe('Refs and Exposed Elements', () => {
    it('exposes editorContainer ref', () => {
      const wrapper = mount(MarkdownEditor, {
        props: defaultProps,
      })

      expect(wrapper.vm.editorContainer).toBeDefined()
    })

    it('exposes codeMirrorEditor ref', () => {
      const wrapper = mount(MarkdownEditor, {
        props: defaultProps,
      })

      expect(wrapper.vm.codeMirrorEditor).toBeDefined()
    })
  })

  describe('Layout and Styling', () => {
    it('applies correct CSS classes to editor panel', () => {
      const wrapper = mount(MarkdownEditor, {
        props: defaultProps,
      })

      const panel = wrapper.find('[data-testid="editor-panel"]')
      expect(panel.classes()).toContain('bg-white')
      expect(panel.classes()).toContain('flex')
      expect(panel.classes()).toContain('flex-col')
      expect(panel.classes()).toContain('rounded-lg')
      expect(panel.classes()).toContain('shadow')
      expect(panel.classes()).toContain('border')
      expect(panel.classes()).toContain('border-gray-200')
      expect(panel.classes()).toContain('h-full')
    })

    it('applies correct styling to header', () => {
      const wrapper = mount(MarkdownEditor, {
        props: defaultProps,
      })

      const header = wrapper.find('.px-3.border-b.border-gray-200')
      expect(header.exists()).toBe(true)
      expect(header.classes()).toContain('bg-gray-50')
      expect(header.classes()).toContain('rounded-t-lg')
    })

    it('has correct structure with header and editor sections', () => {
      const wrapper = mount(MarkdownEditor, {
        props: defaultProps,
      })

      // Check header section
      const header = wrapper.find('h3')
      expect(header.text()).toBe('Markdown Editor')

      // Check editor section
      const editorSection = wrapper.find('.flex-1.overflow-hidden')
      expect(editorSection.exists()).toBe(true)

      // Check CodeMirror component
      const codeMirrorComponent = wrapper.findComponent(CodeMirrorEditor)
      expect(codeMirrorComponent.exists()).toBe(true)
    })
  })

  describe('Reactivity', () => {
    it('updates width when leftPaneWidth prop changes', async () => {
      const wrapper = mount(MarkdownEditor, {
        props: defaultProps,
      })

      await wrapper.setProps({ leftPaneWidth: 75 })

      const panel = wrapper.find('[data-testid="editor-panel"]')
      expect(panel.attributes('style')).toContain('width: 75%')
    })

    it('updates width when showPreview prop changes', async () => {
      const wrapper = mount(MarkdownEditor, {
        props: {
          ...defaultProps,
          showPreview: true,
          leftPaneWidth: 60,
        },
      })

      let panel = wrapper.find('[data-testid="editor-panel"]')
      expect(panel.attributes('style')).toContain('width: 60%')

      await wrapper.setProps({ showPreview: false })

      panel = wrapper.find('[data-testid="editor-panel"]')
      expect(panel.attributes('style')).toContain('width: 100%')
    })

    it('updates dragging state when isDragging prop changes', async () => {
      const wrapper = mount(MarkdownEditor, {
        props: {
          ...defaultProps,
          isDragging: false,
        },
      })

      let panel = wrapper.find('[data-testid="editor-panel"]')
      expect(panel.classes()).not.toContain('border-blue-400')

      await wrapper.setProps({ isDragging: true })

      panel = wrapper.find('[data-testid="editor-panel"]')
      expect(panel.classes()).toContain('border-blue-400')
      expect(panel.classes()).toContain('bg-blue-50')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty markdown content', () => {
      const wrapper = mount(MarkdownEditor, {
        props: {
          ...defaultProps,
          markdownContent: '',
        },
      })

      const codeMirrorComponent = wrapper.findComponent(CodeMirrorEditor)
      expect(codeMirrorComponent.props('modelValue')).toBe('')
    })

    it('handles stats with zero values', () => {
      const wrapper = mount(MarkdownEditor, {
        props: {
          ...defaultProps,
          stats: {
            lines: 0,
            words: 0,
            characters: { withSpaces: 0, withoutSpaces: 0 },
          },
        },
      })

      expect(wrapper.text()).toContain('Lines: 0')
      expect(wrapper.text()).toContain('Words: 0')
      expect(wrapper.text()).toContain('Chars: 0')
    })

    it('handles very large markdown content', () => {
      const largeContent = 'A'.repeat(10000) + '\n' + 'B'.repeat(10000)
      const wrapper = mount(MarkdownEditor, {
        props: {
          ...defaultProps,
          markdownContent: largeContent,
        },
      })

      const codeMirrorComponent = wrapper.findComponent(CodeMirrorEditor)
      expect(codeMirrorComponent.props('modelValue')).toBe(largeContent)
    })

    it('handles extreme leftPaneWidth values', async () => {
      const wrapper = mount(MarkdownEditor, {
        props: {
          ...defaultProps,
          leftPaneWidth: 1,
        },
      })

      let panel = wrapper.find('[data-testid="editor-panel"]')
      expect(panel.attributes('style')).toContain('width: 1%')

      await wrapper.setProps({ leftPaneWidth: 99 })
      panel = wrapper.find('[data-testid="editor-panel"]')
      expect(panel.attributes('style')).toContain('width: 99%')
    })
  })
})
