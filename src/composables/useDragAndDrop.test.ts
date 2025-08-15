import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ref, nextTick } from 'vue'
import { useDragAndDrop, type DragAndDropOptions } from './useDragAndDrop'

// Mock file types for testing
const createMockFile = (
  name: string,
  type: string,
  size: number = 1024
): File => {
  const file = new File(['test content'], name, { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

const createMockDataTransfer = (
  files: File[] = [],
  items: DataTransferItem[] = []
): DataTransfer => {
  const mockFiles = {
    length: files.length,
    item: (index: number) => files[index] || null,
    [Symbol.iterator]: function* () {
      for (let i = 0; i < files.length; i++) {
        yield files[i]
      }
    },
  } as FileList

  // Add files as indexed properties
  for (let i = 0; i < files.length; i++) {
    ;(mockFiles as any)[i] = files[i]
  }

  const mockItems = {
    length: items.length,
    add: vi.fn(),
    clear: vi.fn(),
    remove: vi.fn(),
    [Symbol.iterator]: function* () {
      for (let i = 0; i < items.length; i++) {
        yield items[i]
      }
    },
  } as DataTransferItemList

  // Add items as indexed properties
  for (let i = 0; i < items.length; i++) {
    ;(mockItems as any)[i] = items[i]
  }

  const dataTransfer = {
    files: mockFiles,
    items: mockItems,
    dropEffect: 'none' as DataTransfer['dropEffect'],
    effectAllowed: 'all' as DataTransfer['effectAllowed'],
  } as DataTransfer

  return dataTransfer
}

const createMockDataTransferItem = (
  kind: string,
  type: string
): DataTransferItem => {
  return {
    kind,
    type,
    getAsFile: () =>
      kind === 'file' ? createMockFile('test.jpg', type) : null,
    getAsString: vi.fn(),
    webkitGetAsEntry: () => null,
  } as DataTransferItem
}

const createMockDragEvent = (
  type: string,
  dataTransfer?: DataTransfer
): DragEvent => {
  return new DragEvent(type, {
    dataTransfer,
    bubbles: true,
    cancelable: true,
  })
}

describe('useDragAndDrop', () => {
  let targetElement: HTMLElement
  let targetRef: ReturnType<typeof ref<HTMLElement | null>>
  let mockOnFilesDropped: ReturnType<typeof vi.fn>

  // Helper function to set up drag and drop with event listeners attached
  const setupDragAndDrop = (options: DragAndDropOptions = {}) => {
    const composable = useDragAndDrop(targetRef, {
      onFilesDropped: mockOnFilesDropped,
      ...options,
    })
    composable.attachEventListeners()
    return composable
  }

  beforeEach(() => {
    // Create a real DOM element
    targetElement = document.createElement('div')
    document.body.appendChild(targetElement)
    targetRef = ref(targetElement)
    mockOnFilesDropped = vi.fn()
  })

  afterEach(() => {
    document.body.removeChild(targetElement)
    vi.clearAllMocks()
  })

  describe('Basic Setup', () => {
    it('should initialize with correct default values', () => {
      const { isDragging } = useDragAndDrop(targetRef)

      expect(isDragging.value).toBe(false)
    })

    it('should accept custom options', () => {
      const options = {
        onFilesDropped: mockOnFilesDropped,
        acceptedTypes: ['image/jpeg', 'image/png'],
        maxFiles: 5,
        disabled: false,
      }

      const { isDragging } = useDragAndDrop(targetRef, options)

      expect(isDragging.value).toBe(false)
    })

    it('should attach event listeners when mounted', async () => {
      const addEventListenerSpy = vi.spyOn(targetElement, 'addEventListener')

      const { attachEventListeners } = useDragAndDrop(targetRef, {
        onFilesDropped: mockOnFilesDropped,
      })

      // Manually call attachEventListeners since onMounted doesn't run in tests
      attachEventListeners()

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'dragenter',
        expect.any(Function)
      )
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'dragover',
        expect.any(Function)
      )
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'dragleave',
        expect.any(Function)
      )
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'drop',
        expect.any(Function)
      )
    })
  })

  describe('File Validation', () => {
    it('should accept files matching accepted types', () => {
      const jpegFile = createMockFile('test.jpg', 'image/jpeg')
      const pngFile = createMockFile('test.png', 'image/png')
      const dataTransfer = createMockDataTransfer([jpegFile, pngFile])

      const dropEvent = createMockDragEvent('drop', dataTransfer)

      setupDragAndDrop({ acceptedTypes: ['image/*'] })
      targetElement.dispatchEvent(dropEvent)

      expect(mockOnFilesDropped).toHaveBeenCalledWith([jpegFile, pngFile])
    })

    it('should filter out files not matching accepted types', () => {
      const jpegFile = createMockFile('test.jpg', 'image/jpeg')
      const textFile = createMockFile('test.txt', 'text/plain')
      const dataTransfer = createMockDataTransfer([jpegFile, textFile])

      const dropEvent = createMockDragEvent('drop', dataTransfer)

      setupDragAndDrop({ acceptedTypes: ['image/*'] })
      targetElement.dispatchEvent(dropEvent)

      expect(mockOnFilesDropped).toHaveBeenCalledWith([jpegFile])
    })

    it('should accept specific file types', () => {
      const jpegFile = createMockFile('test.jpg', 'image/jpeg')
      const pngFile = createMockFile('test.png', 'image/png')
      const gifFile = createMockFile('test.gif', 'image/gif')
      const dataTransfer = createMockDataTransfer([jpegFile, pngFile, gifFile])

      const dropEvent = createMockDragEvent('drop', dataTransfer)

      setupDragAndDrop({ acceptedTypes: ['image/jpeg', 'image/png'] })
      targetElement.dispatchEvent(dropEvent)

      expect(mockOnFilesDropped).toHaveBeenCalledWith([jpegFile, pngFile])
    })

    it('should limit number of files based on maxFiles option', () => {
      const files = [
        createMockFile('test1.jpg', 'image/jpeg'),
        createMockFile('test2.jpg', 'image/jpeg'),
        createMockFile('test3.jpg', 'image/jpeg'),
        createMockFile('test4.jpg', 'image/jpeg'),
      ]
      const dataTransfer = createMockDataTransfer(files)

      const dropEvent = createMockDragEvent('drop', dataTransfer)

      setupDragAndDrop({ acceptedTypes: ['image/*'], maxFiles: 2 })
      targetElement.dispatchEvent(dropEvent)

      expect(mockOnFilesDropped).toHaveBeenCalledWith([files[0], files[1]])
    })

    it('should accept all file types when acceptedTypes is empty', () => {
      const jpegFile = createMockFile('test.jpg', 'image/jpeg')
      const textFile = createMockFile('test.txt', 'text/plain')
      const dataTransfer = createMockDataTransfer([jpegFile, textFile])

      const dropEvent = createMockDragEvent('drop', dataTransfer)

      setupDragAndDrop({ acceptedTypes: [] })
      targetElement.dispatchEvent(dropEvent)

      expect(mockOnFilesDropped).toHaveBeenCalledWith([jpegFile, textFile])
    })
  })

  describe('Drag Events', () => {
    let composable: ReturnType<typeof useDragAndDrop>

    beforeEach(() => {
      composable = useDragAndDrop(targetRef, {
        onFilesDropped: mockOnFilesDropped,
        acceptedTypes: ['image/*'],
      })
      // Attach event listeners for testing
      composable.attachEventListeners()
    })

    it('should set isDragging to true on dragenter with file items', () => {
      const items = [createMockDataTransferItem('file', 'image/jpeg')]
      const dataTransfer = createMockDataTransfer([], items)
      const dragEnterEvent = createMockDragEvent('dragenter', dataTransfer)

      targetElement.dispatchEvent(dragEnterEvent)

      expect(composable.isDragging.value).toBe(true)
    })

    it('should not set isDragging to true on dragenter without file items', () => {
      const items = [createMockDataTransferItem('string', 'text/plain')]
      const dataTransfer = createMockDataTransfer([], items)
      const dragEnterEvent = createMockDragEvent('dragenter', dataTransfer)

      targetElement.dispatchEvent(dragEnterEvent)

      expect(composable.isDragging.value).toBe(false)
    })

    it('should set dropEffect to copy on dragover', () => {
      const dataTransfer = createMockDataTransfer()
      const dragOverEvent = createMockDragEvent('dragover', dataTransfer)

      targetElement.dispatchEvent(dragOverEvent)

      expect(dataTransfer.dropEffect).toBe('copy')
    })

    it('should reset isDragging on dragleave when counter reaches zero', () => {
      // First dragenter
      const items = [createMockDataTransferItem('file', 'image/jpeg')]
      const dataTransfer1 = createMockDataTransfer([], items)
      const dragEnterEvent1 = createMockDragEvent('dragenter', dataTransfer1)

      targetElement.dispatchEvent(dragEnterEvent1)
      expect(composable.isDragging.value).toBe(true)

      // Dragleave
      const dragLeaveEvent = createMockDragEvent('dragleave')
      targetElement.dispatchEvent(dragLeaveEvent)

      expect(composable.isDragging.value).toBe(false)
    })

    it('should handle multiple dragenter/dragleave events correctly', () => {
      const items = [createMockDataTransferItem('file', 'image/jpeg')]

      // First dragenter
      const dataTransfer1 = createMockDataTransfer([], items)
      const dragEnterEvent1 = createMockDragEvent('dragenter', dataTransfer1)
      targetElement.dispatchEvent(dragEnterEvent1)
      expect(composable.isDragging.value).toBe(true)

      // Second dragenter (nested element)
      const dataTransfer2 = createMockDataTransfer([], items)
      const dragEnterEvent2 = createMockDragEvent('dragenter', dataTransfer2)
      targetElement.dispatchEvent(dragEnterEvent2)
      expect(composable.isDragging.value).toBe(true)

      // First dragleave
      const dragLeaveEvent1 = createMockDragEvent('dragleave')
      targetElement.dispatchEvent(dragLeaveEvent1)
      expect(composable.isDragging.value).toBe(true) // Still dragging

      // Second dragleave
      const dragLeaveEvent2 = createMockDragEvent('dragleave')
      targetElement.dispatchEvent(dragLeaveEvent2)
      expect(composable.isDragging.value).toBe(false) // Now not dragging
    })

    it('should reset isDragging and counter on drop', () => {
      // Setup dragging state
      const items = [createMockDataTransferItem('file', 'image/jpeg')]
      const dataTransfer1 = createMockDataTransfer([], items)
      const dragEnterEvent = createMockDragEvent('dragenter', dataTransfer1)
      targetElement.dispatchEvent(dragEnterEvent)

      // Drop files
      const files = [createMockFile('test.jpg', 'image/jpeg')]
      const dataTransfer2 = createMockDataTransfer(files)
      const dropEvent = createMockDragEvent('drop', dataTransfer2)

      targetElement.dispatchEvent(dropEvent)

      expect(composable.isDragging.value).toBe(false)
      expect(mockOnFilesDropped).toHaveBeenCalledWith(files)
    })
  })

  describe('Disabled State', () => {
    it('should not handle events when disabled', () => {
      const { isDragging } = setupDragAndDrop({ disabled: true })

      const items = [createMockDataTransferItem('file', 'image/jpeg')]
      const dataTransfer = createMockDataTransfer([], items)
      const dragEnterEvent = createMockDragEvent('dragenter', dataTransfer)

      targetElement.dispatchEvent(dragEnterEvent)

      expect(isDragging.value).toBe(false)
    })

    it('should not call onFilesDropped when disabled', () => {
      setupDragAndDrop({ disabled: true })

      const files = [createMockFile('test.jpg', 'image/jpeg')]
      const dataTransfer = createMockDataTransfer(files)
      const dropEvent = createMockDragEvent('drop', dataTransfer)

      targetElement.dispatchEvent(dropEvent)

      expect(mockOnFilesDropped).not.toHaveBeenCalled()
    })
  })

  describe('Event Prevention', () => {
    it('should prevent default and stop propagation on all drag events', () => {
      setupDragAndDrop()

      const events = ['dragenter', 'dragover', 'dragleave', 'drop']

      events.forEach((eventType) => {
        const mockEvent = createMockDragEvent(eventType)
        const preventDefaultSpy = vi.spyOn(mockEvent, 'preventDefault')
        const stopPropagationSpy = vi.spyOn(mockEvent, 'stopPropagation')

        targetElement.dispatchEvent(mockEvent)

        expect(preventDefaultSpy).toHaveBeenCalled()
        expect(stopPropagationSpy).toHaveBeenCalled()
      })
    })
  })

  describe('Cleanup', () => {
    it('should remove event listeners when unmounted', () => {
      const removeEventListenerSpy = vi.spyOn(
        targetElement,
        'removeEventListener'
      )

      const { attachEventListeners, removeEventListeners } = useDragAndDrop(
        targetRef,
        {
          onFilesDropped: mockOnFilesDropped,
        }
      )

      // Manually call removeEventListeners to test cleanup
      removeEventListeners()

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'dragenter',
        expect.any(Function)
      )
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'dragover',
        expect.any(Function)
      )
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'dragleave',
        expect.any(Function)
      )
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'drop',
        expect.any(Function)
      )
    })

    it('should handle null targetRef gracefully', () => {
      const nullRef = ref<HTMLElement | null>(null)

      expect(() => {
        const { removeEventListeners } = useDragAndDrop(nullRef, {
          onFilesDropped: mockOnFilesDropped,
        })
        removeEventListeners()
      }).not.toThrow()
    })
  })

  describe('Edge Cases', () => {
    it('should handle drop event without files gracefully', () => {
      setupDragAndDrop()

      const dataTransfer = createMockDataTransfer() // No files
      const dropEvent = createMockDragEvent('drop', dataTransfer)

      targetElement.dispatchEvent(dropEvent)

      expect(mockOnFilesDropped).not.toHaveBeenCalled()
    })

    it('should handle drop event without dataTransfer gracefully', () => {
      setupDragAndDrop()

      const dropEvent = createMockDragEvent('drop') // No dataTransfer

      expect(() => {
        targetElement.dispatchEvent(dropEvent)
      }).not.toThrow()

      expect(mockOnFilesDropped).not.toHaveBeenCalled()
    })

    it('should handle drag events without onFilesDropped callback', () => {
      const composable = useDragAndDrop(targetRef) // No onFilesDropped
      composable.attachEventListeners()

      const files = [createMockFile('test.jpg', 'image/jpeg')]
      const dataTransfer = createMockDataTransfer(files)
      const dropEvent = createMockDragEvent('drop', dataTransfer)

      expect(() => {
        targetElement.dispatchEvent(dropEvent)
      }).not.toThrow()

      expect(composable.isDragging.value).toBe(false)
    })

    it('should handle empty file list gracefully', () => {
      setupDragAndDrop()

      const dataTransfer = createMockDataTransfer([]) // Empty file list
      const dropEvent = createMockDragEvent('drop', dataTransfer)

      targetElement.dispatchEvent(dropEvent)

      expect(mockOnFilesDropped).not.toHaveBeenCalled()
    })

    it('should handle files that do not match accepted types', () => {
      setupDragAndDrop({ acceptedTypes: ['image/*'] })

      const textFile = createMockFile('test.txt', 'text/plain')
      const dataTransfer = createMockDataTransfer([textFile])
      const dropEvent = createMockDragEvent('drop', dataTransfer)

      targetElement.dispatchEvent(dropEvent)

      expect(mockOnFilesDropped).not.toHaveBeenCalled()
    })
  })

  describe('Performance', () => {
    it('should handle large number of files efficiently', () => {
      const files = Array.from({ length: 100 }, (_, i) =>
        createMockFile(`test${i}.jpg`, 'image/jpeg')
      )
      const dataTransfer = createMockDataTransfer(files)
      const dropEvent = createMockDragEvent('drop', dataTransfer)

      setupDragAndDrop({ acceptedTypes: ['image/*'], maxFiles: 10 })

      const startTime = performance.now()
      targetElement.dispatchEvent(dropEvent)
      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(100) // Should process quickly
      expect(mockOnFilesDropped).toHaveBeenCalledWith(files.slice(0, 10))
    })
  })
})
