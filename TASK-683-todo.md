# TASK-683 TODO

## Goal

Upgrade `@typescript-eslint` stack to support TypeScript 5.9.x cleanly, verify local lint/test/build, and confirm CI/remote actions remain aligned.

## Checklist

- [ ] Capture current dependency/config baseline (`package.json`, ESLint configs, workflows)
- [x] Select target versions for `@typescript-eslint/*`, `eslint`, and `typescript`
- [x] Update dependency declarations and `resolutions`
- [ ] Reinstall dependencies with `yarn install` and refresh lockfile
- [ ] Run `yarn lint` and fix upgrade-related config/rule breaks only
- [ ] Run `yarn tsc`, `yarn test --coverage`, and `yarn build`
- [ ] Verify GitHub Actions workflows still use correct commands/runtime
- [ ] Summarize changes, risks, and follow-up cleanup reminder

## Notes

- Use `yarn` only.
- Keep both `eslint.config.js` and `.eslintrc.json` as requested.
- Pin TypeScript to `5.9.x` as requested.
