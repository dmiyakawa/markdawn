# Software Architecture

## Technology Stack

### Core Framework
- **Vue.js 3.5.18** - Modern reactive UI framework with Composition API
- **TypeScript 5.9.2** - Type-safe JavaScript development
- **Vite 7.1.1** - Fast build tool and dev server

## Component Architecture (Updated December 2024)

### Architectural Decision: Component Extraction
The application has been successfully refactored from a monolithic App.vue structure into a clean component-based architecture:

#### Extracted Components:
- **MarkdownEditor.vue** - Encapsulates left pane with CodeMirror integration
- **Preview.vue** - Handles right pane with WYSIWYG functionality and mode toggling  
- **ImageManager.vue** - Complete gallery browser with batch operations and search/filter

#### Benefits Achieved:
- **Improved Testability** - Each component can be tested in isolation with comprehensive test coverage
- **Better Code Organization** - Clear separation of concerns and responsibilities
- **Enhanced Maintainability** - Easier to modify individual features without affecting others
- **Simplified App.vue** - Reduced from complex inline logic to clean component orchestration

### Editor Framework
- **CodeMirror 6** - Professional code editor with syntax highlighting
  - `codemirror@6.0.2` - Core editor framework
  - `@codemirror/lang-markdown@6.3.4` - Markdown syntax highlighting
  - `@codemirror/commands@6.8.1` - Editor commands and key bindings
  - `@codemirror/state@6.5.2` - Editor state management
  - `@codemirror/view@6.38.1` - Editor view layer and theming
  - `@codemirror/theme-one-dark@6.1.3` - Dark theme support

### Styling
- **Tailwind CSS 4.1.11** - Utility-first CSS framework
- **PostCSS 8.5.6** - CSS processing with Autoprefixer

### Development Tools
- **ESLint 9.33.0** - Code linting with Vue and TypeScript support
- **Prettier 3.6.2** - Code formatting
- **Vitest 3.2.4** - Unit testing framework with 80% coverage requirement
- **@vue/test-utils 2.4.6** - Vue component testing utilities

## Project Structure

```
src/
├── components/           # Reusable Vue components
│   ├── CodeMirrorEditor.vue     # Professional code editor with emacs-style shortcuts
│   ├── FindReplace.vue          # Find/Replace UI with regex and case-sensitive support
│   ├── ImageUploader.vue        # Drag-and-drop image upload component
│   ├── ImageManager.vue         # Image gallery with usage tracking and deletion warnings
│   ├── MarkdownEditor.vue       # Left pane editor with integrated document statistics
│   ├── Preview.vue              # Right pane preview/WYSIWYG with inline edit toggle
│   └── TabBar.vue              # Document tabs with integrated save status information
├── composables/          # Vue composables for shared logic
│   ├── useDarkMode.ts           # Theme management (future feature)
│   ├── useDocuments.ts          # Multiple document state management
│   ├── useDragAndDrop.ts        # File drag-and-drop functionality
│   └── useResizablePanes.ts     # Split pane resizing logic
├── types/                # TypeScript type definitions
│   └── document.ts              # Document and DocumentState interfaces
├── utils/                # Utility functions
│   ├── fileOperations.ts        # Import/export, localStorage, ZIP creation
│   ├── imageOperations.ts       # Image processing, storage, usage tracking, markdown generation
│   └── markdown.ts              # Markdown/HTML conversion with image references
├── stores/               # State stores (empty - using composables pattern)
├── App.vue              # Main application component with menu bar and layout
├── main.ts              # Application entry point
└── style.css            # Global styles and Tailwind imports
```

**Test Structure:**
```
tests/
├── e2e/                  # End-to-end tests with Playwright
│   ├── core-flows.spec.ts       # Core user workflows
│   ├── find-replace.spec.ts     # Find/Replace functionality
│   ├── image-upload.spec.ts     # Image upload and management
│   ├── performance.spec.ts      # Performance testing
│   └── visual-regression.spec.ts # Visual regression testing
├── image-preservation.test.ts   # Image reference preservation
└── search-integration.test.ts   # Search system integration
```

## Application Architecture

