# Development Decisions

## Technology Stack Choices

### Build Tool: Vite (Selected)
- **Chosen**: Vite 7.1.1 with Vue plugin
- **Reason**: Fast development server, excellent Vue.js integration, modern ESM-based build
- **Alternatives considered**: Webpack - rejected for complexity and slower dev server

### CSS Framework: Tailwind CSS (Selected)
- **Chosen**: Tailwind CSS 4.1.11 with PostCSS
- **Reason**: Utility-first approach, excellent for rapid prototyping, consistent design system
- **Configuration**: Used @tailwindcss/postcss plugin for compatibility
- **Alternatives considered**: Custom CSS, Bootstrap - rejected for less flexibility

### Testing Framework: Vitest (Selected)
- **Chosen**: Vitest 3.2.4 with @vue/test-utils
- **Reason**: Fast, Vite-native, excellent Vue component testing support
- **Coverage**: 80% threshold with v8 provider
- **Alternatives considered**: Jest - rejected for slower execution and Vite compatibility issues

### Code Quality Tools
- **Linter**: ESLint 9.33.0 with Vue and TypeScript support
- **Formatter**: Prettier 3.6.2 with Vue integration
- **Config**: Flat config format for ESLint (modern approach)

## Architecture Decisions

### Layout System: Flexbox (Selected)
- **Chosen**: CSS Flexbox with `flex-row` and `flex-1`
- **Reason**: CSS Grid failed to create reliable side-by-side layout, flexbox provides consistent results
- **Implementation**: `flex flex-row gap-3` container with `flex-1` panels for equal width distribution
- **Alternatives tried**: CSS Grid with `xl:grid-cols-2` - rejected for inconsistent browser behavior

### State Management: Reactive Refs (Selected)
- **Chosen**: Vue 3 Composition API with ref/computed
- **Reason**: Simple state needs, no complex state sharing required
- **Future consideration**: Pinia if state complexity grows

### Editor Framework: CodeMirror 6 (Selected)
- **Chosen**: CodeMirror 6 with Vue.js integration
- **Reason**: Professional code editor with excellent syntax highlighting, extensible architecture, and modern design
- **Implementation**: Custom Vue component with full TypeScript integration
- **Features**: Markdown syntax highlighting, emacs-style keyboard shortcuts, theme support
- **Alternatives considered**: Simple textarea (rejected for lack of syntax highlighting), Monaco Editor (rejected for bundle size and complexity)

### Keyboard Shortcuts: Emacs-style Navigation (Selected)  
- **Decision**: Implement comprehensive emacs-style keyboard shortcuts with browser default overrides
- **Rationale**: User specifically requested emacs-like behavior, including overriding Windows defaults
- **Implementation Strategy**: 
  - Used `Prec.highest()` for absolute precedence over all other keymaps
  - Added `preventDefault: true` to all custom shortcuts
  - Positioned custom keymap before CodeMirror default keymaps
- **Shortcuts Implemented**:
  - `Ctrl-a`: Move to line start (overrides "select all")
  - `Ctrl-e`: Move to line end
  - `Ctrl-b`: Move cursor left (overrides browser back)
  - `Ctrl-f`: Move cursor right (overrides browser find)  
  - `Ctrl-n`: Move to next line (preserves column position)
  - `Ctrl-p`: Move to previous line (preserves column position)
  - `Ctrl-k`: Kill to line end (with kill ring storage)
  - `Ctrl-y`: Yank killed text
  - `Ctrl-h`: Toggle Find/Replace panel
- **Kill Ring**: Implemented emacs-style kill/yank functionality for text manipulation

### Find/Replace System: Integrated Panel (Selected)
- **Decision**: Create dedicated Find/Replace component positioned below menu bar
- **Rationale**: Users expect modern search functionality with advanced options
- **UI Placement**: Below menu bar for easy access and logical information hierarchy
- **Features**: 
  - Find next/previous with result counter
  - Replace current and replace all functionality  
  - Case-sensitive and regex search options
  - Full keyboard navigation (Enter, Escape)
- **Integration**: Direct communication with CodeMirror editor state for real-time search
- **Accessibility**: Screen reader support and keyboard-only navigation

### Markdown Processing: marked.js (Selected)
- **Chosen**: marked.js v16.1.2
- **Reason**: Lightweight, fast, excellent GFM support, browser-optimized
- **Features**: Comprehensive markdown parsing with bidirectional HTML conversion
- **Alternatives considered**: markdown-it (rejected for larger bundle size), showdown (rejected for less active maintenance)

