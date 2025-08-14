<template>
  <div class="image-manager bg-white rounded-lg shadow border border-gray-200">
    <!-- Header -->
    <div class="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-medium text-gray-900">Image Gallery</h3>
        <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-500">{{ images.length }} images</span>
          <button
            v-if="selectedImages.length > 0"
            @click="clearSelection"
            class="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Clear Selection
          </button>
          <button
            v-if="selectedImages.length > 0"
            @click="deleteSelected"
            class="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete Selected ({{ selectedImages.length }})
          </button>
          <button
            @click="$emit('close')"
            class="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
      
      <!-- Search and Filter Bar -->
      <div class="mt-3 flex items-center space-x-3">
        <div class="flex-1">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search images by name..."
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          v-model="sortBy"
          class="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="uploadedAt">Date Uploaded</option>
          <option value="name">Name</option>
          <option value="size">File Size</option>
        </select>
        <button
          @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'"
          class="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          {{ sortOrder === 'asc' ? '↑' : '↓' }}
        </button>
      </div>
    </div>

    <!-- Image Grid -->
    <div class="p-4">
      <div v-if="filteredImages.length === 0" class="text-center py-12">
        <div class="text-gray-400 mb-2">
          <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p class="text-gray-500">{{ searchQuery ? 'No images match your search' : 'No images stored yet' }}</p>
        <p class="text-sm text-gray-400 mt-1">
          {{ searchQuery ? 'Try a different search term' : 'Upload images using the Insert menu' }}
        </p>
      </div>

      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <div
          v-for="image in filteredImages"
          :key="image.id"
          class="relative group bg-gray-50 rounded-lg overflow-hidden border-2 transition-all duration-200"
          :class="{
            'border-blue-500 bg-blue-50': selectedImages.includes(image.id),
            'border-gray-200 hover:border-gray-300': !selectedImages.includes(image.id)
          }"
        >
          <!-- Selection Checkbox -->
          <div class="absolute top-2 left-2 z-10">
            <input
              type="checkbox"
              :value="image.id"
              v-model="selectedImages"
              class="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
          </div>

          <!-- Image Preview -->
          <div class="relative" style="aspect-ratio: 1 / 1;">
            <img
              :src="image.data"
              :alt="image.name"
              class="w-full h-full object-cover cursor-pointer"
              @click="selectForInsertion(image)"
              @error="handleImageError(image)"
            />
            
            <!-- Overlay with actions -->
            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
              <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                <button
                  @click="selectForInsertion(image)"
                  class="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                  title="Insert into document"
                >
                  Insert
                </button>
                <button
                  @click="previewImage(image)"
                  class="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                  title="Preview image"
                >
                  Preview
                </button>
                <button
                  @click="deleteImage(image.id)"
                  class="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                  title="Delete image"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>

          <!-- Image Info -->
          <div class="p-2">
            <p class="text-xs font-medium text-gray-900 truncate" :title="image.name">
              {{ image.name }}
            </p>
            <div class="flex justify-between items-center mt-1">
              <span class="text-xs text-gray-500">{{ formatFileSize(image.size) }}</span>
              <span class="text-xs text-gray-500">{{ image.width }}×{{ image.height }}</span>
            </div>
            <div class="flex justify-between items-center mt-1">
              <span class="text-xs text-gray-400">{{ formatDate(image.uploadedAt) }}</span>
              <span 
                class="text-xs px-1.5 py-0.5 rounded"
                :class="imageUsageStats[image.id] > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'"
                :title="imageUsageStats[image.id] > 0 ? `Used ${imageUsageStats[image.id]} time${imageUsageStats[image.id] > 1 ? 's' : ''} in documents` : 'Not used in any document'"
              >
                {{ imageUsageStats[image.id] || 0 }} use{{ (imageUsageStats[image.id] || 0) === 1 ? '' : 's' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Preview Modal -->
    <div
      v-if="previewingImage"
      class="fixed inset-0 bg-black/75 flex flex-col items-center justify-center z-50 p-4"
      @click="closePreview"
    >
      <!-- Close button -->
      <button
        @click="closePreview"
        class="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/75 z-10"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Image container -->
      <div class="flex-1 flex items-center justify-center min-h-0 w-full max-w-5xl">
        <img
          :src="previewingImage.data"
          :alt="previewingImage.name"
          class="max-w-full max-h-full object-contain"
          @click.stop
        />
      </div>

      <!-- Image details panel - always at bottom -->
      <div class="mt-4 bg-black/50 text-white p-3 rounded-lg w-full max-w-lg">
        <p class="font-medium text-center">{{ previewingImage.name }}</p>
        <p class="text-sm opacity-75 text-center">
          {{ previewingImage.width }}×{{ previewingImage.height }} • {{ formatFileSize(previewingImage.size) }}
        </p>
        <p class="text-xs opacity-60 text-center mt-1">
          {{ formatDate(previewingImage.uploadedAt) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getStoredImages, deleteStoredImage, countImageUsage, findDocumentsUsingImage, type StoredImage } from '../utils/imageOperations'

// Props
const props = defineProps<{
  documents: Array<{id: string, title: string, content: string}>
}>()

// Emits
const emit = defineEmits<{
  'close': []
  'insert-image': [image: StoredImage]
}>()

// Reactive state
const images = ref<StoredImage[]>([])
const selectedImages = ref<string[]>([])
const searchQuery = ref('')
const sortBy = ref<'uploadedAt' | 'name' | 'size'>('uploadedAt')
const sortOrder = ref<'asc' | 'desc'>('desc')
const previewingImage = ref<StoredImage | null>(null)

// Computed usage statistics
const imageUsageStats = computed(() => {
  const stats: Record<string, number> = {}
  images.value.forEach(image => {
    stats[image.id] = countImageUsage(image.id, props.documents)
  })
  return stats
})

// Load images
const loadImages = () => {
  images.value = getStoredImages()
}

// Computed filtered and sorted images
const filteredImages = computed(() => {
  let filtered = images.value

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(image => 
      image.name.toLowerCase().includes(query)
    )
  }

  // Apply sorting
  filtered.sort((a, b) => {
    let comparison = 0
    
    switch (sortBy.value) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'size':
        comparison = a.size - b.size
        break
      case 'uploadedAt':
        comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
        break
    }
    
    return sortOrder.value === 'desc' ? -comparison : comparison
  })

  return filtered
})

// Actions
const selectForInsertion = (image: StoredImage) => {
  emit('insert-image', image)
}

const deleteImage = async (imageId: string) => {
  const usage = imageUsageStats.value[imageId] || 0
  const image = images.value.find(img => img.id === imageId)
  const imageName = image?.name || 'Unknown image'
  
  let confirmMessage = `Are you sure you want to delete "${imageName}"?`
  
  if (usage > 0) {
    const usingDocuments = findDocumentsUsingImage(imageId, props.documents)
    const docList = usingDocuments.map(doc => `• ${doc.title} (${doc.count} time${doc.count > 1 ? 's' : ''})`).join('\n')
    
    confirmMessage = `⚠️ WARNING: "${imageName}" is currently being used in ${usage} location${usage > 1 ? 's' : ''} across ${usingDocuments.length} document${usingDocuments.length > 1 ? 's' : ''}:

${docList}

Deleting this image will break these references and show as missing images in your documents.

Are you sure you want to delete it anyway?`
  }
  
  if (confirm(confirmMessage)) {
    if (deleteStoredImage(imageId)) {
      loadImages()
      selectedImages.value = selectedImages.value.filter(id => id !== imageId)
    }
  }
}

const deleteSelected = async () => {
  if (selectedImages.value.length === 0) return
  
  const count = selectedImages.value.length
  const imagesInUse = selectedImages.value.filter(id => (imageUsageStats.value[id] || 0) > 0)
  
  let confirmMessage = `Are you sure you want to delete ${count} selected image${count > 1 ? 's' : ''}?`
  
  if (imagesInUse.length > 0) {
    const totalUsages = imagesInUse.reduce((total, id) => total + (imageUsageStats.value[id] || 0), 0)
    const usageDetails = imagesInUse.map(id => {
      const image = images.value.find(img => img.id === id)
      const usage = imageUsageStats.value[id] || 0
      return `• ${image?.name || 'Unknown'} (used ${usage} time${usage > 1 ? 's' : ''})`
    }).join('\n')
    
    confirmMessage = `⚠️ WARNING: ${imagesInUse.length} of the selected images are currently being used in your documents (${totalUsages} total usage${totalUsages > 1 ? 's' : ''}):

${usageDetails}

Deleting these images will break references and show as missing images in your documents.

Are you sure you want to delete ${count} selected image${count > 1 ? 's' : ''} anyway?`
  }
  
  if (confirm(confirmMessage)) {
    selectedImages.value.forEach(imageId => {
      deleteStoredImage(imageId)
    })
    loadImages()
    selectedImages.value = []
  }
}

const clearSelection = () => {
  selectedImages.value = []
}

const previewImage = (image: StoredImage) => {
  previewingImage.value = image
}

const closePreview = () => {
  previewingImage.value = null
}

const handleImageError = (image: StoredImage) => {
  console.warn('Failed to load image:', image.name)
  // Could implement broken image handling here
}

// Utility functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
  })
}

// Lifecycle
onMounted(() => {
  loadImages()
})
</script>

<style scoped>
.image-manager {
  min-height: 400px;
  max-height: 80vh;
  overflow-y: auto;
}

/* Custom scrollbar for better UX */
.image-manager::-webkit-scrollbar {
  width: 8px;
}

.image-manager::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.image-manager::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.image-manager::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>