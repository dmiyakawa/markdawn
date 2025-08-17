# Development Decisions

## Project Overview and Requirements

### Application Type: Browser-Based Markdown Editor
- **Decision**: Create a web application that runs entirely in browsers without backend server dependencies
- **Rationale**: User explicitly requested a standalone web application accessible via URL without server infrastructure requirements
- **Data Storage**: All information including uploaded files stored in browser storage (localStorage) rather than external servers
- **Deployment Flexibility**: Users can download or export created documents, but no server-side data persistence

### Core Functionality Requirements
- **Dual Editing Modes**: 
  - HTML preview functionality for viewing rendered markdown
  - WYSIWYG editor functionality for rich text editing
  - Toggle capability to enable/disable each mode as needed
- **Editing Workflows**:
  - Write markdown while previewing HTML output
  - Edit content in WYSIWYG mode while viewing corresponding markdown syntax
- **File Operations**: Support for importing, exporting, and managing documents entirely client-side

### Deployment Strategy
- **Local Development**: WSL/Linux environment on development machines
- **IaaS Deployment**: Internet-accessible Linux servers with Apache2 web server
- **Static Hosting**: No server-side processing required, compatible with static hosting solutions

### Quality Requirements
- **Test Coverage**: Minimum 80% code coverage maintained throughout development
- **Code Quality**: Consistent code formatting and linting standards enforced
- **Documentation**: AI-assisted development workflow with structured documentation system

## Development, Build, and Deployment Tools

### Build Tool: Vite
- **Decision**: Vite 7.1.1 with Vue plugin
- **Reason**: Fast development server, excellent Vue.js integration, modern ESM-based build
- **Alternatives considered**: Webpack - rejected for complexity and slower dev server

### Development Workflow
- **Scripts**: Comprehensive npm scripts for all operations
- **Hot reload**: Vite dev server for fast development
- **Build**: Production-ready with type checking

## Core Languages and Frameworks

### Primary Language: TypeScript
- **Decision**: TypeScript 5.9.2 for type-safe JavaScript development
- **Configuration**: Strict type checking enabled, @vue/tsconfig for Vue-optimized settings
- **Path aliases**: @ for src directory

### UI Framework: Vue.js
- **Decision**: Vue.js 3.5.18 with Composition API
- **Reason**: Modern reactive UI framework with excellent TypeScript integration
- **State Management**: Vue 3 Composition API with ref/computed instead of complex state stores
- **Future consideration**: Pinia if state complexity grows

### Styling Framework: Tailwind CSS
- **Decision**: Tailwind CSS 4.1.11 with PostCSS
- **Reason**: Utility-first approach, excellent for rapid prototyping, consistent design system
- **Configuration**: Used @tailwindcss/postcss plugin for compatibility
- **Alternatives considered**: Custom CSS, Bootstrap - rejected for less flexibility

## Specialized Libraries and Capabilities

### Code Editor: CodeMirror 6
- **Decision**: CodeMirror 6 with Vue.js integration
- **Reason**: Professional code editor with excellent syntax highlighting, extensible architecture, and modern design
- **Implementation**: Custom Vue component with full TypeScript integration
- **Features**: Markdown syntax highlighting, emacs-style keyboard shortcuts, theme support
- **Alternatives considered**: Simple textarea (rejected for lack of syntax highlighting), Monaco Editor (rejected for bundle size and complexity)

### Markdown Processing: marked.js
- **Decision**: marked.js v16.1.2
- **Reason**: Lightweight, fast, excellent GFM support, browser-optimized
- **Features**: Comprehensive markdown parsing with bidirectional HTML conversion
- **Alternatives considered**: markdown-it (rejected for larger bundle size), showdown (rejected for less active maintenance)

### File Operations: Browser APIs + JSZip
- **Decision**: Native browser FileReader, Blob, localStorage APIs + JSZip for ZIP export
- **Reason**: No external dependencies for core functionality, JSZip enables complete project export
- **Features**: 10MB file limit, dual export (MD/ZIP), structured metadata, image organization
- **ZIP Export**: Converts stored image references to local paths, organizes files in proper structure
- **Alternatives considered**: File System Access API (rejected for limited browser support)

### Storage Strategy: localStorage
- **Decision**: Browser localStorage with structured JSON format
- **Reason**: Reliable cross-session persistence, no backend required, instant save/load
- **Implementation**: Auto-save every 30 seconds, load on startup, preserve user content across reloads
- **Data Structure**: Content + timestamp + version metadata for future compatibility
- **Fallback**: Only show welcome content for new users without saved data