### File Operations: Browser APIs + JSZip (Selected)
- **Chosen**: Native browser FileReader, Blob, localStorage APIs + JSZip for ZIP export
- **Reason**: No external dependencies for core functionality, JSZip enables complete project export
- **Features**: 10MB file limit, dual export (MD/ZIP), structured metadata, image organization
- **ZIP Export**: Converts stored image references to local paths, organizes files in proper structure
- **Alternatives considered**: File System Access API (rejected for limited browser support)

### File Structure
- **Chosen**: Standard Vue.js structure with utilities separation
- **Components**: Separate directory for reusable components
- **Utils**: Separate utility functions (markdown.ts, fileOperations.ts) for testability
- **Types**: TypeScript definitions in dedicated directory

## Quality Assurance Decisions

### Test Coverage
- **Requirement**: 80% minimum across all metrics
- **Achieved**: 86% overall coverage
- **Strategy**: Unit tests for components and utilities, mocked dependencies

### TypeScript Configuration
- **Extends**: @vue/tsconfig for Vue-optimized settings
- **Strict**: Type checking enabled
- **Path aliases**: @ for src directory

### Content Persistence: localStorage Strategy (Selected)
- **Chosen**: Browser localStorage with structured JSON format
- **Reason**: Reliable cross-session persistence, no backend required, instant save/load
- **Implementation**: Auto-save every 30 seconds, load on startup, preserve user content across reloads
- **Data Structure**: Content + timestamp + version metadata for future compatibility
- **Fallback**: Only show welcome content for new users without saved data

### Testing Strategy: Playwright + Visual Regression Complete (Implemented)
- **Decision**: Playwright and visual regression testing as absolute first priority
- **Rationale**: With UI complete, visual consistency and E2E reliability are critical before adding features
- **Implementation Completed**: 
  - ✅ Installed and configured Playwright with cross-browser support (Chromium, Firefox, Mobile Chrome)
  - ✅ Set up screenshot-based visual regression testing with baseline management
  - ✅ Created comprehensive test suite structure with 5 test files covering all functionality
  - ✅ Implemented comprehensive test cases across desktop and mobile browsers
  - ✅ Added data-testid attributes for reliable element selection
  - ✅ Created CI/CD ready configuration with automatic dev server startup
  - ✅ Fixed dual editor layout compatibility and CodeMirror integration
  - ✅ Established Find/Replace E2E test coverage
  - ✅ Updated visual regression baselines for current UI
- **Results**: Complete E2E test coverage preventing regressions, visual consistency protection, performance monitoring
- **Browser Support Decision**: Limited to Chromium and Firefox for practical testing efficiency (WebKit/Safari not required)

### UI Architecture: Menu Bar + Information Pane + Dual Editors (Selected)
- **Decision**: Organized controls into menu bar with logical grouping, Information Pane, and always-visible dual editors
- **Menu Structure**: File, Export, Insert, View groups for intuitive navigation
- **Information Pane**: Real-time statistics (Words, Characters, Lines) and save status in header with compact spacing
- **Dual Editor Layout**: Always-visible Markdown (left) and WYSIWYG (right) editors with bidirectional sync
- **Composables**: useResizablePanes, useDragAndDrop for reusable logic
- **Responsive Strategy**: Mobile-first with `hidden sm:inline` labels and flexible wrapping
- **Full-Screen Mode Removed**: Replaced with WYSIWYG pane toggle for better user workflow

### WYSIWYG Integration: Dual Editor Architecture (Selected)
- **Decision**: Merge WYSIWYG capability with preview pane for simultaneous editing
- **Rationale**: User requested dual editors with bidirectional synchronization
- **Implementation**: 
  - Left pane: Always-visible CodeMirror markdown editor
  - Right pane: Always-visible WYSIWYG contenteditable with prose styling
  - Single source of truth: `markdownContent` ref with bidirectional sync
  - Sync protection: `isUpdatingWysiwyg` flag prevents circular updates
  - Focus-aware updates: WYSIWYG only updates when not actively being edited
- **Image Reference Preservation**: Enhanced HTML/Markdown conversion with stored image tracking
- **Benefits**: Real-time dual editing, better workflow than toggle-based WYSIWYG

