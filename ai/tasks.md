# Remaining Tasks

See [ai/completed_tasks.md](./completed_tasks.md) for completed features and implementations.
See [ai/concerns.md](./concerns.md) for complex technical issues and unresolved concerns.

## Medium Priority

### Enhanced E2E Test Scenarios

- **File Upload Simulation**
  - Test actual file drag-and-drop operations with real file objects
  - Implement Playwright file upload methods for input elements
  - Create realistic File objects for drag-and-drop simulation
  - Test file type validation and size limit enforcement
  - Verify file content preservation during upload process

- **Advanced Drag-and-Drop Testing**
  - Test image drag-and-drop from external applications
  - Verify drag-and-drop positioning accuracy in editor
  - Test multiple file selection and batch upload scenarios
  - Validate drag-and-drop visual feedback and cursor states

- **Cross-Document Operations Testing**
  - Test tab switching with unsaved changes
  - Verify document state preservation during tab operations
  - Test ZIP export with multiple documents and images
  - Validate document duplication and content copying

- **Image Management Integration Testing**
  - Test image gallery operations (select, delete, batch operations)
  - Verify image usage tracking across multiple documents
  - Test image insertion from gallery into different documents
  - Validate image reference updates when images are deleted

- **Keyboard Navigation Testing**
  - Test emacs-style keyboard shortcuts in various contexts
  - Verify keyboard navigation through all UI components
  - Test accessibility keyboard patterns (Tab, Arrow keys, Enter, Escape)
  - Validate focus management during modal operations

### Advanced Export Formats

- **Standalone HTML Export**
  - **Current Implementation**: HTML export opens in print dialog for immediate printing/saving
  - **Enhancement Goal**: Generate self-contained HTML files that include all embedded content
  - **Features to Implement**:
    - Embed stored images directly as base64 data URLs within the HTML file
    - Include all CSS styles inline (no external dependencies)
    - Create single-file HTML documents that work offline without any external resources
    - Support custom styling themes and typography options
    - Generate HTML files suitable for sharing, archiving, or hosting independently
  - **Difference from Current**: Current HTML export is optimized for printing; standalone HTML would be optimized for web viewing and distribution

- **Styled PDF Export**
  - **Current Implementation**: PDF export opens browser print dialog with basic formatting
  - **Enhancement Goal**: Generate professionally formatted PDF files with advanced styling
  - **Features to Implement**:
    - Custom page layouts (A4, Letter, etc.) with proper margins and headers/footers
    - Advanced typography with font selection and professional spacing
    - Table of contents generation with clickable navigation links
    - Page numbering and document metadata (title, author, creation date)
    - Print-optimized image sizing and quality settings
    - Professional document styling themes (academic, business, technical, etc.)
    - Direct PDF file generation (not browser print dialog dependent)
  - **Difference from Current**: Current PDF export relies on browser print capabilities; styled PDF would use dedicated PDF generation libraries for professional output

### Advanced Tab Management Features

- **Current Implementation**: Tab bar with create, switch, rename, duplicate, close, context menus, unsaved indicators, drag-and-drop reordering, overflow management
- **Remaining Features**:
  - **Tab Pinning**: Pin important tabs to prevent accidental closing
  - **Keyboard Navigation**: Tab switching shortcuts (Ctrl+Tab, Ctrl+1-9)

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
- Syntax highlighting optimization for large documents
- Virtual scrolling for very large markdown files
- Performance monitoring and optimization
- Loading states and progress indicators

### Remaining Deployment Options

- **Google Cloud Run Deployment**
  - GitHub Actions CI/CD pipeline integration
  - Cloud Build configuration for automated builds
  - Auto-scaling configuration with custom domain support
  - Artifact Registry for container storage
  - Production deployment scripts and documentation
- **Static hosting alternatives**
  - Netlify configuration for static deployment
  - Vercel configuration with build optimizations
  - GitHub Pages deployment workflow
- **PWA capabilities**
  - Service worker implementation for offline support
  - App manifest and installable web app features

### ARIA and Accessibility Considerations

- **ARIA Labels and Attributes**
  - Add proper ARIA labels for screen reader compatibility
  - Implement ARIA roles for custom components (tab panels, editor regions)
  - Add ARIA descriptions for complex interactive elements
  - Ensure keyboard navigation follows ARIA best practices

- **Screen Reader Support**
  - Add live regions for status updates and notifications
  - Implement proper heading hierarchy for screen readers
  - Add skip links for main content areas
  - Ensure all interactive elements are keyboard accessible

- **Focus Management**
  - Implement proper focus indicators for all interactive elements
  - Add focus trapping for modal dialogs and panels
  - Ensure logical focus order throughout the interface
  - Handle focus restoration after modal/panel closures

- **Color and Contrast**
  - Verify color contrast ratios meet WCAG guidelines
  - Ensure information is not conveyed by color alone
  - Add high contrast mode support
  - Test with various color vision deficiencies

- **Testing and Validation**
  - Accessibility testing and ARIA compliance improvements
  - Automated accessibility testing integration
  - Screen reader testing across different tools
  - Keyboard-only navigation testing
