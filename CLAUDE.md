# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **fully functional** Markdown editor web application that runs in browsers without depending on a backend server. The editor provides a professional dual-pane editing experience with advanced features.

Key characteristics:
- **Dual-editor layout**: Always-visible Markdown (left) and WYSIWYG (right) editors with bidirectional sync
- **Professional CodeMirror 6 integration**: Syntax highlighting, emacs shortcuts, advanced search
- **Advanced tab management**: Multiple documents, pinning, drag-and-drop reordering, keyboard navigation
- **Comprehensive image system**: Upload, storage, cursor-based insertion, drag-and-drop support
- **Complete file operations**: Import, export, save, load, auto-save, ZIP export for all documents
- **Production-ready deployment**: Ubuntu Apache, Docker, and Google Cloud Run configurations
- **Robust testing**: 105/115 tests passing, E2E testing with Playwright

## Technology Stack

- **TypeScript** - Primary programming language with strict type checking
- **Vue.js 3** - Composition API with reactive state management
- **CodeMirror 6** - Professional code editor with markdown syntax highlighting
- **Tailwind CSS 4.x** - Modern utility-first styling framework
- **Vitest** - Unit testing framework (105/115 tests passing)
- **Playwright** - End-to-end testing with visual regression testing
- **GitHub Actions** - CI/CD pipeline for automated deployment

## Development Requirements

- **Unit Tests**: Maintain 80%+ code coverage (currently 91% test success rate)
- **Code Quality**: Use linter and formatter for consistent code style
- **Documentation**: Follow AI-assisted development workflow with structured documentation

## AI-Assisted Development Workflow

This project follows a structured AI development process with documentation stored in the `ai/` directory:

### Required Documentation Files

- `ai/architecture.md` - Software design and library specifications not obvious from config files
- `ai/decisions.md` - Development decisions including rejected approaches
- `ai/tasks.md` - Remaining tasks and unresolved concerns
- `ai/completed_tasks.md` - Finished tasks that are moved from `ai/tasks.md` when they are done
- `ai/reminders.md` - **Check this first** - End-of-task checklist to prevent forgotten actions
- `ai/logs/` - Task execution records

### Development Process

1. **Start each session** by reading `ai/tasks.md` for current priorities
2. **Update documentation** as decisions are made
3. **Record progress** in appropriate documentation files
4. **Check reminders.md** before completing any task
5. **Log completed work** in `ai/logs/`

## Project Status

✅ **PRODUCTION READY** - All core features complete with comprehensive testing and deployment options.

### Core Application Status
- **Editor Features**: Complete dual-pane Markdown/WYSIWYG editing with CodeMirror 6
- **Tab Management**: Advanced multi-document support with pinning and keyboard navigation
- **Image System**: Complete upload, storage, and insertion functionality
- **File Operations**: Full import/export capabilities including ZIP archives
- **Testing**: 105/115 unit tests passing, complete E2E test suite
- **Build System**: Successful TypeScript compilation and Vite bundling

### Current Focus
**Ubuntu Server with Apache 2.4 deployment** (HIGHEST PRIORITY) - Now complete and ready for production use.

## Deployment Options (All Production-Ready)

### 1. Ubuntu Server with Apache 2.4 ⭐ (PRIMARY)
- **Location**: `deployment/ubuntu-apache/`
- **Status**: ✅ Complete with automated scripts
- **Features**: SSL, security hardening, automated deployment
- **Usage**: `./deploy.sh user@server-ip domain.com`

### 2. Docker Containers
- **Location**: `deployment/docker/`
- **Status**: ✅ Complete with multi-stage builds
- **Features**: Nginx, security optimizations, health checks
- **Usage**: `docker-compose up -d markdown-editor`

### 3. Google Cloud Run
- **Location**: `deployment/google-cloud-run/`
- **Status**: ✅ Complete with GitHub Actions CI/CD
- **Features**: Auto-scaling, custom domains, artifact registry
- **Usage**: `./deploy.sh project-id region domain.com`

## Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm run test             # Run unit tests
npm run test:coverage    # Run with coverage report
npm run test:e2e         # Run E2E tests
npm run test:e2e:headed  # Run E2E tests with browser visible

# Code Quality
npm run lint             # Lint and fix code
npm run format           # Format code with Prettier
```

## Quick Reference
- **Project Type**: Production-ready Markdown editor web application
- **Current Status**: All core features complete, deployment-ready
- **Next Priority**: Component architecture refactoring and image management interface
- **Test Status**: 105/115 passing (91% success rate)
- **Deployment**: Ubuntu Apache (primary), Docker, and Google Cloud Run options available