### Information Pane: Header Integration (Selected)
- **Decision**: Move statistics and save status from footer to header Information Pane
- **Rationale**: Better space utilization, consistent with modern UI patterns
- **Implementation**: Right-aligned in menu bar with compact spacing (8px/16px/6px)
- **Content**: Words, Characters, Lines, Last Saved timestamp, Save status
- **Status Bar Removed**: Footer eliminated in favor of header integration

### Image Insertion: Cursor-Based Placement (Selected)
- **Decision**: Insert images at cursor position instead of appending to end
- **Implementation**: Use CodeMirror's `getSelection()` and `insertText()` methods
- **Benefits**: More intuitive editing experience, precise image placement
- **Fallback**: Append to end if CodeMirror ref unavailable

### HTML to Markdown List Conversion: Recursive Processing (Selected)
- **Decision**: Implement custom recursive list conversion function for enhanced bidirectional WYSIWYG sync
- **Problem**: User reported that editing list items in WYSIWYG mode caused markdown to lose list notation ("-")
- **Root Cause**: Simple regex replacement in `convertHtmlToMarkdown()` couldn't handle nested lists properly
- **Solution**: Created `convertListContent()` helper function with recursive processing
- **Implementation**:
  - Processes `<ul>` and `<ol>` elements with nested content support
  - Maintains proper indentation (2 spaces per nesting level)
  - Preserves different list markers: `-` for unordered, numbered for ordered
  - Handles mixed nested lists with correct markdown syntax
  - Processes `<li>` elements recursively to handle nested structures
- **Benefits**: 
  - Preserves list structure during WYSIWYG editing
  - Supports complex nested list scenarios
  - Maintains markdown list notation integrity
  - Provides consistent indentation formatting
- **Alternative Considered**: Using turndown.js library - rejected to minimize dependencies and maintain control over conversion logic

### Viewport Height Management: Constrained Layout (Selected)
- **Decision**: Limit editor panes to viewport height to prevent infinite vertical expansion
- **Implementation**: 
  - Container: `h-[calc(100vh-200px)]` with `min-h-[400px]` and `max-h-[calc(100vh-150px)]`
  - Panes: `h-full` within constrained container instead of unlimited expansion
- **Benefits**: Prevents UI overflow, maintains professional layout for long documents
- **User Experience**: Content scrolls within panes rather than expanding entire interface

### Scroll Synchronization: Percentage-Based (Selected)  
- **Decision**: Implement bidirectional scroll synchronization between dual editors
- **Algorithm**: Calculate scroll percentage and apply proportionally to other editor
- **Loop Prevention**: `isSyncingScroll` flag with 50ms timeout to prevent circular updates
- **Benefits**: Maintains visual correspondence between markdown and WYSIWYG content

### Multiple Document System: Tab-Based Architecture (Selected)
- **Decision**: Implement complete multiple document management with tabbed interface
- **Implementation Strategy**:
  - **useDocuments Composable**: Central state management with reactive document array
  - **TabBar Component**: Visual tab interface with create, switch, duplicate, close operations
  - **Document State**: ID-based system with title, content, timestamps, unsaved flags
  - **Persistence**: localStorage integration with active document tracking
  - **ZIP Export Enhancement**: Export all documents with organized file structure
- **Benefits**:
  - Multiple document workflow support for complex projects
  - Seamless document switching with preserved state
  - Professional tab interface with visual indicators
  - Complete project export with all documents and images
- **Design Choices**:
  - Document numbering: "Document 1", "Document 2", etc. with automatic increment
  - Welcome document: Pre-populated for new users with feature overview
  - Safe filename generation: Convert titles to filesystem-safe names for export
  - Unsaved change tracking: Visual indicators and confirmation dialogs

### Development Workflow
- **Scripts**: Comprehensive npm scripts for all operations
- **Hot reload**: Vite dev server for fast development
- **Build**: Production-ready with type checking

## Rejected Approaches

### Server-Side Rendering
- **Rejected**: SSR/SSG frameworks like Nuxt
- **Reason**: Project explicitly requires browser-only operation

### Component Libraries
- **Rejected**: Vuetify, Quasar, Element Plus
- **Reason**: Tailwind provides sufficient styling flexibility without component lock-in

### Complex State Management
- **Rejected**: Vuex, Pinia (for now)
- **Reason**: Simple state requirements don't justify complexity