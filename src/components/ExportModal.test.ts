/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ExportModal from './ExportModal.vue'
import type { ExportOptions } from '../utils/advancedExport'

describe('ExportModal', () => {
  let wrapper: ReturnType<typeof mount> | null = null

  beforeEach(() => {
    // Reset any global state
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
      wrapper = null
    }
  })

  it('renders correctly when visible', () => {
    wrapper = mount(ExportModal, {
      props: {
        visible: true,
        exportType: 'html',
        defaultTitle: 'Test Document',
      },
    })

    expect(wrapper.find('[data-testid="export-modal"]').exists()).toBe(false)
    // Modal should be visible
    expect(wrapper.find('.fixed.inset-0').exists()).toBe(true)
    expect(wrapper.text()).toContain('Export Options')
    expect(wrapper.text()).toContain('HTML export settings')
  })

  it('does not render when not visible', () => {
    wrapper = mount(ExportModal, {
      props: {
        visible: false,
        exportType: 'html',
      },
    })

    expect(wrapper.find('.fixed.inset-0').exists()).toBe(false)
  })

  it('displays correct export type in title', () => {
    wrapper = mount(ExportModal, {
      props: {
        visible: true,
        exportType: 'pdf',
      },
    })

    expect(wrapper.text()).toContain('PDF export settings')
  })

  it('initializes with default values', () => {
    wrapper = mount(ExportModal, {
      props: {
        visible: true,
        exportType: 'html',
        defaultTitle: 'My Document',
        defaultAuthor: 'John Doe',
      },
    })

    const titleInput = wrapper.find('#export-title')
    const authorInput = wrapper.find('#export-author')

    expect((titleInput.element as HTMLInputElement).value).toBe('My Document')
    expect((authorInput.element as HTMLInputElement).value).toBe('John Doe')
  })

  it('sets correct default theme for PDF export', () => {
    wrapper = mount(ExportModal, {
      props: {
        visible: true,
        exportType: 'pdf',
      },
    })

    // PDF should default to academic theme
    const academicRadio = wrapper.find('input[value="academic"]')
    expect((academicRadio.element as HTMLInputElement).checked).toBe(true)
  })

  it('sets correct default theme for HTML export', () => {
    wrapper = mount(ExportModal, {
      props: {
        visible: true,
        exportType: 'html',
      },
    })

    // HTML should default to default theme
    const defaultRadio = wrapper.find('input[value="default"]')
    expect((defaultRadio.element as HTMLInputElement).checked).toBe(true)
  })

  it('renders all theme options', () => {
    wrapper = mount(ExportModal, {
      props: {
        visible: true,
        exportType: 'html',
      },
    })

    expect(wrapper.text()).toContain('Default')
    expect(wrapper.text()).toContain('Clean, professional styling')
    expect(wrapper.text()).toContain('GitHub')
    expect(wrapper.text()).toContain('GitHub-style markdown')
    expect(wrapper.text()).toContain('Academic')
    expect(wrapper.text()).toContain('Formal document style')
    expect(wrapper.text()).toContain('Minimal')
    expect(wrapper.text()).toContain('Simple, clean design')
  })

  it('renders all font size options', () => {
    wrapper = mount(ExportModal, {
      props: {
        visible: true,
        exportType: 'html',
      },
    })

    expect(wrapper.text()).toContain('Small')
    expect(wrapper.text()).toContain('Medium')
    expect(wrapper.text()).toContain('Large')
  })

  it('renders all checkbox options', () => {
    wrapper = mount(ExportModal, {
      props: {
        visible: true,
        exportType: 'html',
      },
    })

    expect(wrapper.text()).toContain('Include CSS styles')
    expect(wrapper.text()).toContain('Include table of contents')
    expect(wrapper.text()).toContain('Embed images as base64')
    expect(wrapper.text()).toContain('Add generation timestamp')
  })

  it('allows changing title input', async () => {
    wrapper = mount(ExportModal, {
      props: {
        visible: true,
        exportType: 'html',
        defaultTitle: 'Original Title',
      },
    })

    const titleInput = wrapper.find('#export-title')
    await titleInput.setValue('New Title')

    expect((titleInput.element as HTMLInputElement).value).toBe('New Title')
  })

  it('allows changing author input', async () => {
    wrapper = mount(ExportModal, {
      props: {
        visible: true,
        exportType: 'html',
        defaultAuthor: 'Original Author',
      },
    })

    const authorInput = wrapper.find('#export-author')
    await authorInput.setValue('New Author')

    expect((authorInput.element as HTMLInputElement).value).toBe('New Author')
  })

  it('allows changing theme selection', async () => {
    wrapper = mount(ExportModal, {
      props: {
        visible: true,
        exportType: 'html',
      },
    })

    const githubRadio = wrapper.find('input[value="github"]')
    await githubRadio.setValue(true)

    expect((githubRadio.element as HTMLInputElement).checked).toBe(true)
  })

  it('allows changing font size selection', async () => {
    wrapper = mount(ExportModal, {
      props: {
        visible: true,
        exportType: 'html',
      },
    })

    const largeRadio = wrapper.find('input[value="large"]')
    await largeRadio.setValue(true)

    expect((largeRadio.element as HTMLInputElement).checked).toBe(true)
  })

  it('allows toggling checkbox options', async () => {
    wrapper = mount(ExportModal, {
      props: {
        visible: true,
        exportType: 'html',
      },
    })

    // All checkboxes should be initially checked
    const stylesCheckbox = wrapper.find('input[type="checkbox"]')
    expect((stylesCheckbox.element as HTMLInputElement).checked).toBe(true)

    // Toggle off
    await stylesCheckbox.setValue(false)
    expect((stylesCheckbox.element as HTMLInputElement).checked).toBe(false)
  })

  it('emits cancel event when cancel button clicked', async () => {
    wrapper = mount(ExportModal, {
      props: {
        visible: true,
        exportType: 'html',
      },
    })

    const cancelButton = wrapper.find('button:nth-child(1)')
    await cancelButton.trigger('click')

    expect(wrapper.emitted('cancel')).toBeTruthy()
    expect(wrapper.emitted('update:visible')).toBeTruthy()
    expect(wrapper.emitted('update:visible')![0]).toEqual([false])
  })

  it('emits confirm event when export button clicked', async () => {
    wrapper = mount(ExportModal, {
      props: {
        visible: true,
        exportType: 'html',
        defaultTitle: 'Test Document',
        defaultAuthor: 'Test Author',
      },
    })

    const exportButton = wrapper.find('button:nth-child(2)')
    await exportButton.trigger('click')

    expect(wrapper.emitted('confirm')).toBeTruthy()
    expect(wrapper.emitted('update:visible')).toBeTruthy()
    expect(wrapper.emitted('update:visible')![0]).toEqual([false])

    const confirmEvent = wrapper.emitted('confirm')![0][0] as ExportOptions
    expect(confirmEvent.title).toBe('Test Document')
    expect(confirmEvent.author).toBe('Test Author')
    expect(confirmEvent.includeStyles).toBe(true)
    expect(confirmEvent.includeTOC).toBe(true)
    expect(confirmEvent.theme).toBe('default')
    expect(confirmEvent.fontSize).toBe('medium')
    expect(confirmEvent.embedImages).toBe(true)
    expect(confirmEvent.addTimestamp).toBe(true)
  })

  it('emits cancel event when backdrop clicked', async () => {
    wrapper = mount(ExportModal, {
      props: {
        visible: true,
        exportType: 'html',
      },
    })

    const backdrop = wrapper.find('.fixed.inset-0')
    await backdrop.trigger('click')

    expect(wrapper.emitted('cancel')).toBeTruthy()
    expect(wrapper.emitted('update:visible')).toBeTruthy()
    expect(wrapper.emitted('update:visible')![0]).toEqual([false])
  })

  it('does not emit cancel when modal content clicked', async () => {
    wrapper = mount(ExportModal, {
      props: {
        visible: true,
        exportType: 'html',
      },
    })

    const modalContent = wrapper.find('.bg-white.rounded-lg')
    await modalContent.trigger('click')

    expect(wrapper.emitted('cancel')).toBeFalsy()
  })

  it('resets options when reopened', async () => {
    wrapper = mount(ExportModal, {
      props: {
        visible: true,
        exportType: 'html',
        defaultTitle: 'Original Title',
      },
    })

    // Change title
    const titleInput = wrapper.find('#export-title')
    await titleInput.setValue('Changed Title')

    // Close modal
    await wrapper.setProps({ visible: false })
    await wrapper.vm.$nextTick()

    // Reopen modal
    await wrapper.setProps({ visible: true })
    await wrapper.vm.$nextTick()

    // Get the input element again after reopen
    const newTitleInput = wrapper.find('#export-title')
    // Title should be reset
    expect((newTitleInput.element as HTMLInputElement).value).toBe(
      'Original Title'
    )
  })

  it('updates theme when export type changes', async () => {
    wrapper = mount(ExportModal, {
      props: {
        visible: true,
        exportType: 'html',
      },
    })

    // Initially HTML should have default theme
    let defaultRadio = wrapper.find('input[value="default"]')
    expect((defaultRadio.element as HTMLInputElement).checked).toBe(true)

    // Change to PDF
    await wrapper.setProps({ exportType: 'pdf' })

    // Should now have academic theme
    const academicRadio = wrapper.find('input[value="academic"]')
    expect((academicRadio.element as HTMLInputElement).checked).toBe(true)

    // Change back to HTML
    await wrapper.setProps({ exportType: 'html' })

    // Should go back to default theme
    defaultRadio = wrapper.find('input[value="default"]')
    expect((defaultRadio.element as HTMLInputElement).checked).toBe(true)
  })

  it('displays correct button text for export type', () => {
    wrapper = mount(ExportModal, {
      props: {
        visible: true,
        exportType: 'html',
      },
    })

    expect(wrapper.text()).toContain('Export HTML')

    wrapper.unmount()

    wrapper = mount(ExportModal, {
      props: {
        visible: true,
        exportType: 'pdf',
      },
    })

    expect(wrapper.text()).toContain('Export PDF')
  })

  it('handles visible prop updates correctly', async () => {
    wrapper = mount(ExportModal, {
      props: {
        visible: false,
        exportType: 'html',
      },
    })

    expect(wrapper.find('.fixed.inset-0').exists()).toBe(false)

    await wrapper.setProps({ visible: true })
    expect(wrapper.find('.fixed.inset-0').exists()).toBe(true)

    await wrapper.setProps({ visible: false })
    expect(wrapper.find('.fixed.inset-0').exists()).toBe(false)
  })

  it('emits update:visible when isVisible changes', async () => {
    wrapper = mount(ExportModal, {
      props: {
        visible: true,
        exportType: 'html',
      },
    })

    // Click cancel to change isVisible internally
    const cancelButton = wrapper.find('button:nth-child(1)')
    await cancelButton.trigger('click')

    expect(wrapper.emitted('update:visible')).toBeTruthy()
    expect(wrapper.emitted('update:visible')![0]).toEqual([false])
  })

  it('maintains form state during interaction', async () => {
    wrapper = mount(ExportModal, {
      props: {
        visible: true,
        exportType: 'html',
        defaultTitle: 'Test Doc',
        defaultAuthor: 'Test Author',
      },
    })

    // Change multiple options
    const titleInput = wrapper.find('#export-title')
    await titleInput.setValue('Modified Title')

    const authorInput = wrapper.find('#export-author')
    await authorInput.setValue('Modified Author')

    const githubRadio = wrapper.find('input[value="github"]')
    await githubRadio.setValue(true)

    const largeRadio = wrapper.find('input[value="large"]')
    await largeRadio.setValue(true)

    const stylesCheckbox = wrapper.find('input[type="checkbox"]')
    await stylesCheckbox.setValue(false)

    // Export with changed options
    const exportButton = wrapper.find('button:nth-child(2)')
    await exportButton.trigger('click')

    const confirmEvent = wrapper.emitted('confirm')![0][0] as ExportOptions
    expect(confirmEvent.title).toBe('Modified Title')
    expect(confirmEvent.author).toBe('Modified Author')
    expect(confirmEvent.theme).toBe('github')
    expect(confirmEvent.fontSize).toBe('large')
    expect(confirmEvent.includeStyles).toBe(false)
  })

  it('handles default props correctly', () => {
    wrapper = mount(ExportModal, {
      props: {
        exportType: 'html',
      },
    })

    expect((wrapper.vm as any).$props.visible).toBe(false)
    expect((wrapper.vm as any).$props.exportType).toBe('html')
    expect((wrapper.vm as any).$props.defaultTitle).toBe('Markdown Document')
    expect((wrapper.vm as any).$props.defaultAuthor).toBe('')
  })
})
