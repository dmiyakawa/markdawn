# Technical Concerns and Complex Issues

This file contains technical concerns requiring detailed investigation and complex bugs that are not simple implementation tasks.

## Unresolved Technical Decisions

### State Management Architecture

**What it is about**: As the application grows more complex with features like multiple documents, advanced image management, and potential plugin systems, the current Vue 3 Composition API approach with reactive refs may become insufficient for complex state sharing and management.

**Current approach**: Vue 3 Composition API with `ref()` and `computed()` for simple state needs

**Available options**:
- **Continue with Composition API**: Suitable for current complexity level, minimal overhead, direct Vue integration
- **Adopt Pinia**: Vue's official state management library, provides centralized store, time-travel debugging, DevTools integration, better for complex state relationships
- **Custom State Management**: Build application-specific state management using Vue's reactivity system
- **Hybrid Approach**: Use Pinia for complex shared state while keeping simple local state in components

**Decision factors**: Current state complexity, future feature requirements, team preferences, debugging needs

### PWA Capabilities and Offline Support Strategy

**What it is about**: Determining whether to implement Progressive Web App features that would allow the editor to work offline and be installable like a native application.

**Current state**: Standard web application without offline capabilities

**Available options**:
- **Full PWA Implementation**: Service worker for offline caching, app manifest for installation, background sync for data
- **Selective Offline Support**: Cache essential assets only, limited offline functionality for core editing features
- **No PWA Features**: Remain as standard web application, simpler maintenance but requires internet connection
- **Future PWA Migration**: Plan architecture to support PWA features later without major refactoring

**Technical considerations**: 
- Service worker complexity and maintenance
- Cache invalidation strategies for application updates
- Offline data synchronization challenges
- Browser storage limitations for large documents and images

### Performance Optimization for Large Image Collections

**What it is about**: As users accumulate many images in browser storage, the application may experience performance degradation in image loading, gallery display, and memory usage.

**Current approach**: Load all images into memory for gallery display, no pagination or lazy loading

**Available options**:
- **Virtual Scrolling**: Render only visible images in gallery, significantly reduces DOM nodes and memory usage
- **Lazy Loading**: Load images on-demand as they enter viewport, improves initial load time
- **Image Pagination**: Break gallery into pages, reduces memory footprint but may impact user experience
- **Thumbnail Generation**: Create smaller preview images, faster gallery loading with full-size on demand
- **Hybrid Approach**: Combine virtual scrolling with lazy loading and thumbnail system

**Performance considerations**:
- Browser storage access patterns
- Memory usage with large image collections
- User experience impact of different loading strategies

### Advanced Markdown Extensions Support

**What it is about**: Deciding whether and how to support extended markdown features beyond GitHub Flavored Markdown, such as mathematical equations, diagrams, and advanced table features.

**Current support**: GitHub Flavored Markdown via marked.js library

**Available extension options**:
- **Mathematical Equations**: KaTeX or MathJax integration for LaTeX-style math rendering
- **Diagram Support**: Mermaid.js for flowcharts, sequence diagrams, and other visual diagrams
- **Advanced Tables**: Enhanced table editing with sorting, filtering, and formatting options
- **Custom Syntax**: Plugin system allowing users to define custom markdown extensions
- **No Extensions**: Keep current GFM-only approach for simplicity

**Integration approaches**:
- **Plugin Architecture**: Modular system allowing optional feature loading
- **Built-in Extensions**: Integrate popular extensions directly into core application
- **External Processing**: Allow users to process documents with external tools
- **User-Configurable**: Settings to enable/disable specific extensions

## Testing Strategy Concerns

### File Upload Simulation in E2E Tests

**What it is about**: Current E2E tests cannot fully simulate real file drag-and-drop operations with actual files, limiting test coverage of file upload functionality.

**Current limitation**: E2E tests use simulated events without actual file objects

**Possible approaches**:
- **Playwright File Upload**: Use Playwright's built-in file upload methods for input elements
- **Mock File Objects**: Create realistic File objects for drag-and-drop simulation
- **Test File Generation**: Generate test files dynamically for upload scenarios
- **Manual Testing Protocol**: Establish systematic manual testing procedures for file operations

### Advanced Image Processing Testing Scenarios

**What it is about**: Testing complex image operations like resizing, format conversion, and WYSIWYG integration requires sophisticated test scenarios that are difficult to automate.

**Testing challenges**:
- Image resize operations with actual visual verification
- Cross-browser image rendering consistency
- WYSIWYG image manipulation edge cases
- Image reference preservation during document operations

### Cross-Browser Visual Regression Testing Maintenance

