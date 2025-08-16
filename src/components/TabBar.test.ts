import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import TabBar from './TabBar.vue'

// Mock the useDocuments composable
const mockDocuments = ref([
  {
    id: 'doc-1',
    title: 'Document 1',
    content: '# Doc 1',
    lastModified: '2024-01-01T00:00:00.000Z',
    isPinned: false,
    isSaved: true,
    isUnsaved: false,
  },
  {
    id: 'doc-2',
    title: 'Document 2',
    content: '# Doc 2',
    lastModified: '2024-01-02T00:00:00.000Z',
    isPinned: true,
    isSaved: false,
    isUnsaved: true,
  },
  {
    id: 'doc-3',
    title: 'Document 3',
    content: '# Doc 3',
    lastModified: '2024-01-03T00:00:00.000Z',
    isPinned: false,
    isSaved: true,
    isUnsaved: false,
  },
])

const mockActiveDocumentId = ref('doc-1')

const mockSwitchToDocument = vi.fn()
const mockCloseDocument = vi.fn()
const mockDuplicateDocument = vi.fn()
const mockUpdateDocumentTitle = vi.fn()
const mockReorderDocuments = vi.fn()
const mockToggleDocumentPin = vi.fn()

vi.mock('../composables/useDocuments', () => ({
  useDocuments: () => ({
    documents: mockDocuments,
    activeDocumentId: mockActiveDocumentId,
    switchToDocument: mockSwitchToDocument,
    closeDocument: mockCloseDocument,
    duplicateDocument: mockDuplicateDocument,
    updateDocumentTitle: mockUpdateDocumentTitle,
    reorderDocuments: mockReorderDocuments,
    toggleDocumentPin: mockToggleDocumentPin,
  }),
}))

