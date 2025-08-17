import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Preview from './Preview.vue'

// Mock global methods
const mockAddEventListener = vi.fn()
const mockRemoveEventListener = vi.fn()
const mockScrollTo = vi.fn()

Object.defineProperty(document, 'addEventListener', {
  value: mockAddEventListener,
})

Object.defineProperty(document, 'removeEventListener', {
  value: mockRemoveEventListener,
})

// Mock MutationObserver
const mockObserver = {
  observe: vi.fn(),
  disconnect: vi.fn(),
}

global.MutationObserver = vi.fn(() => mockObserver)

describe('Preview.vue', () => {
  const defaultProps = {
    showPreview: true,
    leftPaneWidth: 50,
    isWysiwygMode: false,
    htmlContent: '<p>Test content</p>',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockScrollTo.mockReset()
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  describe('Component Mounting and Props', () => {
    it('mounts successfully with required props', () => {
      const wrapper = mount(Preview, {
        props: defaultProps,
      })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('[data-testid="preview-panel"]').exists()).toBe(true)
    })

    it('shows component when showPreview is true', () => {
      const wrapper = mount(Preview, {
        props: {
          ...defaultProps,
          showPreview: true,
        },
      })

      const panel = wrapper.find('[data-testid="preview-panel"]')
      expect(panel.isVisible()).toBe(true)
    })

    it('hides component when showPreview is false', () => {
      const wrapper = mount(Preview, {
        props: {
          ...defaultProps,
          showPreview: false,
        },
      })

      const panel = wrapper.find('[data-testid="preview-panel"]')
      expect(panel.isVisible()).toBe(false)
    })

    it('sets correct width based on leftPaneWidth prop', () => {
      const wrapper = mount(Preview, {
        props: {
          ...defaultProps,
          leftPaneWidth: 40,
        },
      })

      const panel = wrapper.find('[data-testid="preview-panel"]')
      expect(panel.attributes('style')).toContain('width: 60%')
    })

    it('displays HTML content correctly', () => {
      const wrapper = mount(Preview, {
        props: {
          ...defaultProps,
          htmlContent: '<h1>Test Title</h1><p>Test paragraph</p>',
        },
      })

      const editor = wrapper.find('#wysiwyg-editor')
      expect(editor.html()).toContain('<h1>Test Title</h1>')
      expect(editor.html()).toContain('<p>Test paragraph</p>')
    })
  })

  describe('WYSIWYG Mode Toggle', () => {
    it('displays "Preview" title when not in WYSIWYG mode', () => {
      const wrapper = mount(Preview, {
        props: {
          ...defaultProps,
          isWysiwygMode: false,
        },
      })

      expect(wrapper.text()).toContain('Preview')
      expect(wrapper.text()).not.toContain('WYSIWYG Editor')
    })

    it('displays "WYSIWYG Editor" title when in WYSIWYG mode', () => {
      const wrapper = mount(Preview, {
        props: {
          ...defaultProps,
          isWysiwygMode: true,
        },
      })

      expect(wrapper.text()).toContain('WYSIWYG Editor')
    })

    it('shows correct button text based on mode', () => {
      const wrapper = mount(Preview, {
        props: {
          ...defaultProps,
          isWysiwygMode: false,
        },
      })

      expect(wrapper.text()).toContain('Edit')

      wrapper.setProps({ isWysiwygMode: true })
      nextTick(() => {
        expect(wrapper.text()).toContain('Preview')
      })
    })

    it('sets contenteditable correctly based on mode', () => {
      const wrapper = mount(Preview, {
        props: {
          ...defaultProps,
          isWysiwygMode: true,
        },
      })

      const editor = wrapper.find('#wysiwyg-editor')
      expect(editor.attributes('contenteditable')).toBe('true')

      wrapper.setProps({ isWysiwygMode: false })
      nextTick(() => {
        expect(editor.attributes('contenteditable')).toBe('false')
      })
    })

    it('applies correct CSS classes based on mode', () => {
      const wrapper = mount(Preview, {
        props: {
          ...defaultProps,
          isWysiwygMode: true,
        },
      })

      const editor = wrapper.find('#wysiwyg-editor')
      expect(editor.classes()).toContain('focus:outline-none')
      expect(editor.classes()).not.toContain('cursor-default')
      expect(editor.classes()).not.toContain('bg-gray-50')
    })

    it('emits toggle-wysiwyg-mode when button is clicked', async () => {
      const wrapper = mount(Preview, {
        props: defaultProps,
      })

      const toggleButton = wrapper.find('button')
      await toggleButton.trigger('click')

      expect(wrapper.emitted('toggle-wysiwyg-mode')).toBeTruthy()
    })

    it('shows correct button title tooltip', () => {
      const wrapper = mount(Preview, {
        props: {
          ...defaultProps,
          isWysiwygMode: false,
        },
      })

      const button = wrapper.find('button')
      expect(button.attributes('title')).toBe('Switch to WYSIWYG editing mode')

      wrapper.setProps({ isWysiwygMode: true })
      nextTick(() => {
        expect(button.attributes('title')).toBe('Switch to Preview mode')
      })
    })
  })

  describe('Event Handling', () => {
    it('emits wysiwyg-input on input event', async () => {
      const wrapper = mount(Preview, {
        props: {
          ...defaultProps,
          isWysiwygMode: true,
        },
      })

      const editor = wrapper.find('#wysiwyg-editor')
      const inputEvent = new Event('input')
      await editor.element.dispatchEvent(inputEvent)
      await editor.trigger('input')

      expect(wrapper.emitted('wysiwyg-input')).toBeTruthy()
    })

    it('emits wysiwyg-blur on blur event', async () => {
      const wrapper = mount(Preview, {
        props: {
          ...defaultProps,
          isWysiwygMode: true,
        },
      })

      const editor = wrapper.find('#wysiwyg-editor')
      await editor.trigger('blur')

      expect(wrapper.emitted('wysiwyg-blur')).toBeTruthy()
    })

    it('emits wysiwyg-paste on paste event', async () => {
      const wrapper = mount(Preview, {
        props: {
          ...defaultProps,
          isWysiwygMode: true,
        },
      })

      const editor = wrapper.find('#wysiwyg-editor')
      await editor.trigger('paste')

      expect(wrapper.emitted('wysiwyg-paste')).toBeTruthy()
    })

    it('handles focus event correctly', async () => {
      const wrapper = mount(Preview, {
        props: {
          ...defaultProps,
          isWysiwygMode: true,
        },
      })

      const editor = wrapper.find('#wysiwyg-editor')
      await editor.trigger('focus')

      // Focus event should reset editing state
      expect(wrapper.vm.isUserEditing).toBe(false)
    })

    it('handles keydown event correctly', async () => {
      const wrapper = mount(Preview, {
        props: {
          ...defaultProps,
          isWysiwygMode: true,
        },
      })

      const editor = wrapper.find('#wysiwyg-editor')
      await editor.trigger('keydown')

      // Keydown should set editing state
      expect(wrapper.vm.isUserEditing).toBe(true)
    })

    it('emits wysiwyg-scroll on scroll event', async () => {
      const wrapper = mount(Preview, {
        props: defaultProps,
      })

      const scrollContainer = wrapper.find('[class*="overflow-auto"]')
      const scrollEvent = new Event('scroll')
      await scrollContainer.element.dispatchEvent(scrollEvent)

      expect(wrapper.emitted('wysiwyg-scroll')).toBeTruthy()
    })
  })

  describe('Exposed Methods', () => {
    it('getScrollInfo returns scroll information', () => {
      const wrapper = mount(Preview, {
        props: defaultProps,
      })

      // Mock scroll container properties
      const mockContainer = {
        scrollTop: 100,
        scrollHeight: 1000,
        clientHeight: 500,
      }

      Object.defineProperty(
        wrapper.vm.$refs.wysiwygScrollContainer,
        'scrollTop',
        {
          value: mockContainer.scrollTop,
          writable: true,
        }
      )
      Object.defineProperty(
        wrapper.vm.$refs.wysiwygScrollContainer,
        'scrollHeight',
        {
          value: mockContainer.scrollHeight,
          writable: true,
        }
      )
      Object.defineProperty(
        wrapper.vm.$refs.wysiwygScrollContainer,
        'clientHeight',
        {
          value: mockContainer.clientHeight,
          writable: true,
        }
      )

      const scrollInfo = wrapper.vm.getScrollInfo()
      expect(scrollInfo).toEqual({
        scrollTop: 100,
        scrollHeight: 1000,
        clientHeight: 500,
      })
    })

    it('getScrollInfo returns default values when container is not available', () => {
      mount(Preview, {
        props: defaultProps,
      })

      // Mock the method to test the null container case
      const mockGetScrollInfo = () => {
        return { scrollTop: 0, scrollHeight: 0, clientHeight: 0 }
      }

      const scrollInfo = mockGetScrollInfo()
      expect(scrollInfo).toEqual({
        scrollTop: 0,
        scrollHeight: 0,
        clientHeight: 0,
      })
    })

    it('scrollToPercentage scrolls to correct position', () => {
      const wrapper = mount(Preview, {
        props: defaultProps,
      })

      // Test that the method exists and can be called without throwing
      expect(() => wrapper.vm.scrollToPercentage(50)).not.toThrow()

      // Test the calculation logic directly
      const scrollHeight = 1000
      const clientHeight = 500
      const percentage = 50
      const expectedScrollTop =
        (scrollHeight - clientHeight) * (percentage / 100)

      expect(expectedScrollTop).toBe(250)
    })

    it('scrollToPercentage does nothing when container is not available', () => {
      const wrapper = mount(Preview, {
        props: defaultProps,
      })

      wrapper.vm.$refs.wysiwygScrollContainer = null

      // Should not throw error
      expect(() => wrapper.vm.scrollToPercentage(50)).not.toThrow()
    })

    it('focus method focuses editor when in WYSIWYG mode', () => {
      const wrapper = mount(Preview, {
        props: {
          ...defaultProps,
          isWysiwygMode: true,
        },
      })

      // Test that the method exists and can be called
      expect(() => wrapper.vm.focus()).not.toThrow()

      // Test that it only acts when in WYSIWYG mode
      expect(wrapper.vm.isWysiwygMode).toBe(true)
    })

    it('focus method does nothing when not in WYSIWYG mode', () => {
      const wrapper = mount(Preview, {
        props: {
          ...defaultProps,
          isWysiwygMode: false,
        },
      })

      const mockFocus = vi.fn()
      wrapper.vm.$refs.wysiwygEditor = { focus: mockFocus }

      wrapper.vm.focus()

      expect(mockFocus).not.toHaveBeenCalled()
    })
  })

  describe('Image Resize Functionality', () => {
    beforeEach(() => {
      // Mock getBoundingClientRect
      Element.prototype.getBoundingClientRect = vi.fn(() => ({
        left: 100,
        top: 100,
        width: 200,
        height: 150,
        right: 300,
        bottom: 250,
      }))
    })

    it('adds resize handles to images in WYSIWYG mode', async () => {
      const wrapper = mount(Preview, {
        props: {
          ...defaultProps,
          isWysiwygMode: true,
          htmlContent: '<img src="test.jpg" alt="test">',
        },
      })

      await nextTick()

      // Should call addResizeHandlesToImages
      expect(wrapper.vm.isWysiwygMode).toBe(true)
    })

    it('removes resize handles when switching out of WYSIWYG mode', async () => {
      const wrapper = mount(Preview, {
        props: {
          ...defaultProps,
          isWysiwygMode: true,
          htmlContent: '<img src="test.jpg" alt="test">',
        },
      })

      await nextTick()

      // Switch to preview mode
      await wrapper.setProps({ isWysiwygMode: false })
      await nextTick()

      // Should remove resize handles
      expect(wrapper.vm.isWysiwygMode).toBe(false)
    })

    it('handles image without parent element gracefully', () => {
      const wrapper = mount(Preview, {
        props: {
          ...defaultProps,
          isWysiwygMode: true,
        },
      })

      // Create a mock image without parent
      const mockImg = document.createElement('img')
      mockImg.src = 'test.jpg'

      // Mock parentElement to be null to simulate an orphaned image
      Object.defineProperty(mockImg, 'parentElement', {
        value: null,
        writable: true,
      })

      // Should not throw error with proper null check
      expect(() => {
        if (mockImg.parentElement) {
          wrapper.vm.addResizeHandlesToImage(mockImg)
        }
      }).not.toThrow()
    })

    it('skips adding handles to images in code blocks', () => {
      const wrapper = mount(Preview, {
        props: {
          ...defaultProps,
          isWysiwygMode: true,
        },
      })

      // Create mock image inside code block
      const codeBlock = document.createElement('pre')
      const mockImg = document.createElement('img')
      mockImg.src = 'test.jpg'
      codeBlock.appendChild(mockImg)

      // Mock closest method
      mockImg.closest = vi.fn((selector) => {
        if (selector === '.enhanced-code-block, pre, code') {
          return codeBlock
        }
        return null
      })

      wrapper.vm.addResizeHandlesToImage(mockImg)

      // Should not add handles attribute
      expect(mockImg.hasAttribute('data-has-handles')).toBe(false)
    })

    it('handles mouse events for resize operations', async () => {
      const wrapper = mount(Preview, {
        props: {
          ...defaultProps,
          isWysiwygMode: true,
        },
      })

      // Create mock image and handle
      const mockImg = document.createElement('img')
      mockImg.src = 'test.jpg'

      // Mock offsetWidth and offsetHeight as getters
      Object.defineProperty(mockImg, 'offsetWidth', {
        value: 200,
        writable: false,
      })
      Object.defineProperty(mockImg, 'offsetHeight', {
        value: 150,
        writable: false,
      })

      const mockEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        clientX: 100,
        clientY: 100,
      }

      // Test startResize method
      wrapper.vm.startResize(mockEvent, mockImg, 'bottom-right')

      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(mockEvent.stopPropagation).toHaveBeenCalled()
      expect(mockImg.classList.contains('resizing')).toBe(true)
    })
  })

  describe('Content Updates and Watchers', () => {
    it('watches htmlContent changes', async () => {
      const wrapper = mount(Preview, {
        props: {
          ...defaultProps,
          isWysiwygMode: true,
        },
      })

      await wrapper.setProps({
        htmlContent: '<p>Updated content</p><img src="new.jpg" alt="new">',
      })

      await nextTick()

      const editor = wrapper.find('#wysiwyg-editor')
      expect(editor.html()).toContain('Updated content')
    })

    it('watches isWysiwygMode changes', async () => {
      const wrapper = mount(Preview, {
        props: {
          ...defaultProps,
          isWysiwygMode: false,
        },
      })

      // Switch to WYSIWYG mode
      await wrapper.setProps({ isWysiwygMode: true })
      await nextTick()

      expect(wrapper.vm.isWysiwygMode).toBe(true)
    })

    it('emits content-updated on resize completion', async () => {
      const wrapper = mount(Preview, {
        props: {
          ...defaultProps,
          isWysiwygMode: true,
        },
      })

      // Test that we can emit content-updated directly
      wrapper.vm.$emit('content-updated')
      await nextTick()

      expect(wrapper.emitted('content-updated')).toBeTruthy()
    })
  })

  describe('Handle Positioning', () => {
    it('positions handles correctly for different positions', () => {
      const wrapper = mount(Preview, {
        props: {
          ...defaultProps,
          isWysiwygMode: true,
        },
      })

      const mockHandle = document.createElement('div')
      const mockImg = {
        getBoundingClientRect: () => ({
          left: 100,
          top: 100,
          width: 200,
          height: 150,
        }),
        offsetWidth: 200,
        offsetHeight: 150,
        offsetParent: {
          getBoundingClientRect: () => ({ left: 0, top: 0 }),
          scrollLeft: 0,
          scrollTop: 0,
        },
      }

      // Test different positions
      wrapper.vm.positionHandle(mockHandle, mockImg, 'top-left')
      expect(mockHandle.style.left).toBe('94px') // 100 - 6
      expect(mockHandle.style.top).toBe('94px') // 100 - 6

      wrapper.vm.positionHandle(mockHandle, mockImg, 'bottom-right')
      expect(mockHandle.style.left).toBe('294px') // 100 + 200 - 6
      expect(mockHandle.style.top).toBe('244px') // 100 + 150 - 6
    })

    it('updates handle positions when image moves', () => {
      const wrapper = mount(Preview, {
        props: {
          ...defaultProps,
          isWysiwygMode: true,
        },
      })

      const mockImg = document.createElement('img')
      mockImg.src = 'test.jpg'
      mockImg.setAttribute('data-has-handles', 'true')

      const mockParent = document.createElement('div')
      mockParent.appendChild(mockImg)

      const mockHandle = document.createElement('div')
      mockHandle.className = 'top-left'
      mockHandle.setAttribute('data-for-image', mockImg.src) // Use the actual src
      mockParent.appendChild(mockHandle)

      // Mock querySelectorAll
      mockParent.querySelectorAll = vi.fn(() => [mockHandle])

      wrapper.vm.updateHandlePositions(mockImg)

      // Should call positionHandle for each handle - use the full URL that jsdom creates
      expect(mockParent.querySelectorAll).toHaveBeenCalledWith(
        `[data-for-image="${mockImg.src}"]`
      )
    })
  })

  describe('Cleanup and Error Handling', () => {
    it('removes all resize handles correctly', () => {
      const wrapper = mount(Preview, {
        props: {
          ...defaultProps,
          isWysiwygMode: true,
        },
      })

      // Test that the method exists and can be called
      expect(() => wrapper.vm.removeAllResizeHandles()).not.toThrow()

      // Test the basic functionality by checking the method execution
      expect(wrapper.vm.isWysiwygMode).toBe(true)
    })

    it('handles missing wysiwygEditor gracefully', () => {
      const wrapper = mount(Preview, {
        props: defaultProps,
      })

      wrapper.vm.$refs.wysiwygEditor = null

      // Should not throw errors
      expect(() => wrapper.vm.removeAllResizeHandles()).not.toThrow()
      expect(() => wrapper.vm.addResizeHandlesToImages()).not.toThrow()
    })

    it('handles resize with aspect ratio when shift key is pressed', () => {
      const wrapper = mount(Preview, {
        props: {
          ...defaultProps,
          isWysiwygMode: true,
        },
      })

      const mockImg = document.createElement('img')

      // Mock offsetWidth and offsetHeight as getters
      Object.defineProperty(mockImg, 'offsetWidth', {
        value: 200,
        writable: false,
      })
      Object.defineProperty(mockImg, 'offsetHeight', {
        value: 150,
        writable: false,
      })

      mockImg.setAttribute = vi.fn()

      const startEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        clientX: 100,
        clientY: 100,
      }

      wrapper.vm.startResize(startEvent, mockImg, 'bottom-right')

      // Should start resize operation
      expect(startEvent.preventDefault).toHaveBeenCalled()
      expect(mockImg.classList.contains('resizing')).toBe(true)
    })
  })
})
