# Remaining Tasks

## High Priority - Next Session

### File Operations Implementation
- File upload/import functionality for .md files
- Export to markdown file with download capability
- Save/load functionality using browser localStorage
- Clear/new document functionality with confirmation
- Auto-save feature to prevent data loss

### User Interface Enhancements  
- Add syntax highlighting to markdown editor (CodeMirror or Monaco)
- Implement live scroll synchronization between editor and preview
- Add status bar with word/character/line count
- Responsive design improvements for mobile devices
- Dark mode toggle functionality

## Medium Priority

### Advanced Editor Features
- Search and replace functionality within editor
- Keyboard shortcuts for common formatting operations
- Undo/redo functionality with command history
- Full-screen editing mode
- Split pane resizing for custom layout

### Performance and Polish
- Syntax highlighting optimization for large documents  
- Virtual scrolling for very large markdown files
- Performance monitoring and optimization
- Loading states and progress indicators

### Testing Expansion
- End-to-end testing with Playwright or Cypress
- Visual regression testing
- Performance testing
- Accessibility testing

## Low Priority - Future Considerations

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

## Completed Since Last Update ✅
- **Markdown Processing**: Implemented marked.js v16.1.2 with comprehensive feature support
- **WYSIWYG Enhancement**: Added proper HTML-to-markdown conversion
- **Testing Coverage**: Added 16 comprehensive markdown tests, achieving 87.41% coverage
- **Feature Support**: Code blocks, links, lists, task lists, blockquotes all working

## Unresolved Concerns

### Technical Decisions Needed  
- Editor library selection for syntax highlighting (CodeMirror vs Monaco)
- State management approach as complexity grows (consider Pinia)
- File storage strategy (localStorage vs IndexedDB for larger documents)
- PWA capabilities and offline support strategy

### Testing Strategy
- End-to-end testing framework selection and setup
- File upload/download testing approach
- Performance testing for large documents
- Accessibility testing implementation

### Browser Compatibility
- Target browser versions to support
- Polyfill requirements assessment  
- Mobile device optimization and testing