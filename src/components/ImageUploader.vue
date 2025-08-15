<template>
  <div id="image-uploader" class="image-uploader" data-testid="image-uploader">
    <!-- File Input (Hidden) -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      multiple
      @change="handleFileSelect"
      class="hidden"
    />

    <!-- Upload Button -->
    <button
      @click="triggerFileSelect"
      :disabled="uploading"
      class="px-2 py-1 text-xs rounded bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
      title="Upload images"
    >
      <span v-if="!uploading">📷 Images</span>
      <span v-else>⏳ Uploading...</span>
    </button>

    <!-- Upload Progress -->
    <div
      v-if="uploading && uploadProgress.total > 0"
      class="mt-2 text-xs text-gray-600"
    >
      Uploading {{ uploadProgress.current }} of
      {{ uploadProgress.total }} images...
    </div>

    <!-- Upload Status Messages -->
    <div v-if="uploadStatus" :class="statusClass" class="mt-2 text-xs">
      {{ uploadStatus }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ImageResizeOptions } from '../utils/imageStorage'

// Props
interface Props {
  resizeOptions?: ImageResizeOptions
  onImageInsert?: (markdown: string) => void
  maxFiles?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxFiles: 10,
  resizeOptions: () => ({
    maxWidth: 1200,
    maxHeight: 800,
    quality: 0.8,
  }),
})

// Template refs
const fileInput = ref<HTMLInputElement>()

// State
const uploading = ref(false)
const uploadStatus = ref('')
const uploadProgress = ref({ current: 0, total: 0 })

// Computed
const statusClass = computed(() => ({
  'text-green-600': uploadStatus.value.includes('success'),
  'text-red-600':
    uploadStatus.value.includes('error') ||
    uploadStatus.value.includes('failed'),
  'text-yellow-600': uploadStatus.value.includes('warning'),
}))

// Methods
const triggerFileSelect = () => {
  fileInput.value?.click()
}

const handleFileSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files || [])

  if (files.length === 0) return

  // Check file count limit
  if (files.length > props.maxFiles) {
    uploadStatus.value = `Too many files selected. Maximum ${props.maxFiles} files allowed.`
    return
  }

  await processFiles(files)

  // Clear input for repeated selections
  input.value = ''
}

const processFiles = async (files: File[]) => {
  uploading.value = true
  uploadProgress.value = { current: 0, total: files.length }
  uploadStatus.value = ''

  const results: { success: string[]; errors: string[] } = {
    success: [],
    errors: [],
  }

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    uploadProgress.value.current = i + 1

    try {
      // Process and store image (dynamic import for heavy processing)
      const { processImageForStorage } = await import(
        '../utils/imageProcessing'
      )
      const { saveImageToStorage, generateImageMarkdown } = await import(
        '../utils/imageStorage'
      )

      const processedImage = await processImageForStorage(
        file,
        props.resizeOptions
      )
      const saved = saveImageToStorage(processedImage)

      if (saved) {
        // Generate markdown and insert
        const markdown = generateImageMarkdown(processedImage)
        if (props.onImageInsert) {
          props.onImageInsert(markdown)
        }
        results.success.push(file.name)
      } else {
        results.errors.push(`${file.name}: Storage failed`)
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      results.errors.push(`${file.name}: ${errorMessage}`)
    }

    // Small delay to prevent UI blocking
    await new Promise((resolve) => setTimeout(resolve, 10))
  }

  // Show results
  if (results.success.length > 0 && results.errors.length === 0) {
    uploadStatus.value = `Successfully uploaded ${results.success.length} image(s)`
  } else if (results.success.length > 0 && results.errors.length > 0) {
    uploadStatus.value = `Uploaded ${results.success.length} image(s), ${results.errors.length} failed`
  } else {
    uploadStatus.value = `Upload failed: ${results.errors.join(', ')}`
  }

  // Clear status after delay
  setTimeout(() => {
    uploadStatus.value = ''
  }, 5000)

  uploading.value = false
  uploadProgress.value = { current: 0, total: 0 }
}

// Expose methods for parent component
defineExpose({
  triggerFileSelect,
  processFiles,
})
</script>

<style scoped>
.image-uploader {
  display: inline-block;
}
</style>
