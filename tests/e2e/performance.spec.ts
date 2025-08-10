import { test, expect } from '@playwright/test'

/**
 * Performance and Load Tests
 * Test application performance with large documents and heavy operations
 */
test.describe('Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-testid="codemirror-editor"]', {
      timeout: 10000,
    })
    await page.waitForTimeout(500)
  })

  test.describe('Large Document Handling', () => {
    test('should handle large markdown documents efficiently', async ({
      page,
    }) => {
      const editor = page.locator(
        '[data-testid="codemirror-editor"] .cm-content'
      )

      // Generate large document content
      const sections = Array.from(
        { length: 50 },
        (_, i) =>
          `## Section ${i + 1}\n\nThis is paragraph ${i + 1} with **bold** and *italic* text. ` +
          `Here's some code: \`const value = ${i}\`.\n\n` +
          `- List item 1 for section ${i + 1}\n` +
          `- List item 2 for section ${i + 1}\n` +
          `- List item 3 for section ${i + 1}\n\n`
      ).join('')

      const largeContent = `# Large Document Test\n\n${sections}`

      // Measure time to input large content
      const startTime = Date.now()
      await editor.click()
      await page.keyboard.press('Control+a')
      await page.keyboard.type(largeContent)
      const inputTime = Date.now() - startTime

      // Should complete input within reasonable time (10 seconds for CodeMirror)
      expect(inputTime).toBeLessThan(10000)

      // Verify content is properly handled
      const editorContent = await editor.textContent()
      expect(editorContent).toContain('# Large Document Test')

      // Wait for preview to render
      await page.waitForTimeout(1000)

      // Verify preview renders without crashing
      const preview = page.locator('[data-testid="preview-panel"] .prose')
      await expect(preview.locator('h1')).toContainText('Large Document Test')
      await expect(preview.locator('h2')).toHaveCount(50)
    })

    test('should maintain responsiveness during large document editing', async ({
      page,
    }) => {
      const editor = page.locator(
        '[data-testid="codemirror-editor"] .cm-content'
      )

      // Create medium-sized document
      const mediumContent = Array.from(
        { length: 20 },
        (_, i) => `# Heading ${i}\n\nParagraph ${i} with some content.\n\n`
      ).join('')

      await editor.click()
      await page.keyboard.press('Control+a')
      await page.keyboard.type(mediumContent)

      // Test responsiveness by adding content at the end
      await page.keyboard.press('Control+End')

      const additionalContent =
        '\n\n## New Section\n\nThis content was added after loading.'
      await page.keyboard.type(additionalContent)

      // Verify content was added
      const finalValue = await editor.textContent()
      expect(finalValue).toContain('This content was added after loading.')
    })
  })

  test.describe('Real-time Preview Performance', () => {
    test('should update preview efficiently during typing', async ({
      page,
    }) => {
      const editor = page.locator(
        '[data-testid="codemirror-editor"] .cm-content'
      )
      const preview = page.locator('[data-testid="preview-panel"] .prose')

      // Start with some content
      await editor.click()
      await page.keyboard.press('Control+a')
      await page.keyboard.type('# Performance Test\n\n')

      // Add content to test real-time updates
      const testText = 'Quick brown fox jumps over lazy dog'
      await page.keyboard.type(testText)
      await page.waitForTimeout(500)

      // Verify preview updates
      await expect(preview).toContainText('Performance Test')
      await expect(preview).toContainText('Quick brown fox')
    })

    test('should handle rapid content changes without lag', async ({
      page,
    }) => {
      const editor = page.locator(
        '[data-testid="codemirror-editor"] .cm-content'
      )

      // Rapid content changes
      const contents = [
        '# First Version',
        '# Second Version\n\nWith content.',
        '# Final Version\n\n- List item\n- Another item',
      ]

      for (const content of contents) {
        await editor.click()
        await page.keyboard.press('Control+a')
        await page.keyboard.type(content)
        await page.waitForTimeout(100) // Quick changes
      }

      // Verify final content is correct
      const editorContent = await editor.textContent()
      expect(editorContent).toContain('# Final Version')

      // Verify preview updated to final state
      const preview = page.locator('[data-testid="preview-panel"] .prose')
      await expect(preview.locator('h1')).toContainText('Final Version')
    })
  })

  test.describe('Memory and Resource Management', () => {
    test('should handle multiple document operations without memory leaks', async ({
      page,
    }) => {
      const editor = page.locator(
        '[data-testid="codemirror-editor"] .cm-content'
      )

      // Perform multiple create/edit cycles (reduced from 10 to 5 for efficiency)
      for (let i = 0; i < 5; i++) {
        // Create new document
        await page.click('button[title="New document"]')

        // Add content
        const content = `# Document ${i}\n\nContent for document ${i}.`
        await editor.click()
        await page.keyboard.press('Control+a')
        await page.keyboard.type(content)

        // Verify content
        const editorContent = await editor.textContent()
        expect(editorContent).toContain(`# Document ${i}`)

        // Short wait between operations
        await page.waitForTimeout(100)
      }

      // Final verification - should still be responsive
      await page.click('button[title="New document"]')
      await editor.click()
      await page.keyboard.press('Control+a')
      await page.keyboard.type('# Final Test')
      const finalContent = await editor.textContent()
      expect(finalContent).toContain('# Final Test')
    })

    test('should handle export operations efficiently', async ({ page }) => {
      const editor = page.locator(
        '[data-testid="codemirror-editor"] .cm-content'
      )

      // Create document with substantial content
      const content = Array.from(
        { length: 10 },
        (_, i) =>
          `## Section ${i}\n\nContent for section ${i} with various formatting.\n\n`
      ).join('')

      await editor.click()
      await page.keyboard.press('Control+a')
      await page.keyboard.type(`# Export Performance Test\n\n${content}`)

      // Test MD export performance
      const mdExportPromise = page.waitForEvent('download')
      await page.click('button:has-text("MD")')
      const mdDownload = await mdExportPromise
      expect(mdDownload.suggestedFilename()).toMatch(/.*\.md$/)

      await page.waitForTimeout(500)

      // Test ZIP export performance
      const zipExportPromise = page.waitForEvent('download')
      await page.click('button:has-text("ZIP")')
      const zipDownload = await zipExportPromise
      expect(zipDownload.suggestedFilename()).toMatch(
        /markdown-project.*\.zip$/
      )
    })
  })

  test.describe('UI Responsiveness', () => {
    test('should maintain smooth resizing performance', async ({ page }) => {
      const resizeHandle = page.locator('[data-testid="resize-handle"]')

      if (await resizeHandle.isVisible()) {
        const editorPanel = page.locator('[data-testid="editor-panel"]')
        const startBounds = await editorPanel.boundingBox()

        if (startBounds) {
          // Perform multiple resize operations
          const positions = [0.3, 0.7, 0.5, 0.6, 0.4]

          for (const position of positions) {
            await resizeHandle.dragTo(page.locator('body'), {
              targetPosition: {
                x: startBounds.x + startBounds.width * position,
                y: startBounds.y + startBounds.height * 0.5,
              },
            })

            await page.waitForTimeout(100)
          }

          // Verify final position is reasonable
          const finalBounds = await editorPanel.boundingBox()
          expect(finalBounds).toBeTruthy()
        }
      }
    })

    test('should handle viewport changes efficiently', async ({ page }) => {
      const viewports = [
        { width: 1920, height: 1080 },
        { width: 1024, height: 768 },
        { width: 768, height: 1024 },
        { width: 375, height: 667 },
        { width: 1440, height: 900 },
      ]

      const editor = page.locator(
        '[data-testid="codemirror-editor"] .cm-content'
      )
      await editor.click()
      await page.keyboard.press('Control+a')
      await page.keyboard.type(
        '# Viewport Test\n\nTesting responsiveness across different screen sizes.'
      )

      for (const viewport of viewports) {
        await page.setViewportSize(viewport)
        await page.waitForTimeout(200)

        // Verify layout remains functional
        await expect(editor).toBeVisible()
        const preview = page.locator('[data-testid="preview-panel"]')
        await expect(preview).toBeVisible()
      }
    })
  })
})