**What it is about**: Maintaining visual regression test baselines across different browsers and screen sizes requires ongoing effort and clear maintenance strategies.

**Maintenance concerns**:
- Baseline image updates when UI changes are intentional
- Handling browser-specific rendering differences
- Test environment consistency across different systems
- Automated vs manual baseline approval processes

## Browser Compatibility Decisions

### Target Browser Versions

**What it is about**: Establishing clear browser support requirements affects development decisions, polyfill needs, and feature availability.

**Current testing**: Chromium, Firefox, Mobile Chrome via Playwright

**Browser support options**:
- **Modern Browsers Only**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Extended Compatibility**: Include older versions with polyfills
- **Mobile-First**: Prioritize mobile browser support over desktop legacy browsers
- **Progressive Enhancement**: Core features work everywhere, advanced features for modern browsers

### Polyfill Requirements Assessment

**What it is about**: Determining which modern JavaScript and CSS features require polyfills for target browser support.

**Areas requiring assessment**:
- ES2020+ JavaScript features used in codebase
- CSS Grid and Flexbox compatibility requirements
- File API and Blob support for older browsers
- LocalStorage quota and behavior differences

### Mobile Device Optimization and Testing

**What it is about**: Ensuring optimal experience across various mobile devices with different screen sizes, input methods, and performance characteristics.

**Optimization areas**:
- Touch interface adaptations for code editing
- Virtual keyboard behavior with editor components
- Mobile browser storage limitations
- Performance optimization for lower-powered devices

## Complex Technical Issues

### WYSIWYG Image Resize Breaking Code Blocks

**Problem**: Resizing images in WYSIWYG mode corrupts code blocks, removing code block notation and leaving only filename + "Copy" button + raw code content.

**Status**: CONFIRMED BUG - Persists in actual browser despite multiple fix attempts

**Impact**: Breaks core editing functionality when images and code blocks coexist

**Test-Driven Development Approach Required**:

1. **Write failing test first** - Create E2E test that reproduces the exact bug:
   - Switch to WYSIWYG mode
   - Add content with both code block and image: 
     ```markdown
     # Test Document
     
     ```javascript:example.js
     console.log("Hello World");
     ```
     
     ![Test Image](data:image/jpeg;base64,...)
     ```
   - Resize the image using drag handles
   - Verify code block structure remains intact (should fail initially)

2. **Identify root cause** through failing test:
   - Track exactly when code block HTML gets corrupted
   - Monitor DOM mutations during image resize operations
   - Check HTML-to-markdown conversion at each step
   - Isolate whether issue is in DOM manipulation, event handling, or conversion

3. **Implement minimal fix** to make test pass:
   - Fix only what's needed to pass the test
   - Avoid over-engineering solutions
   - Focus on the specific interaction pattern

4. **Verify test passes** and no regressions occur

**Technical Investigation Areas**:
- Contenteditable behavior during DOM manipulation
- Event propagation between image resize and content sync
- HTML-to-markdown conversion timing and scope
- MutationObserver interference with contenteditable
- CodeMirror synchronization with WYSIWYG changes

**Previous Failed Attempts**:
- Wrapper div approach (DOM structure interference)
- Sibling-based handles (still causing corruption)
- Edit state tracking (insufficient isolation)
- HTML cleaning before conversion (partial solution)

**Next Steps**: Write comprehensive test suite covering this exact scenario before attempting any more fixes.

## Disabled Tests Requiring Investigation

### Performance Test Issues

**Problem**: E2E performance tests failing due to large content handling limitations

**Location**: `tests/e2e/performance.spec.ts:17` - "should handle large markdown documents efficiently"

**Status**: Currently disabled with `test.skip()`

**Issue Description**:

- Test generates large markdown content (20+ sections, ~4000+ characters)
- Playwright's `fill()` method appears to have character limits with CodeMirror
- Only the end sections (15-20) appear in editor, beginning content is missing
- Both small (20 sections) and large (50 sections) content sizes fail

**Investigation Attempts**:

1. **JavaScript Direct Access**: Tried accessing CodeMirror view directly via `document.querySelector` and `view.dispatch()` - unsuccessful
2. **Content Size Reduction**: Reduced from 50 sections to 20 sections - still fails
3. **Test Expectation Changes**: Modified to check for end sections instead of title - still truncated
4. **Fill Method Limitations**: Confirmed `fill()` method doesn't handle large content properly in CodeMirror

**Root Cause**: Playwright's `fill()` method has limitations when setting large amounts of text in CodeMirror editors

**Potential Solutions to Investigate**:

