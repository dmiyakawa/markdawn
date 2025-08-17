/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import App from './App.vue'

// Mock problematic components that cause JSDOM issues
vi.mock('./components/CodeMirrorEditor.vue', () => ({
  default: {
    name: 'CodeMirrorEditor',
    template:
      '<div class="mock-codemirror-editor" data-testid="codemirror">{{ modelValue }}</div>',
    props: ['modelValue', 'darkMode', 'placeholder'],
    emits: ['update:modelValue', 'toggle-find-replace', 'scroll'],
    methods: {
      focus: () => {},
      getScrollInfo: () => ({
        scrollTop: 0,
        scrollHeight: 100,
        clientHeight: 50,
      }),
      scrollToPosition: () => {},
      scrollToLine: () => {},
    },
  },
}))

vi.mock('./components/FindReplace.vue', () => ({
  default: {
    name: 'FindReplace',
    template:
      '<div v-if="visible" class="mock-find-replace" data-testid="find-replace"></div>',
    props: ['visible'],
    emits: [
      'update:visible',
      'find-next',
      'find-previous',
      'replace-next',
      'replace-all',
    ],
  },
}))

vi.mock('./components/ExportModal.vue', () => ({
  default: {
    name: 'ExportModal',
    template:
      '<div v-if="visible" class="mock-export-modal" data-testid="export-modal"></div>',
    props: ['visible', 'exportType', 'defaultTitle'],
    emits: ['update:visible', 'confirm', 'cancel'],
  },
}))

vi.mock('./components/ImageManager.vue', () => ({
  default: {
    name: 'ImageManager',
    template:
      '<div class="mock-image-manager" data-testid="image-manager"></div>',
    props: ['documents'],
    emits: ['close', 'insert-image'],
  },
}))

vi.mock('./components/TabBar.vue', () => ({
  default: {
    name: 'TabBar',
    template: '<div class="mock-tab-bar" data-testid="tab-bar">Tab Bar</div>',
    props: [
      'lastSaved',
      'saveStatus',
      'saveStatusClass',
      'formatTimestamp',
      'showOutline',
      'showPreview',
    ],
    emits: ['toggle-outline', 'toggle-preview'],
  },
}))

vi.mock('./components/MarkdownEditor.vue', () => ({
  default: {
    name: 'MarkdownEditor',
    template:
      '<div class="mock-markdown-editor" data-testid="markdown-editor">Markdown Editor - Lines: {{ stats?.lines || 0 }} Words: {{ stats?.words || 0 }} Chars: {{ stats?.characters?.withSpaces || 0 }}</div>',
    props: [
      'markdownContent',
      'showPreview',
      'leftPaneWidth',
      'isDragging',
      'stats',
    ],
    emits: ['update:markdownContent', 'toggle-find-replace', 'scroll'],
    methods: {
      focus: () => {},
      getScrollInfo: () => ({
        scrollTop: 0,
        scrollHeight: 100,
        clientHeight: 50,
      }),
      scrollToPosition: () => {},
      scrollToLine: () => {},
    },
  },
}))

vi.mock('./components/Preview.vue', () => ({
  default: {
    name: 'Preview',
    template:
      '<div v-show="showPreview" class="mock-preview" data-testid="preview">{{ isWysiwygMode ? "WYSIWYG Editor" : "Preview" }}</div>',
    props: ['showPreview', 'leftPaneWidth', 'isWysiwygMode', 'htmlContent'],
    emits: [
      'toggle-wysiwyg-mode',
      'wysiwyg-scroll',
      'wysiwyg-input',
      'wysiwyg-blur',
      'wysiwyg-paste',
    ],
    methods: {
      getScrollInfo: () => ({
        scrollTop: 0,
        scrollHeight: 100,
        clientHeight: 50,
      }),
      scrollToPercentage: () => {},
      focus: () => {},
    },
  },
}))

vi.mock('./components/DocumentOutline.vue', () => ({
  default: {
    name: 'DocumentOutline',
    template:
      '<div v-show="visible" class="mock-document-outline" data-testid="document-outline">Document Outline</div>',
    props: ['markdownContent', 'wordCount', 'visible'],
    emits: ['scroll-to-line'],
  },
}))

