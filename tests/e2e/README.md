# End-to-End Testing Suite

This directory contains comprehensive E2E tests for the Markdown Editor application using Playwright.

## Test Structure

### 1. Visual Regression Tests (`visual-regression.spec.ts`)
- **Purpose**: Screenshot-based testing to ensure UI consistency
- **Coverage**: Homepage, editor panel, preview panel, menu bar, full-screen mode, mobile view, status bar
- **Features**:
  - Cross-browser screenshot comparison
  - Mobile responsive testing
  - Full-screen mode validation
  - Resizable panes testing

### 2. Core User Flows (`core-flows.spec.ts`)
- **Purpose**: Test essential user interactions and workflows
- **Coverage**:
  - Content creation and editing
  - File operations (new, import, export MD/ZIP)
  - Full-screen mode toggle
  - Responsive design adaptation
  - Keyboard shortcuts and accessibility

### 3. Image Upload Tests (`image-upload.spec.ts`)
- **Purpose**: Test image management functionality
- **Coverage**:
  - Upload button interface
  - File validation and input handling
  - Image integration with markdown
  - Storage and export with images

### 4. Performance Tests (`performance.spec.ts`)
- **Purpose**: Test application performance and resource handling
- **Coverage**:
  - Large document handling
  - Real-time preview performance
  - Memory and resource management
  - UI responsiveness under load
  - Export operation efficiency

## Running Tests

### Prerequisites
```bash
# Install dependencies (already done)
npm install
npx playwright install
```

### Test Commands
```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test tests/e2e/core-flows.spec.ts

# Run tests with UI (headed mode)
npx playwright test --headed

# Run tests in specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox

# Update visual regression baselines
npx playwright test --update-snapshots

# Generate HTML report
npx playwright show-report
```

### Browser Coverage
- **Chromium** (Chrome/Edge)
- **Firefox** 
- **Mobile Chrome** (Pixel 5)

## Test Configuration

The tests are configured via `playwright.config.ts`:

- **Base URL**: `http://localhost:5173` (Vite dev server)
- **Timeout**: 10 seconds for assertions
- **Retries**: 2 on CI, 0 locally
- **Parallel Execution**: Enabled for faster test runs
- **Visual Threshold**: 0.2 pixel difference tolerance
- **Reports**: HTML and JUnit XML formats

## Visual Regression Testing

### Initial Setup
On first run, Playwright creates baseline screenshots in `tests/e2e/visual-regression.spec.ts-snapshots/`. These serve as the reference for future comparisons.

### Updating Baselines
When UI changes are intentional, update baselines with:
```bash
npx playwright test --update-snapshots
```

### Screenshot Organization
- Format: `{test-name}-{browser}-{platform}.png`
- Storage: `tests/e2e/visual-regression.spec.ts-snapshots/`
- Comparison: Automatic during test execution

## Test Data and Test IDs

### Data Test IDs
The application includes `data-testid` attributes for reliable element selection:
- `markdown-editor`: Main textarea element
- `editor-panel`: Left editor panel
- `preview-panel`: Right preview panel  
- `resize-handle`: Pane resize handle
- `image-uploader`: Image upload component

### Consistent Button Titles
Tests rely on button `title` attributes:
- "New document"
- "Import markdown file"
- "Save to browser storage"
- "Load from browser storage"
- "Upload images"
- "Toggle full-screen editing"

## Performance Testing Strategy

### Load Testing
- Documents up to 100 sections
- Real-time preview updates
- Multiple file operations
- Viewport size changes

### Memory Testing  
- Multiple create/edit cycles
- Resource cleanup verification
- Large document processing
- Export operation efficiency

## Accessibility Testing

### Keyboard Navigation
- Tab order verification
- Focus management
- Keyboard shortcuts (Ctrl+A, etc.)

### Future Enhancements
- ARIA compliance testing
- Screen reader compatibility
- Color contrast validation

## CI/CD Integration

### GitHub Actions Ready
The test suite is configured for CI environments:
- Headless browser execution
- JUnit XML reports for CI systems
- Screenshot artifact generation
- Failure video recording

### Environment Variables
- `CI=true`: Enables CI-specific settings
- Automatic retry configuration
- Worker count optimization

## Troubleshooting

### Common Issues

1. **Port Conflicts**: Ensure dev server runs on port 5173
2. **Screenshot Diffs**: Expected on first run or after UI changes
3. **Timeout Errors**: Increase wait times for slower environments
4. **WSL Issues**: Screenshots may vary due to font rendering

### Debug Mode
```bash
# Run with debug info
npx playwright test --debug

# Show trace viewer
npx playwright show-trace test-results/trace.zip
```

## Test Maintenance

### Adding New Tests
1. Follow existing patterns in test files
2. Use appropriate `data-testid` selectors
3. Include both positive and negative test cases
4. Add proper test documentation

### Visual Test Updates
1. Review screenshot diffs carefully
2. Update baselines only for intentional changes
3. Test across all supported browsers
4. Document visual changes in commit messages

## Coverage Goals

- ✅ **Core Functionality**: 100% of main user flows
- ✅ **Visual Consistency**: Key UI components
- ✅ **Cross-Browser**: All supported browsers
- ✅ **Performance**: Large document handling
- ✅ **Responsive**: Mobile and desktop viewports
- 🔄 **Accessibility**: Keyboard navigation (partial)
- 📝 **Future**: Advanced image upload scenarios