# Software Architecture

## Technology Stack

### Core Framework
- **Vue.js 3.5.18** - Modern reactive UI framework with Composition API
- **TypeScript 5.9.2** - Type-safe JavaScript development
- **Vite 7.1.1** - Fast build tool and dev server

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
│   ├── CodeMirrorEditor.vue # Professional code editor with emacs-style shortcuts
│   ├── FindReplace.vue   # Find/Replace UI with regex and case-sensitive support
│   └── ImageUploader.vue # Drag-and-drop image upload component
├── composables/          # Vue composables for shared logic
│   ├── useDarkMode.ts    # Theme management (future feature)
│   ├── useDragAndDrop.ts # File drag-and-drop functionality
│   └── useResizablePanes.ts # Split pane resizing logic
├── utils/                # Utility functions
│   ├── fileOperations.ts # Import/export, localStorage, ZIP creation
│   ├── imageOperations.ts # Image processing, storage, markdown generation
│   └── markdown.ts       # Markdown/HTML conversion with image references
├── App.vue              # Main application component with menu bar and layout
├── main.ts              # Application entry point
└── style.css            # Global styles and Tailwind imports
```

## Application Architecture

### Core Features
1. **Menu Bar Interface** - Professional controls organized in logical groups (File, Export, Insert, View)
2. **Find/Replace System** - Advanced search functionality with regex, case-sensitive options, and keyboard shortcuts
3. **CodeMirror Editor** - Professional code editor with syntax highlighting and emacs-style navigation
4. **Side-by-Side Layout** - Editor on left, preview on right with resizable panes and responsive design
5. **Full-Screen Mode** - Distraction-free writing with header/status bar hiding and editor focus
6. **Resizable Panes** - Drag-to-resize functionality between editor and preview with 20%-80% constraints
7. **Image Upload System** - Complete image management with drag-and-drop, resizing, and browser storage
8. **Preview Mode** - Real-time HTML preview of markdown content with toggle visibility
9. **WYSIWYG Mode** - Rich text editor with bidirectional HTML↔Markdown conversion
10. **File Operations** - Import, export (MD/ZIP), save/load, and document management
11. **Status Bar** - Real-time word/character/line count and save status
12. **Auto-save & Persistence** - Background saving every 30 seconds + content preservation across reloads
13. **Responsive Design** - Mobile/tablet optimization with adaptive menu wrapping

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
- **Bidirectional**: HTML ↔ Markdown conversion for WYSIWYG mode
- **Error Handling**: Graceful fallbacks for parsing errors

### Layout Architecture
- **Flexbox System**: Flexbox layout with `flex-row` for reliable side-by-side positioning
- **Panel Design**: Editor and preview panels with proper frames, borders, and shadows using `flex-1` for equal width
- **Headers**: Each panel has a titled header with appropriately sized SVG icons (w-4 h-4)
- **Responsive**: Flexible layout that adapts to container width with proper gap spacing
- **Visual Feedback**: Preview panel shows "hidden" state when toggled off with subtle gray styling

### File Operations System
- **Import**: Browser FileReader API for .md/.markdown files (10MB limit)
- **Export**: Dual export system - individual MD files and complete ZIP packages
- **ZIP Export**: JSZip integration for exporting markdown + all stored images as organized project
- **Save/Load**: localStorage with JSON structure and metadata for content persistence
- **Auto-save**: Automatic background saving every 30 seconds with content preservation across reloads
- **Validation**: File type and size validation with user feedback

### Data Flow
- Reactive `markdownContent` ref stores the markdown source
- Computed `renderedHtml` uses marked.js to convert markdown to HTML
- Computed `stats` provides real-time content analysis (words/characters/lines)
- WYSIWYG mode provides bidirectional HTML-to-markdown conversion
- Toggle states control UI visibility and editing modes
- File operations update content with status feedback

### Vue Composables Architecture
- **useDragAndDrop**: Handles file drag-and-drop functionality with type validation
- **useResizablePanes**: Manages split pane resizing with mouse event handling and constraints
- **useDarkMode**: Theme management with persistent preferences and system detection (ready for future)

### User Interface Architecture
- **Menu Bar**: Logical grouping of controls with responsive behavior
  - File Menu: New, Import, Save, Load operations
  - Export Menu: MD and ZIP export options
  - Insert Menu: Image upload functionality  
  - View Menu: Find/Replace toggle, full-screen mode, and display options
- **Responsive Design**: Mobile-first with `hidden sm:inline` labels and flexible menu wrapping
- **Full-Screen Mode**: Complete UI hiding with editor focus and red exit button
- **Visual Feedback**: Hover states, loading indicators, and status messaging

### Storage Strategy
- **In-Memory**: Reactive refs for current document state
- **Persistent**: localStorage with structured metadata (content, timestamp, version)
- **Import/Export**: Browser APIs for file operations
- **No Backend**: Complete client-side operation

## Build and Development Commands

```bash
npm run dev          # Start development server
npm run build        # Production build with type checking
npm run preview      # Preview production build
npm run test         # Run unit tests
npm run test:coverage # Run tests with coverage report (80% threshold)
npm run lint         # Lint and fix code issues
npm run format       # Format code with Prettier
```

## Quality Standards

### Testing Strategy
- **Unit Testing**: Vitest with Vue Test Utils for component isolation (69 tests passing)
- **Test Coverage**: Minimum 80% target maintained (branches, functions, lines, statements)
- **E2E Testing**: Complete Playwright implementation with cross-browser testing (Chrome, Firefox)
- **Visual Regression**: Screenshot-based UI consistency testing with baseline management
- **Performance Testing**: Large document handling, memory management, and UI responsiveness
- **Accessibility Testing**: Keyboard navigation and focus management (partial implementation)

### Code Quality
- **Code Style**: ESLint + Prettier for consistent formatting
- **Type Safety**: Strict TypeScript configuration with Vue 3 support
- **Component Architecture**: Composables pattern for reusable logic
- **Error Handling**: Comprehensive error boundaries and user feedback