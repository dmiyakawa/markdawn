# Development Reminders

This file contains what must be done during development.

## Task Completion Checklist

### Before Ending Any Development Session

#### Code Quality Checks

- [ ] Run `npm run build` to ensure TypeScript compilation succeeds
- [ ] Run `npm run format` to ensure consistent formatting
- [ ] Run `npm run lint` to check for linting issues
- [ ] All new features have unit tests
- [ ] All tests pass with `npm run test`
- [ ] Run `npm run test:coverage` to verify 80% test coverage maintained
- [ ] Run `npm run test:e2e` to verify E2E tests are working

#### Documentation Updates

- [ ] Update `ai/architecture.md` if any architectural decisions were made
- [ ] Update `ai/decisions.md` if any development choices were made
- [ ] Update `ai/reminders.md` if project status changed significantly
- [ ] Update `ai/tasks.md` with any new tasks discovered or remaining work
- [ ] Move completed tasks from `ai/tasks.md` to `ai/completed_tasks.md`

#### Development State

- [ ] Commit significant progress (if requested by user)
- [ ] Record what was accomplished in `ai/logs/` directory
- [ ] Ensure application is in a working state (can run `npm run dev` successfully)

## Critical Development Reminders

- Keep this file compact enough so that it only contains promises during development.
  - Do not include in this file information of the current development status or what was achieved last time
  - No need to include in this file technical decisions or typical technology. Other context files like `ai/architecture.md`, `ai/decisions.md` are more appropriate to store those.
- Never leave the application in a broken state
  - All test files should be successful without errors
- Always maintain the 80% test coverage requirement
- Follow the established TypeScript and Vue.js patterns
- Update documentation as architectural decisions are made
