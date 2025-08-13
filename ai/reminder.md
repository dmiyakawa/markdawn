# Task Completion Reminder

## Before Ending Any Development Session

### Code Quality Checks
- [ ] Run `npm run lint` to check for linting issues
- [ ] Run `npm run format` to ensure consistent formatting
- [ ] Run `npm run test:coverage` to verify 80% test coverage maintained

### Documentation Updates
- [ ] Update `ai/architecture.md` if any architectural decisions were made
- [ ] Update `ai/decisions.md` if any development choices were made
- [ ] Update `ai/tasks.md` with any new tasks discovered or remaining work
- [ ] Update `ai/next_action.md` with immediate next steps for continuation

### Development State
- [ ] Commit significant progress (if requested by user)
- [ ] Record what was accomplished in `ai/logs/` directory
- [ ] Ensure application is in a working state (can run `npm run dev` successfully)

### Testing Requirements
- [ ] All new features have unit tests
- [ ] Coverage thresholds are met (80% minimum)
- [ ] All tests pass with `npm run test`
- [ ] E2E tests with Playwright are working
- [ ] Move completed tasks from `ai/tasks.md` to `ai/completed_tasks.md`

## Critical Reminders
- Never leave the application in a broken state
- Always maintain the 80% test coverage requirement
- Follow the established TypeScript and Vue.js patterns
- Update documentation as architectural decisions are made