## Testing Strategy

### Unit Testing: Vitest
- **Decision**: Vitest 3.2.4 with @vue/test-utils
- **Reason**: Fast, Vite-native, excellent Vue component testing support
- **Coverage**: 80% minimum threshold with v8 provider
- **Alternatives considered**: Jest - rejected for slower execution and Vite compatibility issues

### Integration Testing: Component Mocking
- **Decision**: Use Vue Test Utils with extensive component mocking for App.vue integration tests
- **Reason**: JSDOM has fundamental compatibility issues with complex Vue 3 component trees
- **Approach**: 
  - Mock all child components (MarkdownEditor, Preview, ImageManager, etc.)
  - Use shallow mounting to avoid deep component rendering
  - Focus on testing App.vue's coordination logic rather than full integration
- **Alternative rejected**: Full component mounting - caused insertBefore/DOM manipulation errors in JSDOM

### End-to-End Testing: Playwright
- **Decision**: Playwright and visual regression testing
- **Rationale**: Visual consistency and E2E reliability are critical for UI-heavy applications
- **Implementation Strategy**: Playwright for cross-browser support (Chromium, Firefox, Mobile Chrome), screenshot-based visual regression testing, comprehensive test suite structure, data-testid attributes for reliable element selection
- **Browser Support Decision**: Limited to Chromium and Firefox for practical testing efficiency (WebKit/Safari not required)

### Test Coverage Philosophy: Functional Over Metric
- **Decision**: Prioritize comprehensive functional testing while maintaining 80% minimum coverage requirement
- **Reason**: Coverage tools don't always properly account for component-specific test files
- **Approach**: Each component has dedicated test file with comprehensive test scenarios

### Code Quality Tools
- **Linter**: ESLint 9.33.0 with Vue and TypeScript support
- **Formatter**: Prettier 3.6.2 with Vue integration
- **Config**: Flat config format for ESLint (modern approach)

## Application Architecture Decisions

### Layout System: Flexbox
- **Decision**: CSS Flexbox with `flex-row` and `flex-1`
- **Reason**: CSS Grid failed to create reliable side-by-side layout, flexbox provides consistent results
- **Implementation**: `flex flex-row gap-3` container with `flex-1` panels for equal width distribution
- **Alternatives tried**: CSS Grid with `xl:grid-cols-2` - rejected for inconsistent browser behavior

### File Structure
- **Decision**: Standard Vue.js structure with utilities separation
- **Components**: Separate directory for reusable components
- **Utils**: Separate utility functions (markdown.ts, fileOperations.ts) for testability
- **Types**: TypeScript definitions in dedicated directory

### Keyboard Shortcuts: Emacs-style Navigation
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

### Find/Replace System: Integrated Panel
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

### UI Architecture: Menu Bar + Information Pane + Dual Editors
- **Decision**: Organized controls into menu bar with logical grouping, Information Pane, and always-visible dual editors
- **Menu Structure**: File, Export, Insert, View groups for intuitive navigation
- **Information Pane**: Real-time statistics (Words, Characters, Lines) and save status in header with compact spacing
- **Dual Editor Layout**: Always-visible Markdown (left) and WYSIWYG (right) editors with bidirectional sync
- **Composables**: useResizablePanes, useDragAndDrop for reusable logic
- **Responsive Strategy**: Mobile-first with `hidden sm:inline` labels and flexible wrapping
- **Full-Screen Mode Removed**: Replaced with WYSIWYG pane toggle for better user workflow

### WYSIWYG Integration: Dual Editor Architecture
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

### Information Pane: Header Integration
- **Decision**: Move statistics and save status from footer to header Information Pane
- **Rationale**: Better space utilization, consistent with modern UI patterns
- **Implementation**: Right-aligned in menu bar with compact spacing (8px/16px/6px)
- **Content**: Words, Characters, Lines, Last Saved timestamp, Save status
- **Status Bar Removed**: Footer eliminated in favor of header integration

### Image Insertion: Cursor-Based Placement
- **Decision**: Insert images at cursor position instead of appending to end
- **Implementation**: Use CodeMirror's `getSelection()` and `insertText()` methods
- **Benefits**: More intuitive editing experience, precise image placement
- **Fallback**: Append to end if CodeMirror ref unavailable

