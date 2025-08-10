<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <h1 class="text-xl font-semibold text-gray-900">Markdown Editor</h1>
          <div class="flex space-x-2">
            <button
              @click="togglePreview"
              :class="[
                'px-3 py-1 text-sm rounded',
                showPreview
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
              ]"
            >
              Preview
            </button>
            <button
              @click="toggleWysiwyg"
              :class="[
                'px-3 py-1 text-sm rounded',
                wysiwygMode
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
              ]"
            >
              WYSIWYG
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-120px)]">
        <!-- Editor Panel -->
        <div class="bg-white rounded-lg shadow">
          <div class="p-4 border-b">
            <h2 class="text-lg font-medium text-gray-900">
              {{ wysiwygMode ? 'WYSIWYG Editor' : 'Markdown Editor' }}
            </h2>
          </div>
          <div class="p-4 h-full">
            <textarea
              v-if="!wysiwygMode"
              v-model="markdownContent"
              class="w-full h-full resize-none border-none focus:ring-0 focus:outline-none font-mono text-sm"
              placeholder="Start typing your markdown here..."
            />
            <div
              v-else
              contenteditable="true"
              class="w-full h-full focus:outline-none prose prose-sm max-w-none"
              @input="handleWysiwygInput"
              v-html="renderedHtml"
            />
          </div>
        </div>

        <!-- Preview Panel -->
        <div v-if="showPreview" class="bg-white rounded-lg shadow">
          <div class="p-4 border-b">
            <h2 class="text-lg font-medium text-gray-900">Preview</h2>
          </div>
          <div class="p-4 h-full overflow-auto">
            <div class="prose prose-sm max-w-none" v-html="renderedHtml" />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { convertMarkdownToHtml, convertHtmlToMarkdown } from './utils/markdown'

const markdownContent = ref(
  `# Welcome to Markdown Editor

Start editing your **markdown** content here! This editor supports:

## Features
- **Bold text** and *italic text*
- [Links](https://example.com)
- \`inline code\`
- Lists and more!

### Code Example
\`\`\`javascript
function hello() {
  console.log("Hello, world!");
}
\`\`\`

### Task List
- [x] Set up markdown editor
- [ ] Add more features
- [ ] Deploy the app

> **Tip**: Toggle between edit and preview modes using the buttons above!`
)
const showPreview = ref(true)
const wysiwygMode = ref(false)

const togglePreview = () => {
  showPreview.value = !showPreview.value
}

const toggleWysiwyg = () => {
  wysiwygMode.value = !wysiwygMode.value
}

const renderedHtml = computed(() => {
  return convertMarkdownToHtml(markdownContent.value)
})

const handleWysiwygInput = (event: Event) => {
  const target = event.target as HTMLElement
  // Convert HTML content back to markdown
  if (target.innerHTML) {
    markdownContent.value = convertHtmlToMarkdown(target.innerHTML)
  } else {
    markdownContent.value = target.innerText || ''
  }
}
</script>
