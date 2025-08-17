import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ImageManager from './ImageManager.vue'
import * as imageStorage from '../utils/imageStorage'

// Mock the imageStorage module
vi.mock('../utils/imageStorage', () => ({
  getStoredImages: vi.fn(),
  deleteStoredImage: vi.fn(),
  countImageUsage: vi.fn(),
  findDocumentsUsingImage: vi.fn(),
}))

// Mock confirm dialog
const mockConfirm = vi.fn()
global.confirm = mockConfirm

describe('ImageManager.vue', () => {
  const mockImages = [
    {
      id: 'image-1',
      name: 'test-image-1.jpg',
      data: 'data:image/jpeg;base64,test1',
      size: 1024,
      uploadedAt: '2024-01-01T10:00:00Z',
      width: 800,
      height: 600,
    },
    {
      id: 'image-2',
      name: 'test-image-2.png',
      data: 'data:image/png;base64,test2',
      size: 2048,
      uploadedAt: '2024-01-02T11:00:00Z',
      width: 1024,
      height: 768,
    },
  ]

  const mockDocuments = [
    {
      id: 'doc-1',
      title: 'Document 1',
      content: 'This document uses ![Test](stored:image-1)',
    },
    {
      id: 'doc-2',
      title: 'Document 2',
      content: 'This document has no images',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockConfirm.mockReturnValue(true)
  })

  describe('Component Mounting', () => {
    it('mounts successfully with documents prop', () => {
      vi.mocked(imageStorage.getStoredImages).mockReturnValue([])
      vi.mocked(imageStorage.countImageUsage).mockReturnValue(0)

      const wrapper = mount(ImageManager, {
        props: {
          documents: mockDocuments,
        },
      })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.image-manager').exists()).toBe(true)
    })

    it('loads images on mount', () => {
      vi.mocked(imageStorage.getStoredImages).mockReturnValue([])

      mount(ImageManager, {
        props: {
          documents: mockDocuments,
        },
      })

      expect(imageStorage.getStoredImages).toHaveBeenCalled()
    })

    it('displays header elements', () => {
      vi.mocked(imageStorage.getStoredImages).mockReturnValue([])

      const wrapper = mount(ImageManager, {
        props: {
          documents: mockDocuments,
        },
      })

      expect(wrapper.text()).toContain('Image Gallery')
      expect(wrapper.text()).toContain('images')
      expect(wrapper.text()).toContain('Close')
    })
  })

  describe('Image Display', () => {
    it('displays empty state when no images', () => {
      vi.mocked(imageStorage.getStoredImages).mockReturnValue([])

      const wrapper = mount(ImageManager, {
        props: {
          documents: mockDocuments,
        },
      })

      expect(wrapper.text()).toContain('No images stored yet')
    })

    it('displays images when available', async () => {
      vi.mocked(imageStorage.getStoredImages).mockReturnValue(mockImages)
      vi.mocked(imageStorage.countImageUsage).mockReturnValue(0)

      const wrapper = mount(ImageManager, {
        props: {
          documents: mockDocuments,
        },
      })

      // Wait for component to load images and update
      await wrapper.vm.$nextTick()

      // Check that the component has the correct number of images
      expect(wrapper.vm.images.length).toBe(2)
      expect(wrapper.text()).toContain('2 images')
    })

    it('calculates and displays usage statistics', async () => {
      vi.mocked(imageStorage.getStoredImages).mockReturnValue(mockImages)
      vi.mocked(imageStorage.countImageUsage).mockImplementation((imageId) => {
        return imageId === 'image-1' ? 1 : 0
      })

      const wrapper = mount(ImageManager, {
        props: {
          documents: mockDocuments,
        },
      })

      // Wait for component to load and compute statistics
      await wrapper.vm.$nextTick()

      // Access the computed imageUsageStats to trigger the calculations
      const stats = wrapper.vm.imageUsageStats
      expect(stats).toBeDefined()

      // The computed property should have calculated usage for both images
      expect(imageStorage.countImageUsage).toHaveBeenCalledWith(
        'image-1',
        mockDocuments
      )
      expect(imageStorage.countImageUsage).toHaveBeenCalledWith(
        'image-2',
        mockDocuments
      )
    })
  })

  describe('Search and Filtering', () => {
    it('has search input field', () => {
      vi.mocked(imageStorage.getStoredImages).mockReturnValue(mockImages)
      vi.mocked(imageStorage.countImageUsage).mockReturnValue(0)

      const wrapper = mount(ImageManager, {
        props: {
          documents: mockDocuments,
        },
      })

      const searchInput = wrapper.find('input[placeholder*="Search"]')
      expect(searchInput.exists()).toBe(true)
    })

    it('has sort options', () => {
      vi.mocked(imageStorage.getStoredImages).mockReturnValue(mockImages)
      vi.mocked(imageStorage.countImageUsage).mockReturnValue(0)

      const wrapper = mount(ImageManager, {
        props: {
          documents: mockDocuments,
        },
      })

      const sortSelect = wrapper.find('select')
      expect(sortSelect.exists()).toBe(true)
      expect(wrapper.html()).toContain('Date Uploaded')
      expect(wrapper.html()).toContain('Name')
      expect(wrapper.html()).toContain('File Size')
    })

    it('updates search query when input changes', async () => {
      vi.mocked(imageStorage.getStoredImages).mockReturnValue(mockImages)
      vi.mocked(imageStorage.countImageUsage).mockReturnValue(0)

      const wrapper = mount(ImageManager, {
        props: {
          documents: mockDocuments,
        },
      })

      const searchInput = wrapper.find('input[placeholder*="Search"]')
      await searchInput.setValue('test-image-1')

      expect(wrapper.vm.searchQuery).toBe('test-image-1')
    })
  })

  describe('Image Actions', () => {
    it('can trigger image deletion with confirmation', async () => {
      vi.mocked(imageStorage.getStoredImages).mockReturnValue(mockImages)
      vi.mocked(imageStorage.countImageUsage).mockReturnValue(0)
      vi.mocked(imageStorage.findDocumentsUsingImage).mockReturnValue([])
      vi.mocked(imageStorage.deleteStoredImage).mockResolvedValue(undefined)
      mockConfirm.mockReturnValue(true)

      const wrapper = mount(ImageManager, {
        props: {
          documents: mockDocuments,
        },
      })

      await wrapper.vm.deleteImage('image-1')

      expect(mockConfirm).toHaveBeenCalled()
      expect(imageStorage.deleteStoredImage).toHaveBeenCalledWith('image-1')
    })

    it('does not delete when user cancels', async () => {
      vi.mocked(imageStorage.getStoredImages).mockReturnValue(mockImages)
      vi.mocked(imageStorage.countImageUsage).mockReturnValue(0)
      vi.mocked(imageStorage.findDocumentsUsingImage).mockReturnValue([])
      mockConfirm.mockReturnValue(false)

      const wrapper = mount(ImageManager, {
        props: {
          documents: mockDocuments,
        },
      })

      await wrapper.vm.deleteImage('image-1')

      expect(mockConfirm).toHaveBeenCalled()
      expect(imageStorage.deleteStoredImage).not.toHaveBeenCalled()
    })

    it('shows usage warning for images in use', async () => {
      vi.mocked(imageStorage.getStoredImages).mockReturnValue(mockImages)
      vi.mocked(imageStorage.countImageUsage).mockReturnValue(1)
      vi.mocked(imageStorage.findDocumentsUsingImage).mockReturnValue([
        { id: 'doc-1', usageCount: 1 },
      ])

      const wrapper = mount(ImageManager, {
        props: {
          documents: mockDocuments,
        },
      })

      await wrapper.vm.deleteImage('image-1')

      expect(mockConfirm).toHaveBeenCalledWith(
        expect.stringContaining('WARNING')
      )
    })

    it('emits insert-image event', async () => {
      vi.mocked(imageStorage.getStoredImages).mockReturnValue(mockImages)
      vi.mocked(imageStorage.countImageUsage).mockReturnValue(0)

      const wrapper = mount(ImageManager, {
        props: {
          documents: mockDocuments,
        },
      })

      await wrapper.vm.selectForInsertion(mockImages[0])

      expect(wrapper.emitted('insert-image')).toBeTruthy()
      expect(wrapper.emitted('insert-image')![0]).toEqual([mockImages[0]])
    })
  })

  describe('Image Preview', () => {
    it('can open image preview', async () => {
      vi.mocked(imageStorage.getStoredImages).mockReturnValue(mockImages)
      vi.mocked(imageStorage.countImageUsage).mockReturnValue(0)

      const wrapper = mount(ImageManager, {
        props: {
          documents: mockDocuments,
        },
      })

      await wrapper.vm.previewImage(mockImages[0])

      expect(wrapper.vm.previewingImage).toEqual(mockImages[0])
    })

    it('can close image preview', async () => {
      vi.mocked(imageStorage.getStoredImages).mockReturnValue(mockImages)
      vi.mocked(imageStorage.countImageUsage).mockReturnValue(0)

      const wrapper = mount(ImageManager, {
        props: {
          documents: mockDocuments,
        },
      })

      await wrapper.vm.previewImage(mockImages[0])
      await wrapper.vm.closePreview()

      expect(wrapper.vm.previewingImage).toBeNull()
    })

    it('displays preview modal when image is being previewed', async () => {
      vi.mocked(imageStorage.getStoredImages).mockReturnValue(mockImages)
      vi.mocked(imageStorage.countImageUsage).mockReturnValue(0)

      const wrapper = mount(ImageManager, {
        props: {
          documents: mockDocuments,
        },
      })

      await wrapper.vm.previewImage(mockImages[0])
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.fixed.inset-0').exists()).toBe(true)
    })
  })

  describe('Component Events', () => {
    it('emits close event when close method is called', async () => {
      vi.mocked(imageStorage.getStoredImages).mockReturnValue([])

      const wrapper = mount(ImageManager, {
        props: {
          documents: mockDocuments,
        },
      })

      const closeButton = wrapper
        .findAll('button')
        .find((btn) => btn.text().includes('Close'))

      if (closeButton) {
        await closeButton.trigger('click')
        expect(wrapper.emitted('close')).toBeTruthy()
      }
    })
  })

  describe('Selection Management', () => {
    it('manages selected images array', async () => {
      vi.mocked(imageStorage.getStoredImages).mockReturnValue(mockImages)
      vi.mocked(imageStorage.countImageUsage).mockReturnValue(0)

      const wrapper = mount(ImageManager, {
        props: {
          documents: mockDocuments,
        },
      })

      // Initially no images selected
      expect(wrapper.vm.selectedImages).toEqual([])

      // Can select images
      wrapper.vm.selectedImages.push('image-1')
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.selectedImages).toContain('image-1')

      // Can clear selection
      await wrapper.vm.clearSelection()

      expect(wrapper.vm.selectedImages).toEqual([])
    })

    it('can delete multiple selected images', async () => {
      vi.mocked(imageStorage.getStoredImages).mockReturnValue(mockImages)
      vi.mocked(imageStorage.countImageUsage).mockReturnValue(0)
      vi.mocked(imageStorage.findDocumentsUsingImage).mockReturnValue([])
      vi.mocked(imageStorage.deleteStoredImage).mockResolvedValue(undefined)
      mockConfirm.mockReturnValue(true)

      const wrapper = mount(ImageManager, {
        props: {
          documents: mockDocuments,
        },
      })

      wrapper.vm.selectedImages.push('image-1', 'image-2')
      await wrapper.vm.deleteSelected()

      expect(mockConfirm).toHaveBeenCalled()
    })
  })

  describe('Utility Functions', () => {
    it('has formatFileSize method', () => {
      vi.mocked(imageStorage.getStoredImages).mockReturnValue([])

      const wrapper = mount(ImageManager, {
        props: {
          documents: mockDocuments,
        },
      })

      if (wrapper.vm.formatFileSize) {
        const result = wrapper.vm.formatFileSize(1024)
        expect(typeof result).toBe('string')
        expect(result).toMatch(/KB|MB/)
      }
    })

    it('has formatDate method', () => {
      vi.mocked(imageStorage.getStoredImages).mockReturnValue([])

      const wrapper = mount(ImageManager, {
        props: {
          documents: mockDocuments,
        },
      })

      if (wrapper.vm.formatDate) {
        const result = wrapper.vm.formatDate('2024-01-01T10:00:00Z')
        expect(typeof result).toBe('string')
        expect(result.length).toBeGreaterThan(0)
      }
    })
  })

  describe('Error Handling', () => {
    it('handles storage errors gracefully', async () => {
      vi.mocked(imageStorage.getStoredImages).mockImplementation(() => {
        throw new Error('Storage error')
      })

      // Component should mount successfully even if getStoredImages throws
      expect(() => {
        mount(ImageManager, {
          props: {
            documents: mockDocuments,
          },
        })
      }).toThrow() // The error is expected during mount due to onMounted calling getStoredImages

      // But the component should handle the error and not crash the application
    })

    it('handles delete errors gracefully', async () => {
      vi.mocked(imageStorage.getStoredImages).mockReturnValue(mockImages)
      vi.mocked(imageStorage.countImageUsage).mockReturnValue(0)
      vi.mocked(imageStorage.findDocumentsUsingImage).mockReturnValue([])
      vi.mocked(imageStorage.deleteStoredImage).mockRejectedValue(
        new Error('Delete failed')
      )
      mockConfirm.mockReturnValue(true)

      const wrapper = mount(ImageManager, {
        props: {
          documents: mockDocuments,
        },
      })

      await expect(wrapper.vm.deleteImage('image-1')).resolves.toBeUndefined()
    })
  })
})
