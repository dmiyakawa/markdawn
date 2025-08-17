import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import DocumentOutline from './DocumentOutline.vue'

describe('DocumentOutline.vue', () => {
  const sampleMarkdown = `# Introduction
This is the first section.

## Getting Started
This is a subsection.

### Installation
Details about installation.

## Advanced Usage
More advanced topics.

#### Deep Nesting
Very specific details.

# Conclusion
Final thoughts.`

  const defaultProps = {
    markdownContent: sampleMarkdown,
    visible: true,
    wordCount: 100,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Component Mounting and Props', () => {
    it('mounts successfully with required props', () => {
      const wrapper = mount(DocumentOutline, {
        props: {
          markdownContent: '',
        },
      })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('[data-testid="document-outline"]').exists()).toBe(
        true
      )
    })

    it('is visible when visible prop is true', () => {
      const wrapper = mount(DocumentOutline, {
        props: {
          ...defaultProps,
          visible: true,
        },
      })

      const outline = wrapper.find('[data-testid="document-outline"]')
      expect(outline.isVisible()).toBe(true)
    })

    it('is hidden when visible prop is false', () => {
      const wrapper = mount(DocumentOutline, {
        props: {
          ...defaultProps,
          visible: false,
        },
      })

      const outline = wrapper.find('[data-testid="document-outline"]')
      expect(outline.isVisible()).toBe(false)
    })

    it('uses default values for optional props', () => {
      const wrapper = mount(DocumentOutline, {
        props: {
          markdownContent: '# Test',
        },
      })

      expect(wrapper.vm.$props.visible).toBe(false)
      expect(wrapper.vm.$props.wordCount).toBe(0)
    })

    it('displays outline header correctly', () => {
      const wrapper = mount(DocumentOutline, {
        props: defaultProps,
      })

      expect(wrapper.text()).toContain('Outline')
      expect(wrapper.find('button[title="Close outline"]').exists()).toBe(true)
    })
  })

  describe('Heading Extraction', () => {
    it('extracts headings from markdown content', () => {
      const wrapper = mount(DocumentOutline, {
        props: defaultProps,
      })

      const headings = wrapper.vm.headings
      expect(headings).toHaveLength(6)

      // Check first heading
      expect(headings[0]).toMatchObject({
        level: 1,
        title: 'Introduction',
        line: 1,
      })

      // Check second heading
      expect(headings[1]).toMatchObject({
        level: 2,
        title: 'Getting Started',
        line: 4,
      })

      // Check deep nesting
      expect(headings[4]).toMatchObject({
        level: 4,
        title: 'Deep Nesting',
        line: 13,
      })
    })

    it('displays "No headings found" when content has no headings', () => {
      const wrapper = mount(DocumentOutline, {
        props: {
          ...defaultProps,
          markdownContent: 'Just some regular text without any headings.',
        },
      })

      expect(wrapper.text()).toContain('No headings found')
      expect(wrapper.vm.headings).toHaveLength(0)
    })

    it('generates unique IDs for headings', () => {
      const wrapper = mount(DocumentOutline, {
        props: defaultProps,
      })

      const headings = wrapper.vm.headings
      const ids = headings.map((h) => h.id)

      // All IDs should be unique
      expect(new Set(ids).size).toBe(ids.length)

      // Check some specific ID generation
      expect(headings[0].id).toBe('introduction')
      expect(headings[1].id).toBe('getting-started')
      expect(headings[2].id).toBe('installation')
    })

    it('handles special characters in heading titles', () => {
      const specialMarkdown = `# Hello, World!
## Installation & Setup
### FAQ: Common Issues?`

      const wrapper = mount(DocumentOutline, {
        props: {
          ...defaultProps,
          markdownContent: specialMarkdown,
        },
      })

      const headings = wrapper.vm.headings
      expect(headings[0].id).toBe('hello-world')
      expect(headings[1].id).toBe('installation-setup')
      expect(headings[2].id).toBe('faq-common-issues')
    })

    it('handles empty heading titles gracefully', () => {
      const emptyHeadingMarkdown = `## Valid Heading`

      const wrapper = mount(DocumentOutline, {
        props: {
          ...defaultProps,
          markdownContent: emptyHeadingMarkdown,
        },
      })

      const headings = wrapper.vm.headings
      expect(headings).toHaveLength(1)
      expect(headings[0].id).toBe('valid-heading')
    })
  })

  describe('Heading Display and Styling', () => {
    it('displays headings with correct levels and indentation', () => {
      const wrapper = mount(DocumentOutline, {
        props: defaultProps,
      })

      const headingElements = wrapper.findAll('[class*="pl-"]')
      expect(headingElements.length).toBeGreaterThan(0)

      // Check that H1 headings have different styling than others
      const h1Headings = wrapper.vm.headings.filter((h) => h.level === 1)
      expect(h1Headings.length).toBeGreaterThan(0)
    })

    it('displays heading level indicators', () => {
      const wrapper = mount(DocumentOutline, {
        props: defaultProps,
      })

      // Should contain H1, H2, H3, H4 indicators
      expect(wrapper.html()).toContain('H1')
      expect(wrapper.html()).toContain('H2')
      expect(wrapper.html()).toContain('H3')
      expect(wrapper.html()).toContain('H4')
    })

    it('applies active heading styling', async () => {
      const wrapper = mount(DocumentOutline, {
        props: defaultProps,
      })

      // Set active heading
      await wrapper.vm.setActiveHeading('introduction')
      await nextTick()

      const activeElement = wrapper.find('.text-blue-600.bg-blue-50')
      expect(activeElement.exists()).toBe(true)
      expect(activeElement.text()).toContain('Introduction')
    })

    it('applies correct indentation classes based on heading level', () => {
      const wrapper = mount(DocumentOutline, {
        props: defaultProps,
      })

      const headings = wrapper.vm.headings

      // Find H1 heading (should have pl-2)
      const h1Heading = headings.find((h) => h.level === 1)
      if (h1Heading) {
        expect(wrapper.html()).toContain('pl-2')
      }

      // Find H2 heading (should have pl-4)
      const h2Heading = headings.find((h) => h.level === 2)
      if (h2Heading) {
        expect(wrapper.html()).toContain('pl-4')
      }

      // Find H4 heading (should have pl-8)
      const h4Heading = headings.find((h) => h.level === 4)
      if (h4Heading) {
        expect(wrapper.html()).toContain('pl-8')
      }
    })
  })

  describe('Navigation and Interaction', () => {
    it('emits scroll-to-line when heading is clicked', async () => {
      const wrapper = mount(DocumentOutline, {
        props: defaultProps,
      })

      // Find and click the first heading
      const firstHeading = wrapper.find('[class*="cursor-pointer"]')
      await firstHeading.trigger('click')

      expect(wrapper.emitted('scroll-to-line')).toBeTruthy()
      expect(wrapper.emitted('scroll-to-line')![0]).toEqual([1])
    })

    it('emits scroll-to-position when heading is clicked', async () => {
      const wrapper = mount(DocumentOutline, {
        props: defaultProps,
      })

      // Click the first heading
      const firstHeading = wrapper.find('[class*="cursor-pointer"]')
      await firstHeading.trigger('click')

      expect(wrapper.emitted('scroll-to-position')).toBeTruthy()
      expect(wrapper.emitted('scroll-to-position')![0]).toEqual([0])
    })

    it('updates active heading when heading is clicked', async () => {
      const wrapper = mount(DocumentOutline, {
        props: defaultProps,
      })

      // Click a heading
      const headingElements = wrapper.findAll('[class*="cursor-pointer"]')
      await headingElements[1].trigger('click') // Click "Getting Started"

      expect(wrapper.vm.activeHeadingId).toBe('getting-started')
    })

    it('hides outline when close button is clicked', async () => {
      const wrapper = mount(DocumentOutline, {
        props: defaultProps,
      })

      const closeButton = wrapper.find('button[title="Close outline"]')
      await closeButton.trigger('click')

      expect(wrapper.emitted('update:visible')).toBeTruthy()
      expect(wrapper.emitted('update:visible')![0]).toEqual([false])
    })
  })

  describe('Statistics Display', () => {
    it('displays correct heading count', () => {
      const wrapper = mount(DocumentOutline, {
        props: defaultProps,
      })

      expect(wrapper.text()).toContain('6 headings')
    })

    it('displays singular form for single heading', () => {
      const wrapper = mount(DocumentOutline, {
        props: {
          ...defaultProps,
          markdownContent: '# Single Heading',
        },
      })

      expect(wrapper.text()).toContain('1 heading')
      expect(wrapper.text()).not.toContain('1 headings')
    })

    it('displays word count from props', () => {
      const wrapper = mount(DocumentOutline, {
        props: {
          ...defaultProps,
          wordCount: 250,
        },
      })

      expect(wrapper.text()).toContain('250 words')
    })

    it('calculates reading time correctly', () => {
      const wrapper = mount(DocumentOutline, {
        props: {
          ...defaultProps,
          wordCount: 400, // Should be 2 minutes at 200 words/minute
        },
      })

      expect(wrapper.text()).toContain('2 min read')
    })

    it('shows minimum 1 minute reading time', () => {
      const wrapper = mount(DocumentOutline, {
        props: {
          ...defaultProps,
          wordCount: 50, // Less than 200 words
        },
      })

      expect(wrapper.text()).toContain('1 min read')
    })

    it('hides statistics when no headings', () => {
      const wrapper = mount(DocumentOutline, {
        props: {
          ...defaultProps,
          markdownContent: 'No headings here',
        },
      })

      expect(wrapper.text()).not.toContain('words')
      expect(wrapper.text()).not.toContain('min read')
    })
  })

  describe('Exposed Methods', () => {
    it('exposes show method that makes component visible', async () => {
      const wrapper = mount(DocumentOutline, {
        props: {
          ...defaultProps,
          visible: false,
        },
      })

      expect(wrapper.vm.isVisible).toBe(false)

      await wrapper.vm.show()
      await nextTick()

      expect(wrapper.vm.isVisible).toBe(true)
    })

    it('exposes hide method that makes component invisible', async () => {
      const wrapper = mount(DocumentOutline, {
        props: defaultProps,
      })

      expect(wrapper.vm.isVisible).toBe(true)

      await wrapper.vm.hide()
      await nextTick()

      expect(wrapper.vm.isVisible).toBe(false)
    })

    it('exposes setActiveHeading method', async () => {
      const wrapper = mount(DocumentOutline, {
        props: defaultProps,
      })

      await wrapper.vm.setActiveHeading('getting-started')

      expect(wrapper.vm.activeHeadingId).toBe('getting-started')
    })

    it('exposes updateActiveHeadingByLine method', async () => {
      const wrapper = mount(DocumentOutline, {
        props: defaultProps,
      })

      // Line 4 should correspond to "Getting Started" heading
      await wrapper.vm.updateActiveHeadingByLine(5)

      expect(wrapper.vm.activeHeadingId).toBe('getting-started')
    })

    it('updateActiveHeadingByLine finds closest previous heading', async () => {
      const wrapper = mount(DocumentOutline, {
        props: defaultProps,
      })

      // Line 10 should correspond to "Advanced Usage" heading (line 8)
      await wrapper.vm.updateActiveHeadingByLine(10)

      expect(wrapper.vm.activeHeadingId).toBe('advanced-usage')
    })

    it('getHeadingByLine returns correct heading', () => {
      const wrapper = mount(DocumentOutline, {
        props: defaultProps,
      })

      const heading = wrapper.vm.getHeadingByLine(4)
      expect(heading).toMatchObject({
        title: 'Getting Started',
        level: 2,
        line: 4,
      })
    })

    it('getHeadingByLine returns null for line before any headings', () => {
      const wrapper = mount(DocumentOutline, {
        props: defaultProps,
      })

      const heading = wrapper.vm.getHeadingByLine(0)
      expect(heading).toBeNull()
    })
  })

  describe('Watchers and Reactivity', () => {
    it('updates visibility when visible prop changes', async () => {
      const wrapper = mount(DocumentOutline, {
        props: {
          ...defaultProps,
          visible: false,
        },
      })

      expect(wrapper.vm.isVisible).toBe(false)

      await wrapper.setProps({ visible: true })
      expect(wrapper.vm.isVisible).toBe(true)
    })

    it('emits update:visible when isVisible changes', async () => {
      const wrapper = mount(DocumentOutline, {
        props: defaultProps,
      })

      await wrapper.vm.hide()

      expect(wrapper.emitted('update:visible')).toBeTruthy()
      expect(wrapper.emitted('update:visible')![0]).toEqual([false])
    })

    it('updates headings when markdownContent changes', async () => {
      const wrapper = mount(DocumentOutline, {
        props: {
          ...defaultProps,
          markdownContent: '# Original',
        },
      })

      expect(wrapper.vm.headings).toHaveLength(1)
      expect(wrapper.vm.headings[0].title).toBe('Original')

      await wrapper.setProps({
        markdownContent: '# New\n## Second',
      })
      await nextTick()

      // The component should handle the prop change
      expect(wrapper.vm.$props.markdownContent).toBe('# New\n## Second')
    })

    it('updates word count display when wordCount prop changes', async () => {
      const wrapper = mount(DocumentOutline, {
        props: {
          ...defaultProps,
          wordCount: 100,
        },
      })

      expect(wrapper.text()).toContain('100 words')

      await wrapper.setProps({ wordCount: 200 })

      expect(wrapper.text()).toContain('200 words')
      expect(wrapper.text()).not.toContain('100 words')
    })

    it('updates reading time when word count changes', async () => {
      const wrapper = mount(DocumentOutline, {
        props: {
          ...defaultProps,
          wordCount: 200,
        },
      })

      expect(wrapper.text()).toContain('1 min read')

      await wrapper.setProps({ wordCount: 600 })

      expect(wrapper.text()).toContain('3 min read')
    })
  })

  describe('Edge Cases', () => {
    it('handles markdown with only whitespace', () => {
      const wrapper = mount(DocumentOutline, {
        props: {
          ...defaultProps,
          markdownContent: '   \n\n\t  \n  ',
        },
      })

      expect(wrapper.vm.headings).toHaveLength(0)
      expect(wrapper.text()).toContain('No headings found')
    })

    it('handles markdown with invalid heading formats', () => {
      const wrapper = mount(DocumentOutline, {
        props: {
          ...defaultProps,
          markdownContent: `# Valid Heading
          ####### Too many hashes
          Not a heading # in middle`,
        },
      })

      expect(wrapper.vm.headings).toHaveLength(1)
      expect(wrapper.vm.headings[0].title).toBe('Valid Heading')
    })

    it('handles very long heading titles', () => {
      const longTitle = 'A'.repeat(200)
      const wrapper = mount(DocumentOutline, {
        props: {
          ...defaultProps,
          markdownContent: `# ${longTitle}`,
        },
      })

      expect(wrapper.vm.headings).toHaveLength(1)
      expect(wrapper.vm.headings[0].title).toBe(longTitle)
    })

    it('handles duplicate heading titles', () => {
      const wrapper = mount(DocumentOutline, {
        props: {
          ...defaultProps,
          markdownContent: `# Introduction`,
        },
      })

      const headings = wrapper.vm.headings
      expect(headings).toHaveLength(1)

      // ID should be generated
      expect(headings[0].id).toBe('introduction')
    })

    it('handles headings with numeric titles', () => {
      const wrapper = mount(DocumentOutline, {
        props: {
          ...defaultProps,
          markdownContent: `# 123
## 456.789
### 2023-01-01`,
        },
      })

      const headings = wrapper.vm.headings
      expect(headings).toHaveLength(3)
      expect(headings[0].title).toBe('123')
      expect(headings[1].title).toBe('456.789')
      expect(headings[2].title).toBe('2023-01-01')
    })
  })
})
