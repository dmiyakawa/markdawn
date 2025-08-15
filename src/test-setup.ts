/**
 * Test setup file for Vitest
 * Mocks browser APIs that are not available in the test environment
 */
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

declare const global: any

// Suppress console errors during tests for intentional error testing
const originalConsoleError = console.error
console.error = (...args: unknown[]) => {
  // Only suppress errors that are intentionally triggered in tests
  const message = String(args[0])
  if (
    message.includes('Failed to load stored images') ||
    message.includes('Failed to save image to storage') ||
    message.includes('Failed to delete image from storage') ||
    message.includes('Failed to clear image storage') ||
    message.includes('Failed to save to localStorage') ||
    message.includes('Failed to load from localStorage')
  ) {
    return // Suppress these intentional test errors
  }
  originalConsoleError(...args)
}

// Mock ResizeObserver for component tests
global.ResizeObserver = class ResizeObserver {
  observe() {
    // Mock implementation - do nothing
  }
  unobserve() {
    // Mock implementation - do nothing
  }
  disconnect() {
    // Mock implementation - do nothing
  }
}

// Mock IntersectionObserver if needed in the future
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
})

// Mock URL.createObjectURL and URL.revokeObjectURL for file operations
global.URL.createObjectURL = () => 'mocked-object-url'
global.URL.revokeObjectURL = () => {}

// Mock DOM methods that CodeMirror needs
global.Range = class Range {
  constructor() {}
  getClientRects() {
    return {
      length: 0,
      item: () => null,
      [Symbol.iterator]: function* () {},
    }
  }
  getBoundingClientRect() {
    return {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
    }
  }
  setStart() {}
  setEnd() {}
  collapse() {}
}

// Mock document.createRange
Object.defineProperty(document, 'createRange', {
  value: () => new global.Range(),
})

// Mock textContent and other DOM properties CodeMirror needs
Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
  configurable: true,
  value: 100,
})

Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
  configurable: true,
  value: 100,
})

Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
  configurable: true,
  value: 100,
})

Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
  configurable: true,
  value: 100,
})

// Mock Vue warn to suppress intentional component testing warnings
const originalWarn = console.warn
console.warn = (...args: unknown[]) => {
  const message = String(args[0])
  if (
    message.includes('Unhandled error during execution') ||
    message.includes('Vue warn')
  ) {
    return // Suppress these intentional test warnings
  }
  originalWarn(...args)
}

// Mock DragEvent for drag and drop testing
global.DragEvent = class DragEvent extends Event {
  dataTransfer: DataTransfer | null

  constructor(type: string, eventInitDict?: DragEventInit) {
    super(type, eventInitDict)
    this.dataTransfer = eventInitDict?.dataTransfer || null
  }
} as any

// Mock DataTransfer for drag and drop testing
global.DataTransfer = class DataTransfer {
  dropEffect: string = 'none'
  effectAllowed: string = 'all'
  files: FileList = {
    length: 0,
    item: () => null,
    [Symbol.iterator]: function* () {},
  } as FileList
  items: DataTransferItemList = {
    length: 0,
    [Symbol.iterator]: function* () {},
  } as DataTransferItemList

  setData(format: string, data: string) {}
  getData(format: string): string {
    return ''
  }
  clearData(format?: string) {}
  setDragImage(image: Element, x: number, y: number) {}
} as any

// Define DragEventInit interface for TypeScript
interface DragEventInit extends EventInit {
  dataTransfer?: DataTransfer
}
