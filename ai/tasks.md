# Remaining Tasks

## High Priority - Next Session

### Advanced Editor Features
- Undo/redo functionality with command history (basic CodeMirror history enabled)

### Additional Testing Expansion  
- **Fix E2E test issues with Playwright test runner** (current high priority)
- **Update E2E tests to work with dual editor layout and CodeMirror selectors**
- Enhanced performance testing scenarios
- Accessibility testing and ARIA compliance improvements
- Advanced E2E test scenarios (file upload, drag-and-drop simulation)

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

### Image Management Features
- **Create dedicated `ImageManager.vue` component** (Medium Priority)
  - Build standalone image management interface with gallery view
  - Include image preview, metadata display, and action buttons
  - Implement batch operations (select multiple, bulk delete, export)
  - Add search/filter functionality for stored images
  - Integrate with existing image storage system
  - Provide drag-and-drop organization capabilities
- Create image management interface (view, delete stored images)
- Add image gallery browser for stored images
- Implement batch image operations (delete multiple, export)
- Test image upload and resize functionality across browsers

### Image Enhancement Features
- **Image scaling and display control** (Medium Priority)
  - Add image width/height controls in markdown syntax (e.g., `![alt](image.jpg){width=600px}`)
  - Implement responsive image scaling in both markdown and WYSIWYG editors
  - Show images with consistent maximum width (e.g., 600px) regardless of original size
  - Add image resize handles in WYSIWYG mode for visual resizing
  - Maintain aspect ratio during scaling operations
  - Support CSS-style dimension attributes in image tags
- **Image format and optimization support**
  - Add support for common image formats (JPEG, PNG, WebP, GIF, SVG)
  - Implement image optimization with compression quality settings
  - Auto-convert large images to web-optimized formats
  - Provide image quality/size trade-off controls

### Performance and Polish
- Syntax highlighting optimization for large documents  
- Virtual scrolling for very large markdown files
- Performance monitoring and optimization
- Loading states and progress indicators

### Deployment Options
- **Docker and containerization** (Higher Priority)
  - Create Dockerfile for production builds
  - Add Docker Compose configuration for local development
  - Multi-stage builds for optimized production images
  - Environment configuration and secrets management
- **Google Cloud Run deployment** (Higher Priority)
  - Cloud Build integration for automated CI/CD
  - Artifact Registry for container image storage
  - Cloud Run service configuration with auto-scaling
  - Custom domain and SSL certificate setup
- **Static hosting alternatives** (Lower Priority)
  - Netlify configuration for static deployment
  - Vercel configuration with build optimizations
  - GitHub Pages deployment workflow
- **PWA capabilities** (Lower Priority)
  - Service worker implementation for offline support
  - App manifest and installable web app features

## Low Priority - Future Considerations

### Advanced Features
- Plugin system for custom markdown extensions
- Document outline/table of contents
- Print functionality
- PDF export

### Performance Optimization
- Code splitting for large markdown libraries
- Virtual scrolling for large documents
- Web Workers for heavy markdown processing

## Completed Tasks

See [ai/completed_tasks.md](./completed_tasks.md) for detailed record of all completed features and implementations.

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