### Core Features
1. **Menu Bar Interface** - Professional controls organized in logical groups (File, Export, Insert, View) with streamlined header
2. **Integrated Information Display** - Document statistics in MarkdownEditor header, save status in TabBar
3. **Multiple Document Tabs** - Complete tab system with integrated save status and document management
4. **Find/Replace System** - Advanced search functionality with regex, case-sensitive options, and keyboard shortcuts
5. **Dual Editor Layout** - Markdown editor (left) and WYSIWYG editor (right) with simultaneous editing
6. **CodeMirror Editor** - Professional code editor with syntax highlighting and emacs-style navigation
7. **WYSIWYG Editor** - Rich text editor with bidirectional HTML↔Markdown sync and real-time updates
8. **Resizable Panes** - Drag-to-resize functionality between editors with 20%-80% constraints
9. **Preview Toggle** - Hide/Show WYSIWYG pane to expand markdown editor to full width
10. **Image Management System** - Complete image operations with usage tracking, deletion protection, cursor-based insertion, and drag-and-drop
11. **File Operations** - Import, export (MD/ZIP), save/load, and document management with multi-document support
12. **Auto-save & Persistence** - Background saving every 30 seconds + content preservation across reloads
13. **Responsive Design** - Mobile/tablet optimization with adaptive menu wrapping
14. **Scroll Synchronization** - Bidirectional scroll sync between editors with percentage-based positioning
15. **Viewport Height Management** - Editors constrained to viewport bounds preventing infinite vertical expansion

### CodeMirror Editor System
- **Framework**: CodeMirror 6 with Vue.js integration
- **Syntax Highlighting**: Markdown language support with professional highlighting
- **Emacs-style Keyboard Shortcuts**: Complete navigation and editing commands
  - `Ctrl-a`: Move to line start (overrides browser "select all")
  - `Ctrl-e`: Move to line end
  - `Ctrl-b`: Move cursor left one character (overrides browser back)
  - `Ctrl-f`: Move cursor right one character (overrides browser find)
  - `Ctrl-n`: Move to next line (preserves column position)
  - `Ctrl-p`: Move to previous line (preserves column position)
  - `Ctrl-k`: Kill from cursor to line end (stores in kill ring)
  - `Ctrl-y`: Yank (paste) killed text
  - `Ctrl-h`: Toggle Find/Replace panel
- **Precedence System**: Uses `Prec.highest()` to ensure shortcuts override browser defaults
- **Kill Ring**: Emacs-style text storage for kill/yank operations
- **Theme Support**: Monospace font with consistent styling and dark mode ready

### Find/Replace System
- **UI Location**: Positioned below menu bar for easy access
- **Features**: 
  - Find next/previous navigation with result counter
  - Replace current match and replace all functionality
  - Case-sensitive search toggle
  - Regular expression support toggle
  - Keyboard shortcuts (Enter for next, Escape to close)
- **Integration**: Direct communication with CodeMirror editor state
- **Accessibility**: Full keyboard navigation and screen reader support

### Markdown Processing
- **Library**: marked.js v16.1.2 for robust markdown parsing
- **Features**: GitHub Flavored Markdown with comprehensive feature support
- **Bidirectional**: HTML ↔ Markdown conversion for WYSIWYG mode with enhanced list support
- **List Conversion**: Recursive list processing supporting nested ul/ol with proper indentation and markers
- **Error Handling**: Graceful fallbacks for parsing errors

### Layout Architecture
- **Flexbox System**: Flexbox layout with `flex-row` for reliable side-by-side positioning
- **Panel Design**: Editor and preview panels with proper frames, borders, and shadows using `flex-1` for equal width
- **Headers**: Each panel has a titled header with appropriately sized SVG icons (w-4 h-4)
- **Viewport Constraints**: Container height limited to `calc(100vh-200px)` with `min-h-[400px]` and `max-h-[calc(100vh-150px)]`
- **Responsive**: Flexible layout that adapts to container width with proper gap spacing and viewport height management
- **Visual Feedback**: Preview panel shows "hidden" state when toggled off with subtle gray styling
- **Scroll Management**: Both editors constrained to viewport bounds with internal scrolling for long documents

### File Operations System
- **Import**: Browser FileReader API for .md/.markdown files (10MB limit)
- **Export**: Dual export system - individual MD files and complete ZIP packages
- **ZIP Export**: JSZip integration for exporting markdown + all stored images as organized project
- **Save/Load**: localStorage with JSON structure and metadata for content persistence
- **Auto-save**: Automatic background saving every 30 seconds with content preservation across reloads
- **Validation**: File type and size validation with user feedback

### Data Flow
- **Document Management**: `useDocuments()` composable manages multiple documents with reactive state
  - Global `documentState` with documents array, active document ID, and document numbering
  - Automatic localStorage persistence with structured JSON format
  - Document lifecycle: create, update, switch, duplicate, close operations
- **Single Source of Truth**: Active document's `content` property stores markdown source
- **Dual Editor Synchronization**:
  - Markdown Editor: Updates active document content directly via CodeMirror
  - WYSIWYG Editor: Converts HTML to markdown and updates active document content
  - Bidirectional sync prevents circular updates with `isUpdatingWysiwyg` flag
