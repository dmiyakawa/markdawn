import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useResizablePanes } from './useResizablePanes'

// Mock DOM methods
Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
  value: vi.fn(() => ({
    width: 1000,
    height: 600,
    left: 0,
    top: 0,
    right: 1000,
    bottom: 600,
    x: 0,
    y: 0,
    toJSON: vi.fn(),
  })),
  writable: true,
})

describe('useResizablePanes', () => {
  let resizablePanes: ReturnType<typeof useResizablePanes>

  beforeEach(() => {
    // Reset document body styles before each test
    document.body.style.userSelect = ''
    document.body.style.cursor = ''

    // Clear any existing event listeners
    document.removeEventListener('mousemove', vi.fn())
    document.removeEventListener('mouseup', vi.fn())

    resizablePanes = useResizablePanes()
  })

  afterEach(() => {
    // Clean up after each test
    document.body.style.userSelect = ''
    document.body.style.cursor = ''
  })

  describe('initialization', () => {
    it('initializes with default values', () => {
      expect(resizablePanes.isDragging.value).toBe(false)
      expect(resizablePanes.leftPaneWidth.value).toBe(50)
      expect(resizablePanes.containerRef.value).toBeNull()
      expect(resizablePanes.resizeHandleRef.value).toBeNull()
    })

    it('provides all expected properties and methods', () => {
      expect(resizablePanes).toHaveProperty('isDragging')
      expect(resizablePanes).toHaveProperty('leftPaneWidth')
      expect(resizablePanes).toHaveProperty('containerRef')
      expect(resizablePanes).toHaveProperty('resizeHandleRef')
      expect(resizablePanes).toHaveProperty('startResize')
      expect(resizablePanes).toHaveProperty('resetSplit')
      expect(resizablePanes).toHaveProperty('setSplitRatio')

      expect(typeof resizablePanes.startResize).toBe('function')
      expect(typeof resizablePanes.resetSplit).toBe('function')
      expect(typeof resizablePanes.setSplitRatio).toBe('function')
    })
  })

  describe('resetSplit', () => {
    it('resets left pane width to 50%', () => {
      resizablePanes.leftPaneWidth.value = 75

      resizablePanes.resetSplit()

      expect(resizablePanes.leftPaneWidth.value).toBe(50)
    })

    it('works from any initial width', () => {
      resizablePanes.leftPaneWidth.value = 25
      resizablePanes.resetSplit()
      expect(resizablePanes.leftPaneWidth.value).toBe(50)

      resizablePanes.leftPaneWidth.value = 80
      resizablePanes.resetSplit()
      expect(resizablePanes.leftPaneWidth.value).toBe(50)
    })
  })

  describe('setSplitRatio', () => {
    it('sets split ratio correctly for valid values', () => {
      resizablePanes.setSplitRatio(0.3)
      expect(resizablePanes.leftPaneWidth.value).toBe(30)

      resizablePanes.setSplitRatio(0.7)
      expect(resizablePanes.leftPaneWidth.value).toBe(70)

      resizablePanes.setSplitRatio(0.5)
      expect(resizablePanes.leftPaneWidth.value).toBe(50)
    })

    it('clamps ratio to minimum 0.2 (20%)', () => {
      resizablePanes.setSplitRatio(0.1)
      expect(resizablePanes.leftPaneWidth.value).toBe(20)

      resizablePanes.setSplitRatio(0)
      expect(resizablePanes.leftPaneWidth.value).toBe(20)

      resizablePanes.setSplitRatio(-0.5)
      expect(resizablePanes.leftPaneWidth.value).toBe(20)
    })

    it('clamps ratio to maximum 0.8 (80%)', () => {
      resizablePanes.setSplitRatio(0.9)
      expect(resizablePanes.leftPaneWidth.value).toBe(80)

      resizablePanes.setSplitRatio(1)
      expect(resizablePanes.leftPaneWidth.value).toBe(80)

      resizablePanes.setSplitRatio(1.5)
      expect(resizablePanes.leftPaneWidth.value).toBe(80)
    })

    it('handles edge cases correctly', () => {
      resizablePanes.setSplitRatio(0.2)
      expect(resizablePanes.leftPaneWidth.value).toBe(20)

      resizablePanes.setSplitRatio(0.8)
      expect(resizablePanes.leftPaneWidth.value).toBe(80)
    })
  })

  describe('startResize', () => {
    let mockEvent: MouseEvent
    let mockContainer: HTMLElement

    beforeEach(() => {
      mockEvent = {
        clientX: 500,
        preventDefault: vi.fn(),
      } as unknown as MouseEvent

      mockContainer = document.createElement('div')
      mockContainer.getBoundingClientRect = vi.fn(() => ({
        width: 1000,
        height: 600,
        left: 0,
        top: 0,
        right: 1000,
        bottom: 600,
        x: 0,
        y: 0,
        toJSON: vi.fn(),
      }))

      resizablePanes.containerRef.value = mockContainer
    })

    it('does nothing when container is not set', () => {
      resizablePanes.containerRef.value = null

      resizablePanes.startResize(mockEvent)

      expect(resizablePanes.isDragging.value).toBe(false)
      expect(mockEvent.preventDefault).not.toHaveBeenCalled()
    })

    it('sets dragging state correctly', () => {
      resizablePanes.startResize(mockEvent)

      expect(resizablePanes.isDragging.value).toBe(true)
    })

    it('sets body styles during resize', () => {
      resizablePanes.startResize(mockEvent)

      expect(document.body.style.userSelect).toBe('none')
      expect(document.body.style.cursor).toBe('col-resize')
    })

    it('prevents default event behavior', () => {
      resizablePanes.startResize(mockEvent)

      expect(mockEvent.preventDefault).toHaveBeenCalled()
    })

    it('adds event listeners to document', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener')

      resizablePanes.startResize(mockEvent)

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'mousemove',
        expect.any(Function)
      )
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'mouseup',
        expect.any(Function)
      )

      addEventListenerSpy.mockRestore()
    })
  })

  describe('resize handling', () => {
    let mockContainer: HTMLElement

    beforeEach(() => {
      mockContainer = document.createElement('div')
      mockContainer.getBoundingClientRect = vi.fn(() => ({
        width: 1000,
        height: 600,
        left: 0,
        top: 0,
        right: 1000,
        bottom: 600,
        x: 0,
        y: 0,
        toJSON: vi.fn(),
      }))

      resizablePanes.containerRef.value = mockContainer
    })

    it('handles resize when dragging', () => {
      // Start resize
      const startEvent = {
        clientX: 500,
        preventDefault: vi.fn(),
      } as unknown as MouseEvent

      resizablePanes.startResize(startEvent)

      // For this test, we'll verify the width changes by simulating a full resize cycle
      // The handleResize function is not exposed, but we can verify dragging state
      expect(resizablePanes.isDragging.value).toBe(true)
    })

    it('constrains width within bounds during resize', () => {
      resizablePanes.leftPaneWidth.value = 50

      // Test that the component has proper initialization
      expect(resizablePanes.leftPaneWidth.value).toBe(50)

      // Test setSplitRatio which uses the same constraints as handleResize
      resizablePanes.setSplitRatio(0.1) // Should be clamped to 0.2 (20%)
      expect(resizablePanes.leftPaneWidth.value).toBe(20)

      resizablePanes.setSplitRatio(0.9) // Should be clamped to 0.8 (80%)
      expect(resizablePanes.leftPaneWidth.value).toBe(80)
    })
  })

  describe('stopResize', () => {
    beforeEach(() => {
      const mockContainer = document.createElement('div')
      resizablePanes.containerRef.value = mockContainer

      // Start a resize operation first
      const mockEvent = {
        clientX: 500,
        preventDefault: vi.fn(),
      } as unknown as MouseEvent

      resizablePanes.startResize(mockEvent)
    })

    it('stops dragging state', () => {
      expect(resizablePanes.isDragging.value).toBe(true)

      // Simulate mouseup event which calls stopResize
      const mouseUpEvent = new MouseEvent('mouseup')
      document.dispatchEvent(mouseUpEvent)

      expect(resizablePanes.isDragging.value).toBe(false)
    })

    it('restores body styles', () => {
      expect(document.body.style.userSelect).toBe('none')
      expect(document.body.style.cursor).toBe('col-resize')

      // Simulate mouseup event
      const mouseUpEvent = new MouseEvent('mouseup')
      document.dispatchEvent(mouseUpEvent)

      expect(document.body.style.userSelect).toBe('')
      expect(document.body.style.cursor).toBe('')
    })

    it('removes event listeners from document', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')

      // Simulate mouseup event
      const mouseUpEvent = new MouseEvent('mouseup')
      document.dispatchEvent(mouseUpEvent)

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'mousemove',
        expect.any(Function)
      )
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'mouseup',
        expect.any(Function)
      )

      removeEventListenerSpy.mockRestore()
    })
  })

  describe('edge cases and error handling', () => {
    it('handles missing container during resize operations', () => {
      resizablePanes.containerRef.value = null

      // Should not throw when starting resize without container
      const mockEvent = {
        clientX: 500,
        preventDefault: vi.fn(),
      } as unknown as MouseEvent

      expect(() => resizablePanes.startResize(mockEvent)).not.toThrow()
      expect(resizablePanes.isDragging.value).toBe(false)
    })

    it('handles multiple calls to resetSplit', () => {
      resizablePanes.resetSplit()
      expect(resizablePanes.leftPaneWidth.value).toBe(50)

      resizablePanes.resetSplit()
      expect(resizablePanes.leftPaneWidth.value).toBe(50)
    })

    it('handles setSplitRatio with extreme values', () => {
      resizablePanes.setSplitRatio(Number.POSITIVE_INFINITY)
      expect(resizablePanes.leftPaneWidth.value).toBe(80)

      resizablePanes.setSplitRatio(Number.NEGATIVE_INFINITY)
      expect(resizablePanes.leftPaneWidth.value).toBe(20)

      resizablePanes.setSplitRatio(NaN)
      expect(resizablePanes.leftPaneWidth.value).toBeNaN()
    })
  })

  describe('reactive properties', () => {
    it('isDragging is reactive', () => {
      expect(resizablePanes.isDragging.value).toBe(false)

      const mockContainer = document.createElement('div')
      resizablePanes.containerRef.value = mockContainer

      const mockEvent = {
        clientX: 500,
        preventDefault: vi.fn(),
      } as unknown as MouseEvent

      resizablePanes.startResize(mockEvent)
      expect(resizablePanes.isDragging.value).toBe(true)
    })

    it('leftPaneWidth is reactive', () => {
      expect(resizablePanes.leftPaneWidth.value).toBe(50)

      resizablePanes.setSplitRatio(0.3)
      expect(resizablePanes.leftPaneWidth.value).toBe(30)

      resizablePanes.resetSplit()
      expect(resizablePanes.leftPaneWidth.value).toBe(50)
    })

    it('containerRef and resizeHandleRef can be set', () => {
      const container = document.createElement('div')
      const handle = document.createElement('div')

      resizablePanes.containerRef.value = container
      resizablePanes.resizeHandleRef.value = handle

      expect(resizablePanes.containerRef.value).toBe(container)
      expect(resizablePanes.resizeHandleRef.value).toBe(handle)
    })
  })
})
