import { test, expect } from '@playwright/test'

/**
 * Visual Regression Tests
 * Screenshots to ensure UI consistency across changes
 */
test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/')

    // Wait for the app to be fully loaded
    await page.waitForSelector('[data-testid="codemirror-editor"]', {
      timeout: 10000,
    })

    // Wait for any animations to complete
    await page.waitForTimeout(500)
  })

  test('should match homepage screenshot', async ({ page }) => {
    // Take full page screenshot
    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('should match editor panel screenshot', async ({ page }) => {
    // Focus on editor panel
    const editorPanel = page.locator('[data-testid="editor-panel"]')
    await expect(editorPanel).toHaveScreenshot('editor-panel.png', {
      animations: 'disabled',
    })
  })

  test('should match preview panel screenshot', async ({ page }) => {
    // Focus on preview panel
    const previewPanel = page.locator('[data-testid="preview-panel"]')
    await expect(previewPanel).toHaveScreenshot('preview-panel.png', {
      animations: 'disabled',
    })
  })

  test('should match menu bar screenshot', async ({ page }) => {
    // Focus on menu bar
    const menuBar = page.locator('header')
    await expect(menuBar).toHaveScreenshot('menu-bar.png', {
      animations: 'disabled',
    })
  })

  test('should match find/replace panel screenshot', async ({ page }) => {
    // Open find/replace panel
    await page.click('button[title="Toggle Find/Replace (Ctrl+H)"]')

    // Wait for panel to show
    await page.waitForTimeout(500)

    // Take screenshot with find/replace panel open
    await expect(page).toHaveScreenshot('find-replace-panel.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('should match mobile view screenshot', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Wait for responsive layout
    await page.waitForTimeout(500)

    // Take mobile screenshot
    await expect(page).toHaveScreenshot('mobile-view.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('should match resizable panes screenshot', async ({ page }) => {
    // Drag the resize handle to change pane sizes
    const resizeHandle = page.locator('[data-testid="resize-handle"]')

    if (await resizeHandle.isVisible()) {
      // Drag resize handle to 70% left, 30% right
      const editorPanel = page.locator('[data-testid="editor-panel"]')
      const editorBounds = await editorPanel.boundingBox()

      if (editorBounds) {
        await resizeHandle.dragTo(page.locator('body'), {
          targetPosition: {
            x: editorBounds.x + editorBounds.width * 0.7,
            y: editorBounds.y + editorBounds.height * 0.5,
          },
        })

        // Wait for resize animation
        await page.waitForTimeout(500)

        // Take screenshot of resized layout
        await expect(page).toHaveScreenshot('resized-panes.png', {
          fullPage: true,
          animations: 'disabled',
        })
      }
    }
  })

  test('should match status bar screenshot', async ({ page }) => {
    // Type some content to populate status bar
    const editor = page.locator('[data-testid="codemirror-editor"] .cm-content')
    await editor.click()
    await page.keyboard.press('Control+a')
    await page.keyboard.type(
      '# Test Content\n\nThis is a test document with **bold** text.'
    )

    // Wait for status update
    await page.waitForTimeout(500)

    // Focus on status bar
    const statusBar = page.locator('footer')
    await expect(statusBar).toHaveScreenshot('status-bar.png', {
      animations: 'disabled',
    })
  })
})