- **Real-time Processing**:
  - HTML conversion: `convertMarkdownToHtml()` with stored image reference preservation
  - Enhanced HTML to Markdown: `convertListContent()` with recursive list processing
  - Statistics: Computed `stats` provides real-time analysis (words/characters/lines)
- **Document Persistence**:
  - Auto-save: Documents saved to localStorage every 30 seconds
  - State persistence: Active document ID and document list preserved across reloads
  - Content preservation: Unsaved changes tracked with `isUnsaved` flag
- **Image Integration**: Cursor-based insertion with stored image reference system
- **UI State**: Toggle states control WYSIWYG pane visibility and tab management

### Vue Composables Architecture
- **useDocuments**: Central document management with reactive state and persistence
  - Multiple document lifecycle (create, update, switch, close, duplicate)
  - Auto-save and localStorage integration
  - Document numbering and title management
  - Active document tracking and unsaved changes
- **useDragAndDrop**: Handles file drag-and-drop functionality with type validation
- **useResizablePanes**: Manages split pane resizing with mouse event handling and constraints
- **useDarkMode**: Theme management with persistent preferences and system detection (ready for future)

### User Interface Architecture
- **Tab System**: Document tab management with integrated save status display
  - Create, switch, duplicate, and close document tabs
  - Visual indicators for unsaved changes and active document
  - Context menus and tab operations
  - Integrated save timestamp and status messages next to "New document" button
- **Menu Bar**: Streamlined controls with logical grouping and responsive behavior
  - File Menu: New, Import, Save, Load operations
  - Export Menu: MD and ZIP export options (supports all documents)
  - Insert Menu: Image upload and gallery management functionality  
  - View Menu: Find/Replace toggle and WYSIWYG pane visibility toggle
  - Clean header design with information moved to contextual locations
- **Dual Editor Layout**: Markdown editor (left) with integrated statistics and WYSIWYG editor (right) with inline edit toggle
  - MarkdownEditor: Document statistics (Lines, Words, Chars) next to title
  - Preview: Edit/Preview toggle button positioned next to pane title
- **Image Management**: Comprehensive gallery system with usage tracking and deletion protection
  - Visual usage indicators showing reference counts across documents
  - Detailed deletion warnings preventing accidental removal of used images
  - Multi-select operations with batch usage analysis
- **Find/Replace Panel**: Positioned below menu bar with comprehensive search options
- **Contextual Information Placement**: All UI information positioned near related functionality
- **Responsive Design**: Mobile-first with `hidden sm:inline` labels and flexible menu wrapping

### Storage Strategy
- **In-Memory**: Reactive document state with multiple documents array and active document tracking
- **Persistent Document Storage**: localStorage with structured document metadata
  - Documents stored as array with ID, title, content, timestamps, and unsaved flags
  - Active document ID persisted separately for session continuity
  - Automatic document numbering and title management
- **Image Storage**: Separate localStorage entries for stored images with reference system
- **Import/Export**: Browser APIs for file operations with multi-document ZIP support
- **No Backend**: Complete client-side operation with offline capability

## Build and Development Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Production build with type checking
npm run preview      # Preview production build

# Testing
npm run test         # Run unit tests
npm run test:coverage # Run tests with coverage report (80% threshold)
npm run test:e2e     # Run E2E tests with Playwright
npm run test:e2e:headed # Run E2E tests with browser visible
npm run test:e2e:update # Update visual regression baselines

# Code Quality
npm run lint         # Lint and fix code issues
npm run format       # Format code with Prettier
```

## Quality Standards

### Testing Strategy
- **Unit Testing**: Vitest with Vue Test Utils for component isolation
- **Test Coverage**: Minimum 80% target maintained (branches, functions, lines, statements)
- **E2E Testing**: Complete Playwright implementation with cross-browser testing (Chromium, Firefox, Mobile Chrome)
- **Visual Regression**: Screenshot-based UI consistency testing with baseline management
- **Performance Testing**: Large document handling, memory management, and UI responsiveness
- **Integration Testing**: Image reference preservation, search system integration
- **Component Testing**: Comprehensive mocking strategy for CodeMirror dependencies
- **Accessibility Testing**: Keyboard navigation and focus management (partial implementation)

### Code Quality
- **Code Style**: ESLint + Prettier for consistent formatting
- **Type Safety**: Strict TypeScript configuration with Vue 3 support
- **Component Architecture**: Composables pattern for reusable logic
- **Error Handling**: Comprehensive error boundaries and user feedback