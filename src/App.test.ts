import { describe, it, expect } from 'vitest'
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
    expect(buttons.some((button) => button.text() === 'Preview')).toBe(true)
    expect(buttons.some((button) => button.text() === 'WYSIWYG')).toBe(true)
  })

  it('toggles preview visibility', async () => {
    const wrapper = mount(App)
    const previewButton = wrapper
      .findAll('button')
      .find((button) => button.text() === 'Preview')

    expect(wrapper.text()).toContain('Preview')

    await previewButton?.trigger('click')
    // After toggle, preview panel should still be accessible but button state changes
    expect(previewButton?.classes()).toContain('bg-gray-200')
  })

  it('toggles wysiwyg mode', async () => {
    const wrapper = mount(App)
    const wysiwygButton = wrapper
      .findAll('button')
      .find((button) => button.text() === 'WYSIWYG')

    await wysiwygButton?.trigger('click')
    expect(wysiwygButton?.classes()).toContain('bg-blue-500')
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
})
