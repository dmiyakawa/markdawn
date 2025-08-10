import { ref, onUnmounted } from 'vue'

/**
 * Resizable panes composable for split layouts
 * Provides drag-to-resize functionality between editor and preview panes
 */
export function useResizablePanes() {
  const isDragging = ref(false)
  const leftPaneWidth = ref(50) // Percentage
  const containerRef = ref<HTMLElement | null>(null)
  const resizeHandleRef = ref<HTMLElement | null>(null)

  let startX = 0
  let startLeftWidth = 0

  /**
   * Start resize operation
   */
  const startResize = (event: MouseEvent) => {
    if (!containerRef.value) return

    isDragging.value = true
    startX = event.clientX
    startLeftWidth = leftPaneWidth.value

    // Prevent text selection during resize
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'col-resize'

    // Add global event listeners
    document.addEventListener('mousemove', handleResize)
    document.addEventListener('mouseup', stopResize)

    event.preventDefault()
  }

  /**
   * Handle resize during drag
   */
  const handleResize = (event: MouseEvent) => {
    if (!isDragging.value || !containerRef.value) return

    const container = containerRef.value
    const containerRect = container.getBoundingClientRect()
    const containerWidth = containerRect.width

    // Calculate the change in mouse position
    const deltaX = event.clientX - startX
    const deltaPercent = (deltaX / containerWidth) * 100

    // Update left pane width with constraints
    let newLeftWidth = startLeftWidth + deltaPercent

    // Constrain between 20% and 80%
    newLeftWidth = Math.max(20, Math.min(80, newLeftWidth))

    leftPaneWidth.value = newLeftWidth
  }

  /**
   * Stop resize operation
   */
  const stopResize = () => {
    isDragging.value = false

    // Restore body styles
    document.body.style.userSelect = ''
    document.body.style.cursor = ''

    // Remove global event listeners
    document.removeEventListener('mousemove', handleResize)
    document.removeEventListener('mouseup', stopResize)
  }

  /**
   * Reset to equal split
   */
  const resetSplit = () => {
    leftPaneWidth.value = 50
  }

  /**
   * Set specific width ratio
   */
  const setSplitRatio = (ratio: number) => {
    // Clamp ratio between 0.2 and 0.8
    const clampedRatio = Math.max(0.2, Math.min(0.8, ratio))
    leftPaneWidth.value = clampedRatio * 100
  }

  // Cleanup on unmount
  onUnmounted(() => {
    document.removeEventListener('mousemove', handleResize)
    document.removeEventListener('mouseup', stopResize)
  })

  return {
    isDragging,
    leftPaneWidth,
    containerRef,
    resizeHandleRef,
    startResize,
    resetSplit,
    setSplitRatio,
  }
}
