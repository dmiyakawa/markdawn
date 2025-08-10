# Software Architecture

## Technology Stack

### Core Framework
- **Vue.js 3.5.18** - Modern reactive UI framework with Composition API
- **TypeScript 5.9.2** - Type-safe JavaScript development
- **Vite 7.1.1** - Fast build tool and dev server

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
├── components/     # Reusable Vue components
├── composables/    # Vue composables for shared logic
├── stores/         # State management (Pinia if needed)
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
├── App.vue         # Main application component
├── main.ts         # Application entry point
└── style.css       # Global styles and Tailwind imports
```

## Application Architecture

### Core Features
1. **Markdown Editor** - Textarea-based markdown input
2. **Preview Mode** - Real-time HTML preview of markdown content
3. **WYSIWYG Mode** - Rich text editor with markdown output
4. **Toggle Controls** - Switch between editor and preview modes

### Markdown Processing
- **Library**: marked.js v16.1.2 for robust markdown parsing
- **Features**: GitHub Flavored Markdown with comprehensive feature support
- **Bidirectional**: HTML ↔ Markdown conversion for WYSIWYG mode
- **Error Handling**: Graceful fallbacks for parsing errors

### Data Flow
- Reactive `markdownContent` ref stores the markdown source
- Computed `renderedHtml` uses marked.js to convert markdown to HTML
- WYSIWYG mode provides HTML-to-markdown conversion
- Toggle states control UI visibility and editing modes

### Storage Strategy
All data stored in browser memory (reactive refs) with future plans for:
- LocalStorage persistence
- File import/export capabilities
- No backend server dependencies

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

- **Test Coverage**: Minimum 80% (branches, functions, lines, statements)
- **Code Style**: ESLint + Prettier for consistent formatting
- **Type Safety**: Strict TypeScript configuration
- **Component Testing**: Vue Test Utils for component isolation