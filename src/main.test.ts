import { describe, it, expect, vi } from 'vitest'

// Mock Vue to test main.ts initialization
vi.mock('vue', () => ({
  createApp: vi.fn(() => ({
    mount: vi.fn(),
  })),
}))

vi.mock('./App.vue', () => ({
  default: {},
}))

// Mock the CSS import to avoid PostCSS issues
vi.mock('./style.css', () => ({}))

describe('main.ts', () => {
  it('creates and mounts Vue application', async () => {
    const { createApp } = await import('vue')

    // Import main.ts to trigger the application initialization
    await import('./main')

    expect(createApp).toHaveBeenCalledWith(expect.any(Object))
  })
})
