import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import App from './App.vue'

describe('App.vue', () => {
  it('renders markdown editor title', () => {
    const wrapper = mount(App)
    expect(wrapper.text()).toContain('Markdown Editor')
  })

  it('has preview toggle button', () => {
    const wrapper = mount(App)
    const buttons = wrapper.findAll('button')
    expect(buttons.some((button) => button.text() === 'Hide Preview')).toBe(true) // Preview toggle button
  })

  it('toggles preview visibility', async () => {
    const wrapper = mount(App)
    const previewButton = wrapper
      .findAll('button')
      .find((button) => button.text() === 'Hide Preview')

    expect(wrapper.text()).toContain('WYSIWYG Editor')

    await previewButton?.trigger('click')
    // After toggle, button text should change to "Show Preview"
    expect(previewButton?.text()).toBe('Show Preview')
  })

  it('has dual editor layout', () => {
    const wrapper = mount(App)
    // Check that both editor panes exist
    expect(wrapper.text()).toContain('Markdown Editor')
    expect(wrapper.text()).toContain('WYSIWYG Editor')
    // WYSIWYG is always visible now, no toggle button
    expect(wrapper.findAll('button').some((button) => button.text() === 'WYSIWYG')).toBe(false)
  })

  it('has default markdown content', () => {
    const wrapper = mount(App)
    // Access the component's markdown content directly
    const vm = wrapper.vm as unknown as { markdownContent: string }
    expect(vm.markdownContent).toContain('# Welcome to Markdown Editor')
  })

  it('handles wysiwyg input events', async () => {
    const wrapper = mount(App)

    // Test the handleWysiwygInput function by creating a mock event
    const mockEvent = {
      target: {
        innerHTML: '<p>Test content</p>',
      },
    }

    // Access the component instance and call the method directly
    const vm = wrapper.vm as unknown as {
      handleWysiwygInput: (event: Event) => void
      markdownContent: string
    }
    vm.handleWysiwygInput(mockEvent as unknown as Event)

    expect(vm.markdownContent).toContain('Test content')
  })

  it('displays file operation buttons', () => {
    const wrapper = mount(App)

    const buttons = wrapper.findAll('button')
    const buttonTexts = buttons.map((btn) => btn.text())

    expect(buttonTexts).toContain('Import')
    expect(buttonTexts).toContain('MD')
    expect(buttonTexts).toContain('ZIP')
    expect(buttonTexts).toContain('Save')
    expect(buttonTexts).toContain('Load')
    expect(buttonTexts).toContain('New')
  })

  it('displays statistics in header information pane', () => {
    const wrapper = mount(App)

    // Statistics are now in the header information pane, not footer
    expect(wrapper.text()).toContain('Words:')
    expect(wrapper.text()).toContain('Chars:')
    expect(wrapper.text()).toContain('Lines:')
    // Footer should not exist anymore
    const footer = wrapper.find('footer')
    expect(footer.exists()).toBe(false)
  })

  it('triggers file input when import button clicked', async () => {
    const wrapper = mount(App)

    const importButton = wrapper
      .findAll('button')
      .find((btn) => btn.text() === 'Import')
    const fileInput = wrapper.find('input[type="file"]')

    // Mock the click method
    const clickSpy = vi.fn()
    const element = fileInput.element as HTMLInputElement
    element.click = clickSpy

    await importButton?.trigger('click')

    expect(clickSpy).toHaveBeenCalled()
  })
})