### HTML to Markdown List Conversion: Recursive Processing
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

### Viewport Height Management: Constrained Layout
- **Decision**: Limit editor panes to viewport height to prevent infinite vertical expansion
- **Implementation**: 
  - Container: `h-[calc(100vh-200px)]` with `min-h-[400px]` and `max-h-[calc(100vh-150px)]`
  - Panes: `h-full` within constrained container instead of unlimited expansion
- **Benefits**: Prevents UI overflow, maintains professional layout for long documents
- **User Experience**: Content scrolls within panes rather than expanding entire interface

### Scroll Synchronization: Percentage-Based
- **Decision**: Implement bidirectional scroll synchronization between dual editors
- **Algorithm**: Calculate scroll percentage and apply proportionally to other editor
- **Loop Prevention**: `isSyncingScroll` flag with 50ms timeout to prevent circular updates
- **Benefits**: Maintains visual correspondence between markdown and WYSIWYG content

### Multiple Document System: Tab-Based Architecture
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

## UI/UX Design Decisions

### Tailwind CSS v4 Compatibility: Opacity Syntax Update
- **Issue**: Tailwind v4 changed `bg-opacity-*` utility syntax causing transparent overlays to appear as solid black
- **Solution**: Updated from `bg-black bg-opacity-30` to `bg-black/30` syntax 
- **Implementation**: Applied throughout ImageManager overlays, modals, and semi-transparent elements
- **Rationale**: Maintain visual consistency with modern Tailwind v4 opacity syntax
- **Components Affected**: ImageManager hover overlays, modal backgrounds, button highlights

### Image Usage Tracking and Deletion Protection
- **Decision**: Implement comprehensive image usage tracking with deletion warnings
- **Implementation Strategy**:
  - **Usage Counting**: `countImageUsage()`, `getImageUsageStats()`, `findDocumentsUsingImage()` utility functions
  - **Visual Indicators**: Usage badges on each image showing "N uses" with blue (used) or gray (unused) styling
  - **Deletion Warnings**: Detailed alerts showing which documents use images before deletion
  - **Batch Operations**: Multi-select deletion with comprehensive usage summaries
- **User Protection**: Prevents accidental deletion of images still referenced in documents
- **Information Architecture**: Usage stats prominently displayed in image gallery interface
- **Alternative Considered**: Simple confirmation dialogs - rejected for lack of usage context

### Button Positioning: Contextual Placement Strategy
- **Decision**: Position control buttons next to their related content rather than separated in UI corners
- **TabBar "New Document" Button**: Moved from right end to directly after last tab on left side
  - **Rationale**: More intuitive tab workflow similar to modern browsers
  - **Implementation**: Positioned within scrollable tab container with `flex-shrink-0`
- **Preview "Edit" Button**: Moved from right side to directly next to "Preview" title
  - **Rationale**: Creates more cohesive header with related controls grouped together
  - **Implementation**: Changed from `justify-between` to inline positioning with `ml-2` spacing
- **Benefits**: More logical information architecture, reduced cognitive load, familiar UI patterns

### Document Statistics Repositioning: Editor Context Integration
- **Decision**: Move document statistics from header Information Pane to MarkdownEditor title area
- **Information Order**: Standardized to Lines → Words → Characters (user requested sequence)
- **Implementation**: 
  - Added `stats` prop to MarkdownEditor component with computed statistics
  - Positioned directly next to "Markdown Editor" title with `ml-3` spacing
  - Maintained small text styling (`text-xs`) and subtle gray color
- **Rationale**: Statistics are more contextually relevant next to the content they describe
- **Benefits**: Cleaner header, more logical information grouping, immediate document context

### Save Status Information Consolidation
- **Decision**: Consolidate all save-related information in TabBar next to document management controls
- **Implementation**:
  - **Last Saved Timestamp**: Positioned after "New document" button in subtle gray (`text-gray-500`)
  - **Save Status Messages**: Positioned next to timestamp with original prominence (green for success)
  - **Spacing**: Wider separation (`ml-4`) with proper spacing between elements (`space-x-3`)
- **Information Architecture**: All document-related status grouped with document tabs
- **Color Strategy**: 
  - Persistent information (timestamps) in subtle gray
  - Action feedback (save confirmations) in original prominent colors
- **Header Cleanup**: Removed Information Pane entirely as all content moved to contextual locations
- **Benefits**: Single location for document status, cleaner header, logical information grouping