import { test, expect } from '@playwright/test'

/**
 * Core User Flow Tests
 * Test essential user interactions and workflows
 */
test.describe('Core User Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-testid="codemirror-editor"]', {
      timeout: 10000,
    })
    await page.waitForTimeout(500)
  })

  test.describe('Content Creation and Editing', () => {
    test('should allow basic markdown editing', async ({ page }) => {
      const editor = page.locator(
        '[data-testid="codemirror-editor"] .cm-content'
      )

      // Clear existing content and add new content
      await editor.click()
      await page.keyboard.press('Control+a')
      await page.keyboard.type(
        '# My Document\n\nThis is **bold** text and *italic* text.'
      )

      // Verify content appears in editor
      const editorContent = await editor.textContent()
      expect(editorContent).toContain('# My Document')
      expect(editorContent).toContain('**bold**')

      // Verify preview renders HTML correctly
      const preview = page.locator('[data-testid="preview-panel"] .prose')
      await expect(preview.locator('h1')).toContainText('My Document')
      await expect(preview.locator('strong')).toContainText('bold')
      await expect(preview.locator('em')).toContainText('italic')
    })

    test('should update status bar with content statistics', async ({
      page,
    }) => {
      const editor = page.locator(
        '[data-testid="codemirror-editor"] .cm-content'
      )
      const statusBar = page.locator('footer')

      // Add content
      await editor.click()
      await page.keyboard.press('Control+a')
      await page.keyboard.type(
        '# Test Document\n\nThis is a test with multiple words.'
      )
      await page.waitForTimeout(500)

      // Check status bar updates
      await expect(statusBar).toContainText('Words:')
      await expect(statusBar).toContainText('Characters:')
      await expect(statusBar).toContainText('Lines:')
    })

    test('should toggle preview visibility', async ({ page }) => {
      const previewToggle = page.locator('button[title="Toggle preview"]')
      const previewPanel = page.locator('[data-testid="preview-panel"]')

      // Toggle preview off
      await previewToggle.click()
      await expect(previewPanel.locator('.prose')).toBeHidden()

      // Toggle preview back on
      await previewToggle.click()
      await expect(previewPanel.locator('.prose')).toBeVisible()
    })
  })

  test.describe('File Operations', () => {
    test('should create new document', async ({ page }) => {
      const editor = page.locator(
        '[data-testid="codemirror-editor"] .cm-content'
      )

      // Add some content first
      await editor.click()
      await page.keyboard.press('Control+a')
      await page.keyboard.type('# Existing Content')

      // Handle the confirmation dialog by accepting it
      page.on('dialog', (dialog) => dialog.accept())

      // Click New button
      await page.click('button[title="New document"]')

      // Verify new document template is loaded
      const editorContent = await editor.textContent()
      expect(editorContent).toContain('# New Document')
      expect(editorContent).toContain('Start writing your markdown here...')
    })

    test('should export markdown file', async ({ page }) => {
      const editor = page.locator(
        '[data-testid="codemirror-editor"] .cm-content'
      )

      // Add content to export
      await editor.click()
      await page.keyboard.press('Control+a')
      await page.keyboard.type(
        '# Export Test\n\nThis content will be exported.'
      )

      // Set up download promise before clicking
      const downloadPromise = page.waitForEvent('download')

      // Click export MD button
      await page.click('button:has-text("MD")')

      // Wait for download
      const download = await downloadPromise
      expect(download.suggestedFilename()).toMatch(/.*\.md$/)
    })

    test('should export ZIP file with complete project', async ({ page }) => {
      const editor = page.locator(
        '[data-testid="codemirror-editor"] .cm-content'
      )

      // Add content
      await editor.click()
      await page.keyboard.press('Control+a')
      await page.keyboard.type(
        '# ZIP Export Test\n\nThis will be exported as ZIP.'
      )

      // Set up download promise
      const downloadPromise = page.waitForEvent('download')

      // Click export ZIP button
      await page.click('button:has-text("ZIP")')

      // Wait for download
      const download = await downloadPromise
      expect(download.suggestedFilename()).toMatch(/markdown-project.*\.zip$/)
    })
  })

  test.describe('Full-Screen Mode', () => {
    test('should toggle full-screen editing mode', async ({ page }) => {
      const fullScreenButton = page.locator(
        'button[title="Toggle full-screen editing"]'
      )
      const header = page.locator('header')
      const footer = page.locator('footer')

      // Enter full-screen mode
      await fullScreenButton.click()
      await page.waitForTimeout(500)

      // Verify header and footer are hidden
      await expect(header).toBeHidden()
      await expect(footer).toBeHidden()

      // Verify exit button is visible
      const exitButton = page.locator('button:has-text("⤾ Exit")')
      await expect(exitButton).toBeVisible()

      // Exit full-screen mode
      await exitButton.click()
      await page.waitForTimeout(500)

      // Verify header and footer are visible again
      await expect(header).toBeVisible()
      await expect(footer).toBeVisible()
    })
  })

  test.describe('Responsive Design', () => {
    test('should adapt to mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      await page.waitForTimeout(500)

      // Verify layout adapts
      const container = page.locator('main > div').first()
      await expect(container).toBeVisible()

      // Check that menu items are still accessible
      const menuButtons = page.locator('header button')
      await expect(menuButtons.first()).toBeVisible()
    })

    test('should maintain functionality on tablet viewport', async ({
      page,
    }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.waitForTimeout(500)

      const editor = page.locator(
        '[data-testid="codemirror-editor"] .cm-content'
      )
      await editor.click()
      await page.keyboard.press('Control+a')
      await page.keyboard.type('# Tablet Test\n\nTesting on tablet viewport.')

      // Verify preview still works
      const preview = page.locator('[data-testid="preview-panel"] .prose')
      await expect(preview.locator('h1')).toContainText('Tablet Test')
    })
  })

  test.describe('Keyboard Shortcuts and Accessibility', () => {
    test('should focus editor with keyboard navigation', async ({ page }) => {
      const editor = page.locator(
        '[data-testid="codemirror-editor"] .cm-content'
      )

      // Focus editor and clear existing content
      await editor.click()
      await page.keyboard.press('Control+a')

      // Type content
      await page.keyboard.type('# Keyboard Test')

      // Verify content was entered
      const editorContent = await editor.textContent()
      expect(editorContent).toContain('# Keyboard Test')
    })

    test('should support common keyboard shortcuts', async ({ page }) => {
      const editor = page.locator(
        '[data-testid="codemirror-editor"] .cm-content'
      )
      await editor.click()

      // Type content
      await page.keyboard.type('Some text to select')

      // Select all with Ctrl+A
      await page.keyboard.press('Control+a')

      // Type replacement text
      await page.keyboard.type('# New Content')

      // Verify content was replaced
      const editorContent = await editor.textContent()
      expect(editorContent).toContain('# New Content')
    })
  })
})
