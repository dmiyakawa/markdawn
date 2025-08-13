# Remaining Tasks

## High Priority - Next Session

### ✅ COMPLETED: Critical Issues Fixed
- ✅ **Image Reference Preservation**: Fixed stored:image-id references becoming data blobs with `findStoredImageByDataUrl()` function
- ✅ **Find/Replace Integration**: Connected UI to CodeMirror search system with full regex and case-sensitive support
- ✅ **Scroll Synchronization**: Implemented bidirectional percentage-based scroll sync between dual editors
- ✅ **Viewport Height Management**: Constrained editor panes to viewport bounds preventing infinite vertical expansion

### Advanced Editor Features
- **Multiple Document Tabs with File Management** (High Priority)
  - Tab-based interface for handling multiple markdown files simultaneously
  - File name display in tabs with double-click editing capability
  - Active tab highlighting and proper tab switching functionality
  - ZIP export enhancement to include all open markdown files along with stored images
  - Document state management (unsaved changes indicators, auto-save per document)
  - New document creation with default naming (Document 1, Document 2, etc.)
  - Tab context menu with close, rename, duplicate options
- ✅ **Scroll Synchronization**: Implemented bidirectional sync between dual editors
- ✅ **Find/Replace Integration**: Connected to CodeMirror search system with full functionality
- **Add unit tests for CodeMirrorEditor and FindReplace components**
- Undo/redo functionality with command history (basic CodeMirror history enabled)

### Additional Testing Expansion  
- **Fix E2E test issues with Playwright test runner** (current high priority)
- **Update E2E tests to work with dual editor layout and CodeMirror selectors**
- Enhanced performance testing scenarios
- Accessibility testing and ARIA compliance improvements
- Advanced E2E test scenarios (file upload, drag-and-drop simulation)

## Medium Priority

### Image Management Features
- Create image management interface (view, delete stored images)
- Add image gallery browser for stored images
- Implement batch image operations (delete multiple, export)
- Test image upload and resize functionality across browsers

### Performance and Polish
- Syntax highlighting optimization for large documents  
- Virtual scrolling for very large markdown files
- Performance monitoring and optimization
- Loading states and progress indicators

## Low Priority - Future Considerations

### Image Enhancement Features
- Add support for common image formats (JPEG, PNG, WebP, GIF)
- Implement image optimization (compression quality settings)

### Advanced Features
- Plugin system for custom markdown extensions
- Document outline/table of contents
- Print functionality
- PDF export

### Performance Optimization
- Code splitting for large markdown libraries
- Virtual scrolling for large documents
- Web Workers for heavy markdown processing

### Deployment Options
- Static hosting configuration (Netlify, Vercel)
- PWA capabilities (offline support)
- Docker configuration for containerized deployment

## Recent Completions (This Session)

### Critical Bug Fixes
- ✅ **List Conversion Enhancement**: Fixed WYSIWYG list editing losing markdown notation with recursive `convertListContent()` function
  - Supports nested unordered (ul) and ordered (ol) lists with proper indentation
  - Maintains list markers (-, numbers) based on context and nesting level
  - Handles mixed nested lists with correct markdown syntax
  - Preserves bidirectional sync integrity during WYSIWYG list editing
- ✅ **Image Reference Preservation**: Fixed critical issue where stored:image-id became data blobs during WYSIWYG conversion
- ✅ **Search System Integration**: Connected Find/Replace UI to CodeMirror's search engine with regex/case-sensitive support
- ✅ **Scroll Synchronization**: Implemented bidirectional scroll sync between dual editors using percentage-based positioning
- ✅ **Viewport Height Constraints**: Limited editor panes to viewport bounds preventing infinite vertical expansion

### Advanced Features Implementation
- ✅ **Professional Search**: Full regex support, case-sensitive options, visual highlighting, keyboard shortcuts
- ✅ **Emacs-style Navigation**: Complete keyboard shortcuts with browser default overrides  
- ✅ **Image Data Mapping**: Enhanced HTML↔Markdown conversion with stored image reference preservation
- ✅ **Scroll Loop Prevention**: Smart synchronization with timing controls to prevent circular updates

### Code Quality & Testing
- ✅ **Unit Test Coverage**: 74/74 tests passing, maintained coverage above 80%
- ✅ **Linting & Formatting**: All ESLint issues resolved, consistent code formatting with Prettier
- ✅ **Type Safety**: Proper TypeScript interfaces and type definitions throughout
- ✅ **Test Updates**: Fixed App.test.ts to match new Preview/WYSIWYG mode toggle behavior
- ✅ **Documentation Updates**: Architecture, decisions, and task documentation updated with list conversion details

## Completed Tasks

See [ai/completed_tasks.md](./completed_tasks.md) for detailed record of all completed features and implementations.

## Unresolved Concerns

### Technical Decisions Needed  
- ✅ **RESOLVED**: Editor library selection for syntax highlighting (CodeMirror 6 selected and implemented)
- **Find/Replace search algorithm implementation** (decide on search strategy with CodeMirror)
- State management approach as complexity grows (consider Pinia)
- PWA capabilities and offline support strategy
- Performance optimization for large image collections
- Advanced markdown extensions (tables, math, diagrams)

### Testing Strategy
- File upload simulation in E2E tests (actual file drop testing)
- Advanced image processing testing scenarios
- Cross-browser visual regression testing maintenance

### Browser Compatibility
- Target browser versions to support
- Polyfill requirements assessment  
- Mobile device optimization and testing