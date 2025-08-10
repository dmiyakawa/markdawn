# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Markdown editor web application project that runs in browsers without depending on a backend server. The editor provides both HTML preview and WYSIWYG editing capabilities that can be toggled as needed.

Key characteristics:
- Web-based Markdown editor with preview functionality
- WYSIWYG editor mode available
- All data stored in browser (no backend dependency)
- Supports file uploads and downloads
- Can be deployed to local, IaaS, or PaaS environments

## Technology Stack

- **TypeScript** - Primary programming language
- **Vue.js** - Frontend framework (latest stable version)
- **Tailwind CSS** - Styling framework
- **GitHub** - Version control and CI/CD via GitHub Actions

## Development Requirements

- **Unit Tests**: Maintain 80%+ code coverage
- **Code Quality**: Use linter and formatter for consistent code style
- **Documentation**: Follow AI-assisted development workflow with structured documentation

## AI-Assisted Development Workflow

This project follows a structured AI development process with documentation stored in the `ai/` directory:

### Required Documentation Files

- `ai/architecture.md` - Software design and library specifications not obvious from config files
- `ai/decisions.md` - Development decisions including rejected approaches
- `ai/tasks.md` - Remaining tasks and unresolved concerns
- `ai/next_action.md` - **Check this first** - immediate next steps for task continuation
- `ai/reminder.md` - End-of-task checklist to prevent forgotten actions
- `ai/logs/` - Task execution records

### Development Process

1. **Start each session** by reading `ai/next_action.md`
2. **Update documentation** as decisions are made
3. **Record progress** in appropriate documentation files
4. **Check reminder.md** before completing any task
5. **Log completed work** in `ai/logs/`

## Project Status

Currently in initial setup phase - no source code files exist yet. The project structure and development workflow are defined in `ai/context.md`.

## Deployment Targets

- **Local**: WSL Linux environment
- **IaaS**: Linux servers with Apache2
- **PaaS**: Google Cloud services