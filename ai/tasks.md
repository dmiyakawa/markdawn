# Remaining Tasks

## High Priority - Next Session

### Advanced Editor Features
- ✅ **COMPLETED**: Add syntax highlighting to markdown editor (CodeMirror 6 implemented)
- ✅ **COMPLETED**: Search and replace functionality within editor (FindReplace component with regex support)
- ✅ **COMPLETED**: Keyboard shortcuts for common operations (Emacs-style navigation implemented)
- **Implement live scroll synchronization between editor and preview**
- **Connect Find/Replace functionality to CodeMirror search system** 
- **Add unit tests for CodeMirrorEditor and FindReplace components**
- Undo/redo functionality with command history (basic CodeMirror history enabled)

### Additional Testing Expansion  
- **Fix E2E test issues with Playwright test runner** (current high priority)
- **Update E2E tests to work with CodeMirror editor selectors**
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
- Multiple document tabs
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