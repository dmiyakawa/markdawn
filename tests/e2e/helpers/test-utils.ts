import { Page, Locator } from '@playwright/test'

/**
 * Utility functions for E2E tests
 */

/**
 * Clear editor content and set new content
 * This function handles the proper clearing of CodeMirror content
 */
export async function setEditorContent(
  page: Page,
  editor: Locator,
  content: string
): Promise<void> {
  await editor.click()
  
  // Use Ctrl+A to select all
  await page.keyboard.press('Control+a')
  
  // Try different approaches to clear content
  await page.keyboard.press('Backspace')
  
  // Add a small delay to ensure the content is cleared
  await page.waitForTimeout(100)
  
  // Type the new content
  await page.keyboard.type(content)
  
  // Wait for the content to be processed
  await page.waitForTimeout(200)
}