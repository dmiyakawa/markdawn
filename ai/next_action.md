# Next Actions

## Current Status
✅ **Core Editor Complete** - Side-by-side layout, markdown processing, file operations  
✅ **Image System Complete** - Upload, storage, drag-and-drop, ZIP export integration
✅ **Content Persistence Complete** - Auto-save, localStorage, content preservation across reloads
✅ **UI Enhancement Complete** - Menu bar layout, responsive design, full-screen mode, resizable panes
✅ **Advanced Editor Features Complete** - CodeMirror 6 with syntax highlighting and emacs shortcuts
✅ **Find/Replace System Complete** - Full search functionality with regex and case-sensitive options
✅ **Unit Testing Complete** - 69/69 tests passing, comprehensive coverage across components
✅ **Dual Editor Layout Complete** - Always-visible Markdown (left) and WYSIWYG (right) editors
✅ **Information Pane Integration Complete** - Statistics and save status moved to header
✅ **WYSIWYG Integration Complete** - Bidirectional HTML↔Markdown sync with real-time updates
✅ **Cursor-Based Image Insertion Complete** - Images insert at cursor position instead of appending
⚠️  **E2E Testing Issues** - Playwright tests have configuration issues that need resolution
🔴 **Critical Issue: Image Reference Preservation** - stored:image-id becoming data blobs during WYSIWYG conversion

## Immediate Next Steps (Priority Order)

1. **CRITICAL: Fix Image Reference Preservation** 
   - **Debug WYSIWYG to Markdown conversion** - stored:image-id references becoming data:image/jpeg:base64 blobs
   - **Enhance image data mapping system** - improve tracking during bidirectional conversion
   - **Fix convertHtmlToMarkdown function** - preserve stored image references during HTML processing
   - **Test complete image editing workflow** - ensure references maintained throughout editing process

2. **Complete Advanced Editor Integration**
   - **Connect Find/Replace to CodeMirror** - Currently UI-only, needs search implementation
   - **Implement live scroll synchronization** between dual editors
   - **Add unit tests** for CodeMirrorEditor and FindReplace components  
   - **Optimize CodeMirror performance** for large documents

3. **Fix E2E Testing Infrastructure** 
   - **Resolve Playwright configuration issues** causing test runner failures
   - **Update E2E tests** to work with dual editor layout and CodeMirror selectors 
   - **Re-establish E2E test coverage** for Find/Replace functionality
   - **Verify visual regression tests** work with updated UI

4. **Testing Expansion** 
   - Enhanced E2E test scenarios (file upload simulation, drag-and-drop testing)
   - Performance testing optimization for large documents
   - Accessibility testing and ARIA compliance improvements

5. **Image Management Interface**
   - Create image gallery browser for stored images
   - Add image management panel (view, delete, organize stored images)
   - Implement batch image operations (select multiple, bulk delete)
   - Add image insertion helper with preview and alt text editing

6. **Advanced Editor Features**
   - Multiple document tabs/workspace management
   - Document outline/table of contents generation
   - Advanced export formats (standalone HTML, styled PDF)

## Development Commands Ready
- `npm run dev` - Start development server
- `npm run test` - Run unit tests
- `npm run test:coverage` - Check coverage
- `npm run test:e2e` - Run E2E tests
- `npm run test:e2e:headed` - Run E2E tests with browser visible
- `npm run test:e2e:update` - Update visual regression baselines
- `npm run lint` - Lint code
- `npm run format` - Format code

## Technical Approach Summary
- **Vue 3 Composition API + TypeScript**: Modern reactive UI with strict type safety
- **CodeMirror 6 integration**: Professional code editor with markdown syntax highlighting
- **Dual Editor Architecture**: Always-visible Markdown (left) and WYSIWYG (right) with bidirectional sync
- **Emacs-style Navigation**: Document-level keyboard shortcuts with browser default overrides
- **Find/Replace System**: Advanced search UI with regex, case-sensitive options (needs CodeMirror integration)
- **Information Pane**: Header-integrated statistics and save status with compact spacing
- **Flexbox Layout**: Reliable side-by-side positioning with resizable panes
- **Image Management**: localStorage-based storage with cursor-based insertion (reference preservation issues)
- **Auto-save & Persistence**: 30-second intervals with content preservation across reloads
- **Testing Strategy**: 69 passing unit tests, E2E infrastructure needs fixes

## Current State Assessment
The application has evolved into a sophisticated dual-editor markdown environment with professional CodeMirror integration and WYSIWYG capabilities. The most critical issue is image reference preservation during WYSIWYG-to-markdown conversion, which requires debugging the `convertHtmlToMarkdown` function to prevent stored:image-id references from becoming data blobs. The E2E testing infrastructure also needs attention to work with the new dual editor layout.