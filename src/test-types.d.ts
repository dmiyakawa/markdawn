/// <reference types="vitest/globals" />

declare global {
  var global: typeof globalThis & {
    ResizeObserver: typeof ResizeObserver
    IntersectionObserver: typeof IntersectionObserver
    Range: typeof Range
    DragEvent: typeof DragEvent
    DataTransfer: typeof DataTransfer
    URL: typeof URL
  }

  interface Window {
    matchMedia: (query: string) => MediaQueryList
  }
}

export {}
