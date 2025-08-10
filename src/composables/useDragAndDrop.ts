import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export interface DragAndDropOptions {
  onFilesDropped?: (files: File[]) => void
  acceptedTypes?: string[]
  maxFiles?: number
  disabled?: boolean
}

export function useDragAndDrop(
  targetRef: Ref<HTMLElement | null>,
  options: DragAndDropOptions = {}
) {
  const {
    onFilesDropped,
    acceptedTypes = ['image/*'],
    maxFiles = 10,
    disabled = false,
  } = options

  const isDragging = ref(false)
  const dragCounter = ref(0)

  const isValidFile = (file: File): boolean => {
    if (acceptedTypes.length === 0) return true

    return acceptedTypes.some((type) => {
      if (type.endsWith('/*')) {
        const category = type.replace('/*', '')
        return file.type.startsWith(category)
      }
      return file.type === type
    })
  }

  const getValidFiles = (files: FileList | File[]): File[] => {
    const fileArray = Array.from(files)
    const validFiles = fileArray.filter(isValidFile)

    // Limit number of files
    return validFiles.slice(0, maxFiles)
  }

  const handleDragEnter = (event: DragEvent) => {
    if (disabled) return

    event.preventDefault()
    event.stopPropagation()

    dragCounter.value++

    if (event.dataTransfer?.items) {
      // Check if any of the dragged items are files
      const hasFiles = Array.from(event.dataTransfer.items).some(
        (item) => item.kind === 'file'
      )

      if (hasFiles) {
        isDragging.value = true
      }
    }
  }

  const handleDragOver = (event: DragEvent) => {
    if (disabled) return

    event.preventDefault()
    event.stopPropagation()

    // Set dropEffect to indicate this is a valid drop zone
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy'
    }
  }

  const handleDragLeave = (event: DragEvent) => {
    if (disabled) return

    event.preventDefault()
    event.stopPropagation()

    dragCounter.value--

    if (dragCounter.value <= 0) {
      isDragging.value = false
      dragCounter.value = 0
    }
  }

  const handleDrop = (event: DragEvent) => {
    if (disabled) return

    event.preventDefault()
    event.stopPropagation()

    isDragging.value = false
    dragCounter.value = 0

    const files = event.dataTransfer?.files
    if (files && files.length > 0) {
      const validFiles = getValidFiles(files)

      if (validFiles.length > 0 && onFilesDropped) {
        onFilesDropped(validFiles)
      }
    }
  }

  const attachEventListeners = () => {
    const target = targetRef.value
    if (!target) return

    target.addEventListener('dragenter', handleDragEnter)
    target.addEventListener('dragover', handleDragOver)
    target.addEventListener('dragleave', handleDragLeave)
    target.addEventListener('drop', handleDrop)
  }

  const removeEventListeners = () => {
    const target = targetRef.value
    if (!target) return

    target.removeEventListener('dragenter', handleDragEnter)
    target.removeEventListener('dragover', handleDragOver)
    target.removeEventListener('dragleave', handleDragLeave)
    target.removeEventListener('drop', handleDrop)
  }

  onMounted(() => {
    attachEventListeners()
  })

  onUnmounted(() => {
    removeEventListeners()
  })

  return {
    isDragging,
    attachEventListeners,
    removeEventListeners,
  }
}