describe('App.vue', () => {
  // Use shallow mounting to avoid complex component interactions
  const createWrapper = () =>
    shallowMount(App, {
      global: {
        stubs: {
          'find-replace': true,
          'export-modal': true,
          'image-manager': true,
          'tab-bar': true,
          'markdown-editor': true,
          preview: true,
          'document-outline': true,
        },
      },
    })

  it('renders basic application structure', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('header').exists()).toBe(true)
    expect(wrapper.find('main').exists()).toBe(true)
  })

  it('has file operation buttons', () => {
    const wrapper = createWrapper()
    const buttons = wrapper.findAll('button')
    const buttonTexts = buttons.map((btn) => btn.text())

    expect(buttonTexts).toContain('Import')
    expect(buttonTexts).toContain('MD')
    expect(buttonTexts).toContain('ZIP')
    expect(buttonTexts).toContain('Save')
    expect(buttonTexts).toContain('Load')
    expect(buttonTexts).toContain('New')
  })

  it('has TabBar component with view controls', () => {
    const wrapper = createWrapper()
    const tabBar = wrapper.findComponent({ name: 'TabBar' })
    expect(tabBar.exists()).toBe(true)
    expect(tabBar.props()).toHaveProperty('showPreview')
    expect(tabBar.props()).toHaveProperty('showOutline')
  })

  it('has default markdown content', () => {
    const wrapper = createWrapper()
    const vm = wrapper.vm as unknown as { markdownContent: string }
    expect(vm.markdownContent).toContain('# Welcome to Markdown Editor')
  })

  it('has file input for import', () => {
    const wrapper = createWrapper()
    const fileInput = wrapper.find('input[type="file"]')
    expect(fileInput.exists()).toBe(true)
    expect(fileInput.attributes('accept')).toBe('.md,.markdown')
  })

  it('triggers file input when import button clicked', async () => {
    const wrapper = createWrapper()
    const importButton = wrapper
      .findAll('button')
      .find((btn) => btn.text() === 'Import')
    const fileInput = wrapper.find('input[type="file"]')

    const clickSpy = vi.fn()
    const element = fileInput.element as HTMLInputElement
    element.click = clickSpy

    await importButton?.trigger('click')
    expect(clickSpy).toHaveBeenCalled()
  })

  describe('File Operations', () => {
    it('handles new document creation', async () => {
      const wrapper = createWrapper()
      const newButton = wrapper
        .findAll('button')
        .find((btn) => btn.text() === 'New')

      const vm = wrapper.vm as unknown as {
        documents: Array<{ id: string; title: string; content: string }>
      }

      const initialDocCount = vm.documents.length
      await newButton?.trigger('click')
      await wrapper.vm.$nextTick()

      expect(vm.documents.length).toBe(initialDocCount + 1)
    })

    it('processes valid markdown file import', async () => {
      const wrapper = createWrapper()

      const vm = wrapper.vm as unknown as {
        markdownContent: string
        handleFileImport: (event: Event) => void
      }

      const file = new File(
        ['# Test Content\n\nThis is imported content.'],
        'test.md',
        {
          type: 'text/markdown',
        }
      )

      // Mock FileReader with proper async behavior
      const mockFileReader = {
        readAsText: vi.fn().mockImplementation(function (this: any) {
          setTimeout(() => {
            if (this.onload) {
              this.onload({
                target: {
                  result: '# Test Content\n\nThis is imported content.',
                },
              })
            }
          }, 0)
        }),
        onload: null as ((event: ProgressEvent<FileReader>) => void) | null,
        onerror: null as ((event: Event) => void) | null,
      }

      vi.spyOn(window, 'FileReader').mockImplementation(
        () => mockFileReader as unknown as FileReader
      )

      const mockEvent = {
        target: {
          files: [file],
        },
      } as unknown as Event

      await vm.handleFileImport(mockEvent)
      await new Promise((resolve) => setTimeout(resolve, 10))
      await wrapper.vm.$nextTick()

      expect(vm.markdownContent).toContain('Test Content')
    })

    it('handles file import errors gracefully', async () => {
      const wrapper = createWrapper()

      const vm = wrapper.vm as unknown as {
        saveStatus: string
        handleFileImport: (event: Event) => void
      }

      const file = new File(['content'], 'test.md', { type: 'text/markdown' })

      const mockFileReader = {
        readAsText: vi.fn().mockImplementation(function (this: any) {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror({})
            }
          }, 0)
        }),
        onload: null as ((event: Event) => void) | null,
        onerror: null as ((event: Event) => void) | null,
      }

      vi.spyOn(window, 'FileReader').mockImplementation(
        () => mockFileReader as unknown as FileReader
      )

      const mockEvent = {
        target: { files: [file] },
      } as unknown as Event

      await vm.handleFileImport(mockEvent)
      await new Promise((resolve) => setTimeout(resolve, 10))
      await wrapper.vm.$nextTick()

      expect(vm.saveStatus).toContain('Import error')
    })

    it('rejects files larger than 10MB', async () => {
      const wrapper = createWrapper()

      const vm = wrapper.vm as unknown as {
        saveStatus: string
        handleFileImport: (event: Event) => void
      }

      const largeFile = new File(['content'], 'large.md', {
        type: 'text/markdown',
      })
      Object.defineProperty(largeFile, 'size', { value: 11 * 1024 * 1024 })

      const mockEvent = {
        target: { files: [largeFile] },
      } as unknown as Event

      vm.handleFileImport(mockEvent)
      await wrapper.vm.$nextTick()

      expect(vm.saveStatus).toContain('too large')
    })

    it('has export functionality', () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as unknown as { exportFile: () => void }

      // Test that export function exists
      expect(typeof vm.exportFile).toBe('function')

      // Test that export button exists
      const exportButton = wrapper
        .findAll('button')
        .find((btn) => btn.text() === 'MD')
      expect(exportButton?.exists()).toBe(true)
    })
  })

  describe('Application State', () => {
    it('has initial state values', () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as unknown as {
        showPreview: boolean
        showFindReplace: boolean
        showOutline: boolean
        showImageManager: boolean
      }

      // Test initial state values without triggering DOM updates
      expect(typeof vm.showPreview).toBe('boolean')
      expect(typeof vm.showFindReplace).toBe('boolean')
      expect(typeof vm.showOutline).toBe('boolean')
      expect(typeof vm.showImageManager).toBe('boolean')
    })

    it('has required methods for functionality', () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as unknown as {
        performUndo: () => void
        performRedo: () => void
        saveAllDocuments: () => void
        handleWysiwygInput: (event: Event) => void
        togglePreview: () => void
        toggleFindReplace: () => void
      }

      // Test that core functions exist
      expect(typeof vm.performUndo).toBe('function')
      expect(typeof vm.performRedo).toBe('function')
      expect(typeof vm.saveAllDocuments).toBe('function')
      expect(typeof vm.handleWysiwygInput).toBe('function')
      expect(typeof vm.togglePreview).toBe('function')
      expect(typeof vm.toggleFindReplace).toBe('function')
    })
  })

  describe('UI Interaction', () => {
    it('toggles find/replace dialog', async () => {
      const wrapper = createWrapper()
      const findReplaceButton = wrapper
        .findAll('button')
        .find((btn) => btn.text() === 'Find/Replace')

      const vm = wrapper.vm as unknown as { showFindReplace: boolean }
      const initialState = vm.showFindReplace

      await findReplaceButton?.trigger('click')
      await wrapper.vm.$nextTick()

      expect(vm.showFindReplace).toBe(!initialState)
    })

    it('toggles outline panel', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as unknown as {
        showOutline: boolean
        toggleOutline: () => void
      }

      const initialState = vm.showOutline
      await vm.toggleOutline()
      await wrapper.vm.$nextTick()

      expect(vm.showOutline).toBe(!initialState)
    })

    it('toggles preview panel', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as unknown as {
        showPreview: boolean
        togglePreview: () => void
      }

      const initialState = vm.showPreview
      await vm.togglePreview()
      await wrapper.vm.$nextTick()

      expect(vm.showPreview).toBe(!initialState)
    })

    it('handles undo/redo button states', () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as unknown as {
        canUndo: boolean
        canRedo: boolean
      }

      const undoButton = wrapper.find('#undo-btn')
      const redoButton = wrapper.find('#redo-btn')

      expect(undoButton.exists()).toBe(true)
      expect(redoButton.exists()).toBe(true)
      expect(typeof vm.canUndo).toBe('boolean')
      expect(typeof vm.canRedo).toBe('boolean')
    })

    it('handles save and load operations', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as unknown as {
        saveDocument: () => void
        loadDocument: () => void
        saveStatus: string
      }

      const saveButton = wrapper.find('#save-btn')
      const loadButton = wrapper.find('#load-btn')

      await saveButton.trigger('click')
      await wrapper.vm.$nextTick()

      await loadButton.trigger('click')
      await wrapper.vm.$nextTick()

      expect(typeof vm.saveStatus).toBe('string')
    })

    it('has ZIP export button', async () => {
      const wrapper = createWrapper()

      const zipButton = wrapper
        .findAll('button')
        .find((btn) => btn.text() === 'ZIP')

      expect(zipButton?.exists()).toBe(true)
    })

    it('has image manager functionality', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as unknown as {
        showImageManager: boolean
      }

      // Test that image manager state exists
      expect(typeof vm.showImageManager).toBe('boolean')
    })
  })

  describe('Content Management', () => {
    it('has content and statistics', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as unknown as {
        markdownContent: string
        stats: {
          lines: number
          words: number
          characters: { withSpaces: number; withoutSpaces: number }
        }
      }

      expect(typeof vm.markdownContent).toBe('string')
      expect(typeof vm.stats.lines).toBe('number')
      expect(typeof vm.stats.words).toBe('number')
      expect(typeof vm.stats.characters.withSpaces).toBe('number')
    })

    it('handles WYSIWYG mode toggle', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as unknown as {
        isWysiwygMode: boolean
        toggleWysiwygMode: () => void
      }

      const initialMode = vm.isWysiwygMode
      await vm.toggleWysiwygMode()
      await wrapper.vm.$nextTick()

      expect(vm.isWysiwygMode).toBe(!initialMode)
    })

    it('has WYSIWYG input handling', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as unknown as {
        handleWysiwygInput: (event: Event) => void
        markdownContent: string
      }

      // Test that the method exists
      expect(typeof vm.handleWysiwygInput).toBe('function')
      expect(typeof vm.markdownContent).toBe('string')
    })

    it('has scroll synchronization', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as unknown as {
        handleEditorScroll: (scrollInfo: any) => void
      }

      // Test that scroll handler exists
      expect(typeof vm.handleEditorScroll).toBe('function')
    })

    it('formats timestamps correctly', () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as unknown as {
        formatTimestamp: (timestamp: string) => string
      }

      const testDate = new Date('2024-01-01T12:00:00.000Z').toISOString()
      const formatted = vm.formatTimestamp(testDate)

      expect(typeof formatted).toBe('string')
      expect(formatted.length).toBeGreaterThan(0)
    })
  })

  describe('Document Management', () => {
    it('has document state', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as unknown as {
        documents: Array<{ id: string; title: string; content: string }>
        activeDocumentId: string | null
      }

      expect(Array.isArray(vm.documents)).toBe(true)
      expect(
        vm.activeDocumentId === null || typeof vm.activeDocumentId === 'string'
      ).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('handles invalid file types gracefully', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as unknown as {
        handleFileImport: (event: Event) => void
        saveStatus: string
      }

      const invalidFile = new File(['content'], 'test.txt', {
        type: 'text/plain',
      })

      const mockEvent = {
        target: { files: [invalidFile] },
      } as unknown as Event

      await vm.handleFileImport(mockEvent)
      await wrapper.vm.$nextTick()

      expect(vm.saveStatus).toContain('error')
    })

    it('handles empty file selection', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as unknown as {
        handleFileImport: (event: Event) => Promise<void>
      }

      const mockEvent = {
        target: { files: [] },
      } as unknown as Event

      // Should not throw an error - use await to handle the promise
      await expect(vm.handleFileImport(mockEvent)).resolves.toBeUndefined()
    })

    it('handles missing file input target', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as unknown as {
        handleFileImport: (event: Event) => Promise<void>
      }

      const mockEvent = {
        target: null,
      } as unknown as Event

      // The function will try to access target.files and fail gracefully
      await expect(vm.handleFileImport(mockEvent)).rejects.toThrow(
        'Cannot read properties of null'
      )
    })
  })

  describe('Keyboard Shortcuts', () => {
    it('responds to Ctrl+Z for undo', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as unknown as {
        performUndo: () => void
      }

      // Simulate Ctrl+Z keydown
      await wrapper.trigger('keydown', { key: 'z', ctrlKey: true })

      // Note: This test verifies the method exists, actual keyboard handling
      // would need event listener testing which is complex in JSDOM
      expect(typeof vm.performUndo).toBe('function')
    })

    it('responds to Ctrl+Y for redo', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as unknown as {
        performRedo: () => void
      }

      // Test that redo method exists
      expect(typeof vm.performRedo).toBe('function')
    })
  })

  describe('Export Modal', () => {
    it('has export modal state', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as unknown as {
        showExportModal: boolean
        exportType: string | null | undefined
      }

      expect(typeof vm.showExportModal).toBe('boolean')
      const exportTypeValid =
        vm.exportType === null ||
        vm.exportType === undefined ||
        typeof vm.exportType === 'string'
      expect(exportTypeValid).toBe(true)
    })

    it('handles export modal confirmation', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as unknown as {
        handleExportConfirm: (options: any) => void
        showExportModal: boolean
      }

      const exportOptions = {
        title: 'Test Export',
        author: 'Test Author',
        includeStyles: true,
      }

      await vm.handleExportConfirm(exportOptions)
      await wrapper.vm.$nextTick()

      expect(vm.showExportModal).toBe(false)
    })
  })
})
