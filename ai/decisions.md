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

### State Management: Reactive Refs (Selected)
- **Chosen**: Vue 3 Composition API with ref/computed
- **Reason**: Simple state needs, no complex state sharing required
- **Future consideration**: Pinia if state complexity grows

### Markdown Processing: marked.js (Selected)
- **Chosen**: marked.js v16.1.2
- **Reason**: Lightweight, fast, excellent GFM support, browser-optimized
- **Features**: Comprehensive markdown parsing with bidirectional HTML conversion
- **Alternatives considered**: markdown-it (rejected for larger bundle size), showdown (rejected for less active maintenance)

### File Structure
- **Chosen**: Standard Vue.js structure with utilities separation
- **Components**: Separate directory for reusable components
- **Utils**: Separate utility functions for testability
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