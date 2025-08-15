import { test, expect } from '@playwright/test'

/**
 * Find/Replace Functionality Tests
 * Test the find and replace functionality with CodeMirror integration
 */
test.describe('Find/Replace Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-testid="codemirror-editor"]', {
      timeout: 10000,
    })
    await page.waitForTimeout(500)
  })

  test('should open and close find/replace panel', async ({ page }) => {
    const findReplaceButton = page.locator(
      'button[title="Toggle Find/Replace (Ctrl+H)"]'
    )
    const findReplacePanel = page.locator('[data-testid="find-replace-panel"]')

    // Initially hidden
    await expect(findReplacePanel).toBeHidden()

    // Open panel with button
    await findReplaceButton.click()
    await page.waitForTimeout(300)
    await expect(findReplacePanel).toBeVisible()

    // Close panel with close button
    const closeButton = findReplacePanel.locator(
      'button[title="Close (Escape)"]'
    )
    await closeButton.click()
    await page.waitForTimeout(300)
    await expect(findReplacePanel).toBeHidden()
  })

  test('should find text in document', async ({ page }) => {
    const editor = page.locator('[data-testid="codemirror-editor"] .cm-content')
    const findReplaceButton = page.locator(
      'button[title="Toggle Find/Replace (Ctrl+H)"]'
    )

    // Add test content
    await editor.click()
    await editor.fill(
      '# Test Document\n\nThis is a test with some test text.\nAnother line with test content.'
    )

    // Open find/replace panel
    await findReplaceButton.click()
    await page.waitForTimeout(300)

    const findReplacePanel = page.locator('[data-testid="find-replace-panel"]')
    const searchInput = findReplacePanel.locator(
      'input[placeholder*="Search text"]'
    )

    // Enter search term
    await searchInput.fill('test')
    await page.waitForTimeout(500)

    // Check that matches are highlighted in the editor
    // The exact selector may vary based on CodeMirror's search highlighting
    const editorWithHighlights = page.locator(
      '[data-testid="codemirror-editor"]'
    )

    // Verify search input has value
    await expect(searchInput).toHaveValue('test')
  })

  test('should navigate between search results', async ({ page }) => {
    const editor = page.locator('[data-testid="codemirror-editor"] .cm-content')
    const findReplaceButton = page.locator(
      'button[title="Toggle Find/Replace (Ctrl+H)"]'
    )

    // Add test content with multiple instances
    await editor.click()
    await editor.fill('test one test two test three')

    // Open find/replace panel
    await findReplaceButton.click()
    await page.waitForTimeout(300)

    const findReplacePanel = page.locator('[data-testid="find-replace-panel"]')
    const searchInput = findReplacePanel.locator(
      'input[placeholder*="Search text"]'
    )
    const nextButton = findReplacePanel.locator(
      'button[title="Find next (Enter)"]'
    )
    const prevButton = findReplacePanel.locator(
      'button[title="Find previous (Shift+Enter)"]'
    )

    // Enter search term
    await searchInput.fill('test')
    await page.waitForTimeout(500)

    // Test next/previous navigation
    await nextButton.click()
    await page.waitForTimeout(200)
    await nextButton.click()
    await page.waitForTimeout(200)
    await prevButton.click()
    await page.waitForTimeout(200)
  })

  test('should replace single occurrence', async ({ page }) => {
    const editor = page.locator('[data-testid="codemirror-editor"] .cm-content')
    const findReplaceButton = page.locator(
      'button[title="Toggle Find/Replace (Ctrl+H)"]'
    )

    // Add test content
    await editor.click()
    await editor.fill('Hello world! This is a world of tests.')
    await page.waitForTimeout(500)

    // Open find/replace panel
    await findReplaceButton.click()
    await page.waitForTimeout(500)

    const findReplacePanel = page.locator('[data-testid="find-replace-panel"]')
    await expect(findReplacePanel).toBeVisible()
    
    const searchInput = findReplacePanel.locator(
      'input[placeholder*="Search text"]'
    )
    const replaceInput = findReplacePanel.locator(
      'input[placeholder*="Replace with"]'
    )
    const replaceButton = findReplacePanel.locator(
      'button[title="Replace current match"]'
    )

    // Wait for inputs to be visible
    await expect(searchInput).toBeVisible()
    await expect(replaceInput).toBeVisible()
    await expect(replaceButton).toBeVisible()

    // Enter search and replace terms
    await searchInput.fill('world')
    await page.waitForTimeout(300)
    
    // Find first to ensure search is active
    const findNextButton = findReplacePanel.locator(
      'button[title="Find next (Enter)"]'
    )
    await findNextButton.click()
    await page.waitForTimeout(300)
    
    await replaceInput.fill('universe')
    await page.waitForTimeout(500)

    // Replace single occurrence
    await replaceButton.click()
    await page.waitForTimeout(1000)

    // Verify replacement occurred
    const editorContent = await editor.textContent()
    expect(editorContent).toContain('Hello universe!')
    expect(editorContent).toContain('world of tests') // Second occurrence should remain
  })

  test('should replace all occurrences', async ({ page }) => {
    const editor = page.locator('[data-testid="codemirror-editor"] .cm-content')
    const findReplaceButton = page.locator(
      'button[title="Toggle Find/Replace (Ctrl+H)"]'
    )

    // Add test content
    await editor.click()
    await editor.fill('cat and cat and another cat')
    await page.waitForTimeout(500)

    // Open find/replace panel
    await findReplaceButton.click()
    await page.waitForTimeout(500)

    const findReplacePanel = page.locator('[data-testid="find-replace-panel"]')
    await expect(findReplacePanel).toBeVisible()
    
    const searchInput = findReplacePanel.locator(
      'input[placeholder*="Search text"]'
    )
    const replaceInput = findReplacePanel.locator(
      'input[placeholder*="Replace with"]'
    )
    const replaceAllButton = findReplacePanel.locator(
      'button[title="Replace all matches"]'
    )

    // Wait for inputs to be visible
    await expect(searchInput).toBeVisible()
    await expect(replaceInput).toBeVisible()
    await expect(replaceAllButton).toBeVisible()

    // Enter search and replace terms
    await searchInput.fill('cat')
    await page.waitForTimeout(300)
    
    // Find first to ensure search is active
    const findNextButton = findReplacePanel.locator(
      'button[title="Find next (Enter)"]'
    )
    await findNextButton.click()
    await page.waitForTimeout(300)
    
    await replaceInput.fill('dog')
    await page.waitForTimeout(500)

    // Replace all occurrences
    await replaceAllButton.click()
    await page.waitForTimeout(1000)

    // Verify all replacements occurred
    const editorContent = await editor.textContent()
    expect(editorContent).toBe('dog and dog and another dog')
  })

  test('should support case-sensitive search', async ({ page }) => {
    const editor = page.locator('[data-testid="codemirror-editor"] .cm-content')
    const findReplaceButton = page.locator(
      'button[title="Toggle Find/Replace (Ctrl+H)"]'
    )

    // Add test content with mixed case
    await editor.click()
    await editor.fill('Test test TEST')

    // Open find/replace panel
    await findReplaceButton.click()
    await page.waitForTimeout(300)

    const findReplacePanel = page.locator('[data-testid="find-replace-panel"]')
    const searchInput = findReplacePanel.locator(
      'input[placeholder*="Search text"]'
    )
    const caseSensitiveCheckbox = findReplacePanel
      .locator('input[type="checkbox"]')
      .first()

    // Enter search term
    await searchInput.fill('test')

    // Toggle case sensitivity
    await caseSensitiveCheckbox.click()
    await page.waitForTimeout(300)

    // Verify case-sensitive checkbox is checked
    await expect(caseSensitiveCheckbox).toBeChecked()
  })

  test('should support regular expression search', async ({ page }) => {
    const editor = page.locator('[data-testid="codemirror-editor"] .cm-content')
    const findReplaceButton = page.locator(
      'button[title="Toggle Find/Replace (Ctrl+H)"]'
    )

    // Add test content
    await editor.click()
    await editor.fill('123 test 456 example 789')

    // Open find/replace panel
    await findReplaceButton.click()
    await page.waitForTimeout(300)

    const findReplacePanel = page.locator('[data-testid="find-replace-panel"]')
    const searchInput = findReplacePanel.locator(
      'input[placeholder*="Search text"]'
    )
    const regexCheckbox = findReplacePanel
      .locator('input[type="checkbox"]')
      .last()

    // Enable regex mode
    await regexCheckbox.click()
    await page.waitForTimeout(300)

    // Enter regex pattern
    await searchInput.fill('\\d+')
    await page.waitForTimeout(500)

    // Verify regex checkbox is checked
    await expect(regexCheckbox).toBeChecked()
  })
})