1. Use incremental content insertion (split large content into smaller chunks)
2. Investigate CodeMirror-specific test utilities or direct API access
3. Mock large document scenarios differently (perhaps test with real file loading)
4. Use different Playwright methods like `type()` with smaller batches
5. Research CodeMirror testing best practices and official test approaches

**Re-enabling Instructions**:

1. Remove `test.skip()` from line 17 in `tests/e2e/performance.spec.ts`
2. Test will immediately reproduce the issue for debugging
3. Current test generates content and expects to find title "# Large Document Test" but only finds end sections

### Image Upload Save/Load Cycle Test Issues

**Problem**: E2E image upload tests failing due to save/load functionality not working correctly

**Location**: `tests/e2e/image-upload.spec.ts:159` - "should maintain image references during save/load cycle"

**Status**: Currently disabled with `test.skip()`

**Issue Description**:

- Test sets content with "# Test Doc" and image references
- Saves content to browser storage
- Creates new document (shows "# Document 2")
- Attempts to load from browser storage
- Expected to see original "# Test Doc" but still sees "# Document 2"

**Root Cause**: Save/Load functionality integration issue

- Either save operation is not persisting correctly to localStorage
- Or load operation is not retrieving/applying the saved content correctly
- Or load operation is loading the wrong document from storage

**Investigation Needed**:

1. Test save functionality independently (check localStorage contents)
2. Test load functionality independently (verify content retrieval)
3. Check document management system for save/load workflow
4. Verify browser storage persistence across operations
5. Check if multiple documents are being saved and loaded correctly

**Re-enabling Instructions**:

1. Remove `test.skip()` from line 159 in `tests/e2e/image-upload.spec.ts`
2. Test will immediately reproduce the save/load issue
3. Content "# Test Doc" is saved but "# Document 2" persists after load

### Performance Real-time Preview Test Issues

**Problem**: E2E performance tests showing flakiness and race conditions, particularly on Mobile Chrome

**Locations**:

- `tests/e2e/performance.spec.ts:91` - "should update preview efficiently during typing"
- `tests/e2e/performance.spec.ts:113` - "should handle rapid content changes without lag"

**Status**: Currently disabled with `test.skip()`

**Issue Description**:

- Tests fail intermittently, especially on Mobile Chrome
- Content gets jumbled/mixed up in preview (e.g., "ogy dlazer ovmps jufoxwn ro b# Welcome to Markdown Editor")
- Race conditions between editor content setting and preview synchronization
- `fill()` method combined with `keyboard.type()` causes content conflicts

**Root Cause**: Test flakiness due to:

- Timing issues between editor and preview synchronization
- Mobile Chrome browser handling of rapid content changes
- Insufficient wait times for content stabilization
- Race conditions in content setting methods

**Investigation Needed**:

1. Implement more robust waiting strategies for preview updates
2. Add content stabilization checks before assertions
3. Consider using different content setting approaches for performance tests
4. Test with longer timeouts and better synchronization
5. Investigate Mobile Chrome specific timing issues

**Re-enabling Instructions**:

1. Remove `test.skip()` from lines 91 and 113 in `tests/e2e/performance.spec.ts`
2. Tests will reproduce the flakiness issue for debugging
3. Focus on Mobile Chrome browser for consistent reproduction

### Find/Replace Single Occurrence Test Flakiness

**Problem**: E2E find/replace test failing due to content setting and selection race conditions

**Location**: `tests/e2e/find-replace.spec.ts:116` - "should replace single occurrence"

**Status**: Currently disabled with `test.skip()`

**Issue Description**:

- Test attempts to set content "Hello world! This is a world of tests."
- Content gets scrambled/mixed with welcome content during setting process
- Multiple `Control+a` selections and `fill()` operations cause race conditions
- Results in content like "sts. teofld wors as iThi! rldwo# Welcome to Markdown Editor..."

**Root Cause**: CodeMirror content setting race conditions

- `Control+a` keyboard selections not completing before `fill()` operation
- CodeMirror's custom keybindings interfering with standard selection behavior
- Content mixing between original welcome text and test content
- Timing issues between keyboard events and editor state updates

**Investigation Needed**:

1. Develop more reliable content clearing approach for CodeMirror
2. Find alternative to `Control+a` + `fill()` pattern for content replacement
3. Add proper wait conditions for editor state stabilization
4. Consider using CodeMirror's direct API instead of keyboard simulation
5. Test alternative content setting methods (direct dispatching vs keyboard events)

**Re-enabling Instructions**:

1. Remove `test.skip()` from line 116 in `tests/e2e/find-replace.spec.ts`
2. Test will immediately reproduce the content scrambling issue
3. Focus on content replacement timing and method reliability