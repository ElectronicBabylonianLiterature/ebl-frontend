# TASK-docker-build — Work Log

## Context

`master` is at `8971a666 Add realia annotation layer to named entity annotation (#767)`.
The `docker` and `docker-test` jobs in `.github/workflows/main.yml` run only on
`push` to `master` (`if: github.event_name == 'push' && github.ref == 'refs/heads/master'`),
so they were never exercised by the pull request. They started failing immediately
after the merge.

## Investigation

1. `Dockerfile` copies `package.json`, `patches`, `yarn.lock`, `.eslintrc.json`,
   `craco.config.js`, `tsconfig.json`, `.env`, `public` and `src` into the image and
   runs `yarn build`.
2. `.dockerignore` (before the fix) removed test material from the build context:

   ```text
   src/**/*.test.ts
   src/**/*.test.tsx
   src/test-support
   ```

3. PR #767 introduced a new test-helper naming convention — 17 new
   `*.testSupport.ts` / `*.testSupport.tsx` files (created while splitting large test
   files to satisfy the 250-line ceiling). These match none of the `.dockerignore`
   patterns, so they _are_ copied into the image, while `src/test-support/` — which
   seven of them import from — is _not_.
4. `tsconfig.json` has `"include": ["src"]`, so those files are part of the TypeScript
   program. CRA 5's `ForkTsCheckerWebpackPlugin` reports issues for
   `**/src/**/*.{ts,tsx}` and excludes only
   `__tests__/**`, `?(*.){spec|test}.*`, `setupProxy.*` and `setupTests.*`
   (`node_modules/react-scripts/config/webpack.config.js:746-760`).
   `*.testSupport.*` is not excluded, so its errors fail the build.
   This is also why the pre-existing `src/setupTests.ts` — which has always imported
   `test-support/*` — never broke the Docker build.

## Root cause

`.dockerignore` is a denylist keyed on the `*.test.*` naming convention. The new
`*.testSupport.*` convention was not added to it, so test-only helpers were shipped
into the Docker build context without the `src/test-support/` fixtures they import,
and CRA's type-check failed the production build.

The reason it reached `master` undetected is that no PR-triggered job builds the
Docker image; the only build coverage in the `test` job is a plain `yarn build`
against the full, unpruned tree.

## Reproduction

Docker is not available in this dev container, so the build context was reproduced by
copying exactly the files the `Dockerfile` copies, minus the `.dockerignore` patterns,
with `node_modules` symlinked:

```bash
cp package.json yarn.lock .eslintrc.json craco.config.js tsconfig.json .env "$CTX"/
cp -r patches public "$CTX"/
rsync -a --exclude '*.test.ts' --exclude '*.test.tsx' --exclude 'test-support' src "$CTX"/
ln -s /workspaces/ebl-frontend/node_modules "$CTX"/node_modules
```

`tsc --noEmit` in that context produced 17 `TS2307: Cannot find module 'test-support/…'`
errors across 7 files:

- `src/fragmentarium/application/fragmentServiceCache.testSupport.ts`
- `src/fragmentarium/application/fragmentServiceFragments.testSupport.ts`
- `src/fragmentarium/infrastructure/fragmentRepository.testSupport.ts`
- `src/fragmentarium/ui/fragment/cuneiformFragment.testSupport.tsx`
- `src/fragmentarium/ui/text-annotation/annotationSave.testSupport.tsx`
- `src/fragmentarium/ui/text-annotation/markable.testSupport.tsx`
- `src/fragmentarium/ui/text-annotation/spanAnnotator.testSupport.tsx`
- `src/fragmentarium/ui/text-annotation/textAnnotationRender.testSupport.tsx`

## Fix

`.dockerignore` — added the new test-helper naming convention to the exclusion list:

```text
src/**/*.test.ts
src/**/*.test.tsx
src/**/*.testSupport.ts     <- added
src/**/*.testSupport.tsx    <- added
src/test-support
```

Safety check before excluding: `*.testSupport.*` modules are imported only by
`*.test.*` files and by other `*.testSupport.*` files — no production module imports
them, so removing them from the image cannot break the bundle.

No application code was changed.

## Pre-existing issues found

None surfaced by this task beyond the failure under investigation. `yarn lint` and
`yarn tsc` were already clean on the merged `master` tree.

## Verification

Docker build context reproduced with the corrected `.dockerignore` patterns:

| Check                                                  | Result                                                                         |
| ------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `tsc --noEmit` in pruned Docker context                | exit 0 (was 17 errors)                                                         |
| `craco build` in pruned Docker context, Dockerfile env | exit 0, "Compiled successfully", no warnings                                   |
| `yarn lint`                                            | exit 0                                                                         |
| `yarn tsc`                                             | exit 0                                                                         |
| `yarn test --watchAll=false`                           | exit 0 — 406/406 suites, 3877/3877 tests, 50/50 snapshots, zero console output |

Coverage is unaffected: the change touches no `.ts`/`.tsx` file.

## Follow-up recommendation (not implemented — needs approval)

The `docker` and `docker-test` jobs run only on `push` to `master`, so a build that is
valid in the `test` job but broken in the Docker context cannot be caught before merge.
Any future test-only naming convention will break `master` the same way.

Suggested guard: add a pull-request job that builds the image with `push: false`
(or a lightweight step that type-checks the pruned context), so the Docker build is
exercised by PR CI.
