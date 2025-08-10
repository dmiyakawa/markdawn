import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import App from './App.vue'

describe('App.vue', () => {
  it('renders markdown editor title', () => {
    const wrapper = mount(App)
    expect(wrapper.text()).toContain('Markdown Editor')
  })

  it('has preview and wysiwyg toggle buttons', () => {
    const wrapper = mount(App)
    const buttons = wrapper.findAll('button')
    expect(buttons.some((button) => button.text() === 'Hide')).toBe(true) // Preview toggle button
    expect(buttons.some((button) => button.text() === 'WYSIWYG')).toBe(true) // WYSIWYG toggle button (inactive state)
  })

  it('toggles preview visibility', async () => {
    const wrapper = mount(App)
    const previewButton = wrapper
      .findAll('button')
      .find((button) => button.text() === 'Hide')

    expect(wrapper.text()).toContain('Preview')

    await previewButton?.trigger('click')
    // After toggle, preview panel should still be accessible but button state changes
    expect(previewButton?.classes()).toContain('bg-gray-200')
    expect(previewButton?.text()).toBe('Show') // Button text should change to "Show"
  })

  it('toggles wysiwyg mode', async () => {
    const wrapper = mount(App)
    const wysiwygButton = wrapper
      .findAll('button')
      .find((button) => button.text() === 'WYSIWYG')

    await wysiwygButton?.trigger('click')
    expect(wysiwygButton?.classes()).toContain('bg-blue-500')
    expect(wysiwygButton?.text()).toBe('MD') // Button text should change to "MD" when active
  })

  it('has default markdown content', () => {
    const wrapper = mount(App)
    expect(wrapper.text()).toContain('Welcome to Markdown Editor')
  })

  it('handles wysiwyg input events', async () => {
    const wrapper = mount(App)

    // Simulate WYSIWYG mode first
    const wysiwygButton = wrapper
      .findAll('button')
      .find((button) => button.text() === 'WYSIWYG')
    await wysiwygButton?.trigger('click')

    // Test the handleWysiwygInput function by creating a mock event
    const mockEvent = {
      target: {
        innerText: 'Test content',
      },
    }

    // Access the component instance and call the method directly
    const vm = wrapper.vm as unknown as {
      handleWysiwygInput: (event: Event) => void
      markdownContent: string
    }
    vm.handleWysiwygInput(mockEvent as unknown as Event)

    expect(vm.markdownContent).toBe('Test content')
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

  it('displays status bar with statistics', () => {
    const wrapper = mount(App)

    const footer = wrapper.find('footer')
    expect(footer.exists()).toBe(true)
    expect(footer.text()).toContain('Words:')
    expect(footer.text()).toContain('Characters:')
    expect(footer.text()).toContain('Lines:')
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
