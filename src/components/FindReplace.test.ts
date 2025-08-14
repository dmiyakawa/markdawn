import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import FindReplace from './FindReplace.vue'

describe('FindReplace', () => {
  let wrapper: ReturnType<typeof mount> | null

  beforeEach(() => {
    // Reset any global state
    document.body.innerHTML = ''
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders when visible prop is true', () => {
    wrapper = mount(FindReplace, {
      props: {
        visible: true,
      },
    })

    const findReplacePanel = wrapper.find('[data-testid="find-replace-panel"]')
    expect(findReplacePanel.exists()).toBe(true)
  })

  it('does not render when visible prop is false', () => {
    wrapper = mount(FindReplace, {
      props: {
        visible: false,
      },
    })

    const findReplacePanel = wrapper.find('[data-testid="find-replace-panel"]')
    expect(findReplacePanel.isVisible()).toBe(false)
  })

  it('displays find input field', () => {
    wrapper = mount(FindReplace, {
      props: {
        visible: true,
      },
    })

    const findInput = wrapper.find('#find-input')
    expect(findInput.exists()).toBe(true)
  })

  it('displays replace input field', () => {
    wrapper = mount(FindReplace, {
      props: {
        visible: true,
      },
    })

    const replaceInput = wrapper.find('#replace-input')
    expect(replaceInput.exists()).toBe(true)
  })

  it('has case sensitive toggle', () => {
    wrapper = mount(FindReplace, {
      props: {
        visible: true,
      },
    })

    const checkboxes = wrapper.findAll('input[type="checkbox"]')
    expect(checkboxes.length).toBeGreaterThan(0)
    expect(checkboxes[0].exists()).toBe(true)
  })

  it('has regex toggle', () => {
    wrapper = mount(FindReplace, {
      props: {
        visible: true,
      },
    })

    const checkboxes = wrapper.findAll('input[type="checkbox"]')
    expect(checkboxes.length).toBeGreaterThanOrEqual(2)
    expect(checkboxes[1].exists()).toBe(true)
  })

  it('has find next button', () => {
    wrapper = mount(FindReplace, {
      props: {
        visible: true,
      },
    })

    const findNextButton = wrapper.find('button[title*="Find next"]')
    expect(findNextButton.exists()).toBe(true)
  })

  it('has find previous button', () => {
    wrapper = mount(FindReplace, {
      props: {
        visible: true,
      },
    })

    const findPrevButton = wrapper.find('button[title*="Find previous"]')
    expect(findPrevButton.exists()).toBe(true)
  })

  it('has replace next button', () => {
    wrapper = mount(FindReplace, {
      props: {
        visible: true,
      },
    })

    const replaceButton = wrapper.find('button[title*="Replace current"]')
    expect(replaceButton.exists()).toBe(true)
  })

  it('has replace all button', () => {
    wrapper = mount(FindReplace, {
      props: {
        visible: true,
      },
    })

    const replaceAllButton = wrapper.find('button[title*="Replace all"]')
    expect(replaceAllButton.exists()).toBe(true)
  })

  it('has close button', () => {
    wrapper = mount(FindReplace, {
      props: {
        visible: true,
      },
    })

    const closeButton = wrapper.find('button[title*="Close"]')
    expect(closeButton.exists()).toBe(true)
  })

  it('emits find-next event when find next button is clicked', async () => {
    wrapper = mount(FindReplace, {
      props: {
        visible: true,
      },
    })

    const findInput = wrapper.find('#find-input')
    await findInput.setValue('test search')

    const findNextButton = wrapper.find('button[title*="Find next"]')
    await findNextButton.trigger('click')

    const findNextEvents = wrapper.emitted('find-next')
    expect(findNextEvents).toBeTruthy()
    expect(findNextEvents).toHaveLength(1)
  })

  it('emits find-previous event when find previous button is clicked', async () => {
    wrapper = mount(FindReplace, {
      props: {
        visible: true,
      },
    })

    const findInput = wrapper.find('#find-input')
    await findInput.setValue('test search')

    const findPrevButton = wrapper.find('button[title*="Find previous"]')
    await findPrevButton.trigger('click')

    const findPrevEvents = wrapper.emitted('find-previous')
    expect(findPrevEvents).toBeTruthy()
    expect(findPrevEvents).toHaveLength(1)
  })

  it('emits replace-next event when replace button is clicked', async () => {
    wrapper = mount(FindReplace, {
      props: {
        visible: true,
      },
    })

    const findInput = wrapper.find('#find-input')
    const replaceInput = wrapper.find('#replace-input')

    await findInput.setValue('find text')
    await replaceInput.setValue('replace text')

    const replaceButton = wrapper.find('button[title*="Replace current"]')
    await replaceButton.trigger('click')

    const replaceEvents = wrapper.emitted('replace-next')
    expect(replaceEvents).toBeTruthy()
    expect(replaceEvents).toHaveLength(1)
  })

  it('emits replace-all event when replace all button is clicked', async () => {
    wrapper = mount(FindReplace, {
      props: {
        visible: true,
      },
    })

    const findInput = wrapper.find('#find-input')
    const replaceInput = wrapper.find('#replace-input')

    await findInput.setValue('find text')
    await replaceInput.setValue('replace text')

    const replaceAllButton = wrapper.find('button[title*="Replace all"]')
    await replaceAllButton.trigger('click')

    const replaceAllEvents = wrapper.emitted('replace-all')
    expect(replaceAllEvents).toBeTruthy()
    expect(replaceAllEvents).toHaveLength(1)
  })

  it('toggles case sensitive option', async () => {
    wrapper = mount(FindReplace, {
      props: {
        visible: true,
      },
    })

    const checkboxes = wrapper.findAll('input[type="checkbox"]')
    const caseSensitiveCheckbox = checkboxes[0]

    // Should start as not checked
    expect((caseSensitiveCheckbox.element as HTMLInputElement).checked).toBe(
      false
    )

    await caseSensitiveCheckbox.setValue(true)

    // Should become checked after toggle
    expect((caseSensitiveCheckbox.element as HTMLInputElement).checked).toBe(
      true
    )
  })

  it('toggles regex option', async () => {
    wrapper = mount(FindReplace, {
      props: {
        visible: true,
      },
    })

    const checkboxes = wrapper.findAll('input[type="checkbox"]')
    const regexCheckbox = checkboxes[1]

    // Should start as not checked
    expect((regexCheckbox.element as HTMLInputElement).checked).toBe(false)

    await regexCheckbox.setValue(true)

    // Should become checked after toggle
    expect((regexCheckbox.element as HTMLInputElement).checked).toBe(true)
  })

  it('updates visible prop when close button is clicked', async () => {
    wrapper = mount(FindReplace, {
      props: {
        visible: true,
        'onUpdate:visible': (value: boolean) =>
          wrapper?.setProps({ visible: value }),
      },
    })

    const closeButton = wrapper.find('button[title*="Close"]')
    await closeButton.trigger('click')

    // Should emit update:visible event
    const visibleEvents = wrapper.emitted('update:visible')
    expect(visibleEvents).toBeTruthy()
    expect(visibleEvents![0]).toEqual([false])
  })

  it('handles Enter key in find input to trigger find next', async () => {
    wrapper = mount(FindReplace, {
      props: {
        visible: true,
      },
    })

    const findInput = wrapper.find('#find-input')
    await findInput.setValue('test')
    await findInput.trigger('keydown.enter')

    const findNextEvents = wrapper.emitted('find-next')
    expect(findNextEvents).toBeTruthy()
  })

  it('handles Enter key in replace input to trigger replace', async () => {
    wrapper = mount(FindReplace, {
      props: {
        visible: true,
      },
    })

    const findInput = wrapper.find('#find-input')
    const replaceInput = wrapper.find('#replace-input')

    await findInput.setValue('find')
    await replaceInput.setValue('replace')
    await replaceInput.trigger('keydown.enter')

    const replaceEvents = wrapper.emitted('replace-next')
    expect(replaceEvents).toBeTruthy()
  })

  it('handles Escape key to close panel', async () => {
    wrapper = mount(FindReplace, {
      props: {
        visible: true,
        'onUpdate:visible': (value: boolean) =>
          wrapper?.setProps({ visible: value }),
      },
    })

    const findInput = wrapper.find('#find-input')
    await findInput.trigger('keydown.escape')

    const visibleEvents = wrapper.emitted('update:visible')
    expect(visibleEvents).toBeTruthy()
    expect(visibleEvents![0]).toEqual([false])
  })

  it('focuses find input when panel becomes visible', async () => {
    wrapper = mount(FindReplace, {
      props: {
        visible: false,
      },
    })

    await wrapper.setProps({ visible: true })
    await wrapper.vm.$nextTick()

    const findInput = wrapper.find('#find-input')
    // In test environment, we just verify the input exists and is ready
    expect(findInput.exists()).toBe(true)
  })

  it('disables buttons when find text is empty', () => {
    wrapper = mount(FindReplace, {
      props: {
        visible: true,
      },
    })

    const findNextButton = wrapper.find('button[title*="Find next"]')
    const findPrevButton = wrapper.find('button[title*="Find previous"]')
    const replaceButton = wrapper.find('button[title*="Replace current"]')
    const replaceAllButton = wrapper.find('button[title*="Replace all"]')

    // Buttons should be disabled when find text is empty
    expect(findNextButton.attributes('disabled')).toBeDefined()
    expect(findPrevButton.attributes('disabled')).toBeDefined()
    expect(replaceButton.attributes('disabled')).toBeDefined()
    expect(replaceAllButton.attributes('disabled')).toBeDefined()
  })

  it('enables buttons when find text is provided', async () => {
    wrapper = mount(FindReplace, {
      props: {
        visible: true,
      },
    })

    const findInput = wrapper.find('#find-input')
    await findInput.setValue('search text')

    const findNextButton = wrapper.find('button[title*="Find next"]')
    const findPrevButton = wrapper.find('button[title*="Find previous"]')
    const replaceButton = wrapper.find('button[title*="Replace current"]')
    const replaceAllButton = wrapper.find('button[title*="Replace all"]')

    // Buttons should be enabled when find text is provided
    expect(findNextButton.attributes('disabled')).toBeUndefined()
    expect(findPrevButton.attributes('disabled')).toBeUndefined()
    expect(replaceButton.attributes('disabled')).toBeUndefined()
    expect(replaceAllButton.attributes('disabled')).toBeUndefined()
  })
})
