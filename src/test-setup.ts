/**
 * Test setup file for Vitest
 * Mocks browser APIs that are not available in the test environment
 */
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import './test-types.d.ts'

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
  root: Element | null = null
  rootMargin: string = '0px'
  thresholds: readonly number[] = [0]

  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
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
  static readonly START_TO_START = 0
  static readonly START_TO_END = 1
  static readonly END_TO_END = 2
  static readonly END_TO_START = 3

  readonly START_TO_START = 0
  readonly START_TO_END = 1
  readonly END_TO_END = 2
  readonly END_TO_START = 3

  collapsed = false
  commonAncestorContainer: Node = document.createElement('div')
  endContainer: Node = document.createElement('div')
  endOffset = 0
  startContainer: Node = document.createElement('div')
  startOffset = 0

  constructor() {}

  cloneContents(): DocumentFragment {
    return document.createDocumentFragment()
  }

  cloneRange(): Range {
    return new Range()
  }

  collapse(_toStart?: boolean) {}

  compareBoundaryPoints(_how: number, _sourceRange: any): number {
    return 0
  }

  comparePoint(_node: Node, _offset: number): number {
    return 0
  }

  createContextualFragment(_fragment: string): DocumentFragment {
    return document.createDocumentFragment()
  }

  deleteContents() {}

  detach() {}

  extractContents(): DocumentFragment {
    return document.createDocumentFragment()
  }

  getClientRects() {
    const mockDOMRectList: DOMRectList = {
      length: 0,
      item: (index: number): null => null,
      [Symbol.iterator]: function () {
        return {
          next() {
            return { done: true, value: undefined }
          },
          [Symbol.iterator]() {
            return this
          },
        }
      },
    } as DOMRectList
    return mockDOMRectList
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
      toJSON: () => ({}),
    }
  }

  insertNode(_node: Node) {}

  intersectsNode(_node: Node): boolean {
    return false
  }

  isPointInRange(_node: Node, _offset: number): boolean {
    return false
  }

  selectNode(_node: Node) {}

  selectNodeContents(_node: Node) {}

  setEnd(_node: Node, _offset: number) {}

  setEndAfter(_node: Node) {}

  setEndBefore(_node: Node) {}

  setStart(_node: Node, _offset: number) {}

  setStartAfter(_node: Node) {}

  setStartBefore(_node: Node) {}

  surroundContents(_newParent: Node) {}

  toString(): string {
    return ''
  }
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

  setData(_format: string, _data: string) {}
  getData(_format: string): string {
    return ''
  }
  clearData(_format?: string) {}
  setDragImage(_image: Element, _x: number, _y: number) {}
} as any

// Define DragEventInit interface for TypeScript
interface DragEventInit extends EventInit {
  dataTransfer?: DataTransfer
}
