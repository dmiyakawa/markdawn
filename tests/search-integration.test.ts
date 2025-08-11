import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CodeMirrorEditor from '../src/components/CodeMirrorEditor.vue'

describe('Search Integration', () => {
  it('provides search methods through exposed interface', async () => {
    const wrapper = mount(CodeMirrorEditor, {
      props: {
        modelValue: `# Test Document
        
This is a test document with some content to search.
We can search for words like "test" and "content".
Multiple lines with search terms.`,
      },
    })

    await wrapper.vm.$nextTick()

    // Get the component instance with exposed methods
    const component = wrapper.vm as any

    // Check that search methods are exposed
    expect(typeof component.searchNext).toBe('function')
    expect(typeof component.searchPrevious).toBe('function')
    expect(typeof component.performReplace).toBe('function')
    expect(typeof component.performReplaceAll).toBe('function')
    expect(typeof component.clearSearch).toBe('function')
  })

  it('exposes other expected methods', async () => {
    const wrapper = mount(CodeMirrorEditor, {
      props: {
        modelValue: 'test content',
      },
    })

    await wrapper.vm.$nextTick()

    const component = wrapper.vm as any

    // Check that other methods are also exposed
    expect(typeof component.focus).toBe('function')
    expect(typeof component.getSelection).toBe('function')
    expect(typeof component.insertText).toBe('function')
    expect(typeof component.replaceSelection).toBe('function')
  })
})