# Remaining Tasks

See [ai/completed_tasks.md](./completed_tasks.md) for completed features and implementations.

## High Priority - Next Session

### Testing Expansion

- Enhanced E2E test scenarios (file upload simulation, drag-and-drop testing)
- Performance testing optimization for large documents
- Accessibility testing and ARIA compliance improvements

### Enhanced Code Block Support

- **Language-specific syntax highlighting with filename support**
  - Extend markdown processing to support syntax like `\`\`\`ruby:example.rb`
  - Parse language and filename from code block headers (format: `language:filename`)
  - Display filename above code blocks in both preview and WYSIWYG modes
  - Integrate with CodeMirror's language support for additional syntax highlighting
  - Support common languages: JavaScript, TypeScript, Python, Ruby, Go, Java, C++, etc.
  - Add copy-to-clipboard functionality for code blocks with filename context
  - Maintain backward compatibility with existing `\`\`\`language` syntax

### Image Scaling and Display Control

- **Image scaling and display control** (High Priority)
  - Add image width/height controls in markdown syntax (e.g., `![alt](image.jpg){width=600px}`)
  - Implement responsive image scaling in both markdown and WYSIWYG editors
  - Show images with consistent maximum width (e.g., 600px) regardless of original size
  - Add image resize handles in WYSIWYG mode for visual resizing
  - Maintain aspect ratio during scaling operations
  - Support CSS-style dimension attributes in image tags

### Interface Accessibility Improvements

- **Expand semantic ID coverage**
  - ✅ **Basic IDs Added**: `tab-bar`, `left-pane`, `right-pane`, `markdown-editor`, `wysiwyg-editor`, `find-replace-panel`, `menu-bar`, `editor-container`, `image-uploader`, `tab-container`
  - Add IDs to menu sections: `file-menu`, `export-menu`, `insert-menu`, `view-menu`
  - Add IDs to specific buttons for automation/testing: `new-document-btn`, `save-btn`, `export-zip-btn`, etc.
  - Add IDs to status/info elements for easier access
  - Document ID naming conventions and usage patterns
  - Consider ARIA labels and accessibility attributes

### Other Advanced Editor Features

- Document outline/table of contents generation
- Advanced export formats (standalone HTML, styled PDF)

## Medium Priority

### Component Architecture Improvements

- **Refactor panes into separate UI components** (Medium Priority)
  - Extract left pane into dedicated `MarkdownEditor.vue` component
  - Extract right pane into dedicated `Preview.vue` component
  - Move WYSIWYG functionality into `Preview.vue` with mode toggle
  - Improve code organization and component reusability
  - Simplify App.vue by reducing inline complexity
  - Enable better testing of individual pane components
  - Prepare for potential layout customization features

### Image Management Interface

- Create image gallery browser for stored images
- Add image management panel (view, delete, organize stored images)
- Implement batch image operations (select multiple, bulk delete)
- Add image insertion helper with preview and alt text editing
- **Create dedicated `ImageManager.vue` component**
  - Build standalone image management interface with gallery view
  - Include image preview, metadata display, and action buttons
  - Implement batch operations (select multiple, bulk delete, export)
  - Add search/filter functionality for stored images
  - Integrate with existing image storage system
  - Provide drag-and-drop organization capabilities
- Test image upload and resize functionality across browsers

### Advanced Tab Management Features

- **Current Implementation**: Tab bar with create, switch, rename, duplicate, close, context menus, unsaved indicators, drag-and-drop reordering, overflow management
- **Remaining Features**:
  - **Tab Pinning**: Pin important tabs to prevent accidental closing
  - **Keyboard Navigation**: Tab switching shortcuts (Ctrl+Tab, Ctrl+1-9)

### Performance and Polish

- Syntax highlighting optimization for large documents
- Virtual scrolling for very large markdown files
- Performance monitoring and optimization
- Loading states and progress indicators

### Remaining Deployment Options

- **Static hosting alternatives**
  - Netlify configuration for static deployment
  - Vercel configuration with build optimizations
  - GitHub Pages deployment workflow
- **PWA capabilities** (Lower Priority)
  - Service worker implementation for offline support
  - App manifest and installable web app features

## Low Priority

### Advanced Features

- Plugin system for custom markdown extensions
- Print functionality

### Image Format and Optimization Support

- **Image format and optimization support**
  - Add support for common image formats (JPEG, PNG, WebP, GIF, SVG)
  - Implement image optimization with compression quality settings
  - Auto-convert large images to web-optimized formats
  - Provide image quality/size trade-off controls

### Advanced Workspace Features

- **Tab Groups/Workspaces**: Organize documents into named workspaces with separate tab sets
- **Session Management**: Save/restore entire workspace sessions with all open documents
- **Workspace Templates**: Predefined workspace layouts for different projects
- **Tab Search**: Fuzzy search through all open document titles and content

### Performance Optimization

- Code splitting for large markdown libraries
- Virtual scrolling for large documents
- Web Workers for heavy markdown processing

## Unresolved Concerns

### Technical Decisions Needed

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
