# Remaining Tasks

## High Priority - Next Session

### Image Reference Preservation (Critical Issue)
- **Fix WYSIWYG to Markdown image conversion** - stored:image-id references becoming data blobs
- **Debug image data mapping system** - enhance tracking and conversion process
- **Test bidirectional image editing workflow** - ensure references are preserved

### Advanced Editor Features
- **Multiple Document Tabs with File Management**
  - Tab-based interface for handling multiple markdown files simultaneously
  - File name display in tabs with double-click editing capability
  - Active tab highlighting and proper tab switching functionality
  - ZIP export enhancement to include all open markdown files along with stored images
  - Document state management (unsaved changes indicators, auto-save per document)
  - New document creation with default naming (Document 1, Document 2, etc.)
  - Tab context menu with close, rename, duplicate options
- **Implement live scroll synchronization between dual editors**
- **Connect Find/Replace functionality to CodeMirror search system** 
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

### UI Layout Improvements
- ✅ **Information Pane Integration**: Moved statistics and save status to header with compact spacing
- ✅ **Full-Screen Mode Removal**: Replaced with WYSIWYG pane toggle for better workflow
- ✅ **Status Bar Elimination**: Moved all status information to header Information Pane
- ✅ **Dual Editor Layout**: Always-visible Markdown (left) and WYSIWYG (right) editors
- ✅ **Preview Pane Replacement**: WYSIWYG editor now occupies the former preview space

### Editor Enhancements  
- ✅ **Bidirectional Sync**: Real-time markdown ↔ HTML conversion with focus-aware updates
- ✅ **Cursor-Based Image Insertion**: Images insert at cursor position instead of end of document
- ✅ **Image Reference Tracking**: Enhanced conversion system (partial - needs debugging)

### Code Quality
- ✅ **Unit Test Updates**: Fixed all failing tests to match new UI layout
- ✅ **Linting**: All ESLint issues resolved, code properly formatted
- ✅ **Documentation Updates**: Architecture and decision documents updated

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