describe('TabBar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset documents to initial state
    mockDocuments.value = [
      {
        id: 'doc-1',
        title: 'Document 1',
        content: '# Doc 1',
        lastModified: '2024-01-01T00:00:00.000Z',
        isPinned: false,
        isSaved: true,
        isUnsaved: false,
      },
      {
        id: 'doc-2',
        title: 'Document 2',
        content: '# Doc 2',
        lastModified: '2024-01-02T00:00:00.000Z',
        isPinned: true,
        isSaved: false,
        isUnsaved: true,
      },
      {
        id: 'doc-3',
        title: 'Document 3',
        content: '# Doc 3',
        lastModified: '2024-01-03T00:00:00.000Z',
        isPinned: false,
        isSaved: true,
        isUnsaved: false,
      },
    ]
    mockActiveDocumentId.value = 'doc-1'
  })

  // Helper function to mount TabBar with required props
  const mountTabBar = (props = {}) => {
    return mount(TabBar, {
      props: {
        lastSaved: '2024-01-01T12:00:00.000Z',
        saveStatus: 'All documents saved',
        saveStatusClass: { 'text-green-600': true },
        formatTimestamp: (timestamp: string) =>
          new Date(timestamp).toLocaleString(),
        showOutline: false,
        showPreview: true,
        ...props,
      },
    })
  }

  describe('Basic TabBar functionality', () => {
    it('renders all document tabs', () => {
      const wrapper = mountTabBar()

      // Check that all documents are rendered
      expect(wrapper.text()).toContain('Document 1')
      expect(wrapper.text()).toContain('Document 2')
      expect(wrapper.text()).toContain('Document 3')
    })

    it('shows active document with active styling', () => {
      const wrapper = mountTabBar()

      // Find the active tab
      const tabs = wrapper.findAll('[data-document-id]')
      const activeTab = tabs.find(
        (tab) => tab.attributes('data-document-id') === 'doc-1'
      )

      expect(activeTab?.classes()).toContain('bg-white')
      expect(activeTab?.classes()).toContain('border-blue-500')
    })

    it('switches to document when tab is clicked', async () => {
      const wrapper = mountTabBar()

      const tabs = wrapper.findAll('[data-document-id]')
      const doc2Tab = tabs.find(
        (tab) => tab.attributes('data-document-id') === 'doc-2'
      )

      await doc2Tab?.trigger('click')

      expect(mockSwitchToDocument).toHaveBeenCalledWith('doc-2')
    })
  })

  describe('Tab Pinning Functionality', () => {
    it('displays pin icon for pinned tabs', () => {
      const wrapper = mountTabBar()

      // Find the pinned tab (doc-2)
      const tabs = wrapper.findAll('[data-document-id]')
      const pinnedTab = tabs.find(
        (tab) => tab.attributes('data-document-id') === 'doc-2'
      )

      // Check for pin icon presence
      expect(pinnedTab?.html()).toContain('title="Pinned tab"')
      expect(pinnedTab?.find('svg')).toBeTruthy()
    })

    it('applies pinned styling to pinned tabs', () => {
      const wrapper = mountTabBar()

      const tabs = wrapper.findAll('[data-document-id]')
      const pinnedTab = tabs.find(
        (tab) => tab.attributes('data-document-id') === 'doc-2'
      )

      // Check for pinned-specific classes
      expect(pinnedTab?.classes()).toContain('bg-gradient-to-r')
      expect(pinnedTab?.classes()).toContain('from-blue-50')
      expect(pinnedTab?.classes()).toContain('border-blue-300')
    })

    it('sorts pinned tabs first', () => {
      const wrapper = mountTabBar()

      const tabs = wrapper.findAll('[data-document-id]')
      const documentIds = tabs.map((tab) => tab.attributes('data-document-id'))

      // doc-2 is pinned and should appear first
      expect(documentIds[0]).toBe('doc-2')
    })

    it('disables close button for pinned tabs', () => {
      const wrapper = mountTabBar()

      const tabs = wrapper.findAll('[data-document-id]')
      const pinnedTab = tabs.find(
        (tab) => tab.attributes('data-document-id') === 'doc-2'
      )

      const closeButton = pinnedTab?.find('.group .opacity-0')
      expect(closeButton?.classes()).toContain('cursor-not-allowed')
      expect(closeButton?.classes()).toContain('opacity-30')
      expect(closeButton?.attributes('title')).toBe('Cannot close pinned tab')
    })

    it('allows closing unpinned tabs', () => {
      const wrapper = mountTabBar()

      const tabs = wrapper.findAll('[data-document-id]')
      const unpinnedTab = tabs.find(
        (tab) => tab.attributes('data-document-id') === 'doc-1'
      )

      const closeButton = unpinnedTab?.find('.group .opacity-0')
      expect(closeButton?.attributes('title')).toBe('Close tab')
      expect(closeButton?.classes()).not.toContain('cursor-not-allowed')
    })

    it('shows context menu with pin/unpin option', async () => {
      const wrapper = mountTabBar()

      const tabs = wrapper.findAll('[data-document-id]')
      const unpinnedTab = tabs.find(
        (tab) => tab.attributes('data-document-id') === 'doc-1'
      )

      // Right-click to open context menu
      await unpinnedTab?.trigger('contextmenu')

      // Check if context menu appears with pin option
      expect(wrapper.text()).toContain('Pin Tab')
    })

    it('calls toggleDocumentPin when pin option is clicked', async () => {
      const wrapper = mountTabBar()

      const tabs = wrapper.findAll('[data-document-id]')
      const unpinnedTab = tabs.find(
        (tab) => tab.attributes('data-document-id') === 'doc-1'
      )

      // Right-click to open context menu
      await unpinnedTab?.trigger('contextmenu')

      // Find and click the pin button
      const pinButton = wrapper
        .findAll('button')
        .find((btn) => btn.text().includes('Pin Tab'))
      await pinButton?.trigger('click')

      expect(mockToggleDocumentPin).toHaveBeenCalledWith('doc-1')
    })

    it('shows unpin option for pinned tabs in context menu', async () => {
      const wrapper = mountTabBar()

      const tabs = wrapper.findAll('[data-document-id]')
      const pinnedTab = tabs.find(
        (tab) => tab.attributes('data-document-id') === 'doc-2'
      )

      // Right-click to open context menu
      await pinnedTab?.trigger('contextmenu')

      // Check if context menu shows unpin option
      expect(wrapper.text()).toContain('Unpin Tab')
    })
  })

  describe('Visual Indicators', () => {
    it('shows unsaved indicator for unsaved documents', () => {
      // Create a test with a definitely unsaved document
      mockDocuments.value = [
        {
          id: 'unsaved-doc',
          title: 'Unsaved Document',
          content: '# Test',
          lastModified: '2024-01-01T00:00:00.000Z',
          isPinned: false,
          isSaved: false,
          isUnsaved: true,
        },
      ]

      const wrapper = mountTabBar()

      const tabs = wrapper.findAll('[data-document-id]')
      const unsavedTab = tabs.find(
        (tab) => tab.attributes('data-document-id') === 'unsaved-doc'
      )

      // Check for unsaved indicator by looking for the blue dot element
      const unsavedIndicator = unsavedTab?.find('div[title="Unsaved changes"]')
      expect(unsavedIndicator?.exists()).toBe(true)
      expect(unsavedIndicator?.classes()).toContain('bg-blue-500')
    })

    it('does not show unsaved indicator for saved documents', () => {
      const wrapper = mountTabBar()

      const tabs = wrapper.findAll('[data-document-id]')
      const savedTab = tabs.find(
        (tab) => tab.attributes('data-document-id') === 'doc-1'
      )

      // Saved tabs should not show the unsaved indicator
      const unsavedIndicator = savedTab?.find('.bg-blue-500.rounded-full')
      expect(unsavedIndicator?.exists()).toBe(false)
    })
  })

  describe('Drag and Drop', () => {
    it('applies dragging styles during drag operation', async () => {
      const wrapper = mountTabBar()

      const tabs = wrapper.findAll('[data-document-id]')
      const firstTab = tabs[0]

      // Start drag operation
      await firstTab.trigger('dragstart')

      // Check if dragging styles are applied
      expect(firstTab.classes()).toContain('opacity-50')
      expect(firstTab.classes()).toContain('scale-95')
    })

    it('calls reorderDocuments on successful drop', async () => {
      const wrapper = mountTabBar()

      const tabs = wrapper.findAll('[data-document-id]')
      const firstTab = tabs[0]
      const secondTab = tabs[1]

      // Simulate drag and drop
      await firstTab.trigger('dragstart')
      await secondTab.trigger('dragover')
      await secondTab.trigger('drop')

      expect(mockReorderDocuments).toHaveBeenCalled()
    })

    it('handles drag state transitions correctly', async () => {
      const wrapper = mountTabBar()

      const tabs = wrapper.findAll('[data-document-id]')
      const firstTab = tabs[0]

      // Verify initial state - no drag styling
      expect(firstTab.classes()).not.toContain('opacity-50')
      expect(firstTab.classes()).not.toContain('scale-95')

      // Start dragging
      await firstTab.trigger('dragstart')
      expect(firstTab.classes()).toContain('opacity-50')
      expect(firstTab.classes()).toContain('scale-95')

      // End dragging
      await firstTab.trigger('dragend')
      expect(firstTab.classes()).not.toContain('opacity-50')
      expect(firstTab.classes()).not.toContain('scale-95')
    })

    it('sets correct drag data on dragstart', async () => {
      const wrapper = mountTabBar()

      const tabs = wrapper.findAll('[data-document-id]')
      const firstTab = tabs[0]

      const dragStartEvent = new DragEvent('dragstart', {
        dataTransfer: new DataTransfer(),
        bubbles: true,
        cancelable: true,
      })

      const setDataSpy = vi.spyOn(dragStartEvent.dataTransfer!, 'setData')

      // Dispatch dragstart event
      const tabElement = firstTab.element as HTMLElement
      tabElement.dispatchEvent(dragStartEvent)

      expect(setDataSpy).toHaveBeenCalledWith('text/plain', 'doc-1')
      expect(dragStartEvent.dataTransfer!.effectAllowed).toBe('move')
    })

    it('applies drop zone visual indicator on dragover', async () => {
      const wrapper = mountTabBar()

      const tabs = wrapper.findAll('[data-document-id]')
      const firstTab = tabs[0]
      const secondTab = tabs[1]

      // Start dragging first tab
      await firstTab.trigger('dragstart')

      // Drag over second tab
      await secondTab.trigger('dragover')

      // Check if drop zone styling is applied to second tab
      expect(secondTab.classes()).toContain('border-l-4')
      expect(secondTab.classes()).toContain('border-blue-500')
    })

    it('removes visual indicators on dragend', async () => {
      const wrapper = mountTabBar()

      const tabs = wrapper.findAll('[data-document-id]')
      const firstTab = tabs[0]

      // Start and end drag operation
      await firstTab.trigger('dragstart')
      await firstTab.trigger('dragend')

      // Check if dragging styles are removed
      expect(firstTab.classes()).not.toContain('opacity-50')
      expect(firstTab.classes()).not.toContain('scale-95')
    })

    it('handles complex drag operations with state management', async () => {
      const wrapper = mountTabBar()

      const tabs = wrapper.findAll('[data-document-id]')
      const firstTab = tabs[0]
      const secondTab = tabs[1]

      // Test multiple drag operations
      await firstTab.trigger('dragstart')
      expect(firstTab.classes()).toContain('opacity-50')

      await secondTab.trigger('dragover')
      expect(secondTab.classes()).toContain('border-l-4')

      await firstTab.trigger('dragend')
      expect(firstTab.classes()).not.toContain('opacity-50')

      // Start a new drag operation
      await secondTab.trigger('dragstart')
      expect(secondTab.classes()).toContain('opacity-50')

      await secondTab.trigger('dragend')
      expect(secondTab.classes()).not.toContain('opacity-50')
    })

    it('reorders tabs from beginning to end', async () => {
      const wrapper = mountTabBar()

      const tabs = wrapper.findAll('[data-document-id]')
      const firstTab = tabs[0]
      const lastTab = tabs[tabs.length - 1]

      // Drag first tab to last position
      await firstTab.trigger('dragstart')
      await lastTab.trigger('dragover')
      await lastTab.trigger('drop')

      expect(mockReorderDocuments).toHaveBeenCalledWith(0, tabs.length - 1)
    })

    it('reorders tabs from end to beginning', async () => {
      const wrapper = mountTabBar()

      const tabs = wrapper.findAll('[data-document-id]')
      const firstTab = tabs[0]
      const lastTab = tabs[tabs.length - 1]

      // Drag last tab to first position
      await lastTab.trigger('dragstart')
      await firstTab.trigger('dragover')
      await firstTab.trigger('drop')

      expect(mockReorderDocuments).toHaveBeenCalledWith(tabs.length - 1, 0)
    })

    it('does not reorder when dropping on same tab', async () => {
      const wrapper = mountTabBar()

      const tabs = wrapper.findAll('[data-document-id]')
      const firstTab = tabs[0]

      // Drag tab to itself
      await firstTab.trigger('dragstart')
      await firstTab.trigger('dragover')
      await firstTab.trigger('drop')

      expect(mockReorderDocuments).not.toHaveBeenCalled()
    })

    it('handles complex drag sequences correctly', async () => {
      const wrapper = mountTabBar()

      const tabs = wrapper.findAll('[data-document-id]')
      const firstTab = tabs[0]
      const secondTab = tabs[1]
      const thirdTab = tabs[2]

      // Start dragging first tab
      await firstTab.trigger('dragstart')

      // Move over second tab
      await secondTab.trigger('dragover')
      expect(secondTab.classes()).toContain('border-l-4')

      // Move over third tab
      await thirdTab.trigger('dragover')
      expect(thirdTab.classes()).toContain('border-l-4')
      expect(secondTab.classes()).not.toContain('border-l-4')

      // Drop on third tab
      await thirdTab.trigger('drop')

      expect(mockReorderDocuments).toHaveBeenCalledWith(0, 2)
      expect(firstTab.classes()).not.toContain('opacity-50')
      expect(thirdTab.classes()).not.toContain('border-l-4')
    })

    it('maintains drag state correctly during operation', async () => {
      const wrapper = mountTabBar()

      const tabs = wrapper.findAll('[data-document-id]')
      const firstTab = tabs[0]
      const secondTab = tabs[1]

      // Start dragging
      await firstTab.trigger('dragstart')
      expect(firstTab.classes()).toContain('opacity-50')

      // Drag over another tab
      await secondTab.trigger('dragover')
      expect(firstTab.classes()).toContain('opacity-50') // Should still be dragging
      expect(secondTab.classes()).toContain('border-l-4')

      // End drag operation
      await firstTab.trigger('dragend')
      expect(firstTab.classes()).not.toContain('opacity-50')
      expect(secondTab.classes()).not.toContain('border-l-4')
    })

    it('sets correct dropEffect on dragover', async () => {
      const wrapper = mountTabBar()

      const tabs = wrapper.findAll('[data-document-id]')
      const secondTab = tabs[1]

      const dragOverEvent = new DragEvent('dragover', {
        dataTransfer: new DataTransfer(),
        bubbles: true,
        cancelable: true,
      })

      // First trigger dragstart to set up drag state
      await tabs[0].trigger('dragstart')

      // Dispatch dragover event
      const tabElement = secondTab.element as HTMLElement
      tabElement.dispatchEvent(dragOverEvent)

      expect(dragOverEvent.dataTransfer!.dropEffect).toBe('move')
    })

    it('handles edge case with missing dataTransfer', async () => {
      const wrapper = mountTabBar()

      const tabs = wrapper.findAll('[data-document-id]')
      const firstTab = tabs[0]

      // Create drag event without dataTransfer
      const dragStartEvent = new DragEvent('dragstart', {
        bubbles: true,
        cancelable: true,
      })

      const tabElement = firstTab.element as HTMLElement

      expect(() => {
        tabElement.dispatchEvent(dragStartEvent)
      }).not.toThrow()
    })
  })
})
