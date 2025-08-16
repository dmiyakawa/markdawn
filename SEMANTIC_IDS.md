# Semantic ID Documentation

This document outlines the semantic ID naming conventions and usage patterns for the Markdown Editor application.

## Naming Conventions

### Format
- Use **kebab-case** for all IDs
- Use descriptive, meaningful names
- Include the element type or function in the name
- Follow the pattern: `{context}-{element}-{type}` (where applicable)

### Categories

#### Layout Containers
- `menu-bar` - Main navigation header
- `editor-container` - Main editor workspace
- `tab-container` - Tab container within tab bar
- `status-info` - Status information container

#### Editor Components
- `left-pane` - Markdown editor panel
- `right-pane` - Preview/WYSIWYG panel
- `markdown-editor` - CodeMirror markdown editor
- `wysiwyg-editor` - WYSIWYG editor instance
- `document-outline` - Document outline sidebar

#### Navigation
- `tab-bar` - Document tabs container
- `new-tab-btn` - New document tab button
- `scroll-left-btn` - Tab scroll left button
- `scroll-right-btn` - Tab scroll right button

#### Menu Sections
- `file-menu` - File operations menu
- `edit-menu` - Edit operations menu
- `export-menu` - Export operations menu
- `insert-menu` - Insert operations menu

#### Buttons (File Menu)
- `new-document-btn` - New document button
- `import-btn` - Import markdown file button
- `save-btn` - Save document button
- `load-btn` - Load document button

#### Buttons (Edit Menu)
- `undo-btn` - Undo action button
- `redo-btn` - Redo action button
- `find-replace-btn` - Toggle Find/Replace panel button

#### Buttons (Export Menu)
- `export-md-btn` - Export as Markdown button
- `export-html-btn` - Export as HTML button
- `export-pdf-btn` - Export as PDF button
- `export-zip-btn` - Export as ZIP archive button

#### Buttons (Insert Menu)
- `gallery-btn` - Open image gallery button

#### Interactive Components
- `find-replace-panel` - Find and replace panel
- `image-uploader` - Image upload component

#### Status Elements
- `last-saved-info` - Last saved timestamp display
- `save-status` - Current save operation status

## Usage Patterns

### Testing and Automation
These IDs are designed to support:
- **E2E Testing**: Reliable element selection in Playwright tests
- **Test Automation**: Consistent selectors for automated testing
- **Screen Readers**: Semantic identification for accessibility tools
- **Browser Extensions**: Easy element targeting for browser extensions

### Best Practices

1. **Uniqueness**: Each ID must be unique across the entire application
2. **Stability**: IDs should remain stable across UI changes
3. **Descriptiveness**: Names should clearly indicate the element's purpose
4. **Consistency**: Follow the established naming patterns

### Examples

```html
<!-- Good -->
<button id="save-btn" @click="saveDocument">Save</button>
<div id="export-menu">...</div>

<!-- Avoid -->
<button id="btn1" @click="saveDocument">Save</button>
<div id="menu">...</div>
```

## Implementation Status

### ✅ Completed
- Basic layout containers (`tab-bar`, `left-pane`, `right-pane`, etc.)
- Menu sections (`file-menu`, `edit-menu`, `export-menu`, `insert-menu`)
- Core buttons with descriptive IDs
- Status information elements
- Interactive components (Find/Replace, Image uploader)

### Coverage Summary
- **Layout**: All major containers have semantic IDs
- **Navigation**: Tab system and scroll controls identified
- **Menus**: All menu sections and primary buttons covered
- **Status**: Save status and timestamp information accessible
- **Interactive**: Modal panels and input components identified

This comprehensive ID coverage ensures excellent accessibility, testability, and automation support throughout the application.