# TASK: TS7 Deprecation Migration — Research & Plan

Status: **RESEARCH ONLY — no code changed.** Awaiting approval to implement.
TypeScript installed: **5.9.3**. Toolchain: CRA `react-scripts@5.0.1` + `@craco/craco@7.1.0`, Jest via CRA, Babel does the real transpile (tsc is `noEmit`).

---

## 1. Ground-truth findings (measured, not assumed)

All measurements done with throwaway scratch tsconfigs in the scratchpad, running `tsc` against the real `src`. The real `tsconfig.json`, `src`, and `craco.config.js` were **not** modified.

### 1.1 `ignoreDeprecations` currently suppresses nothing

Removing `ignoreDeprecations: "5.0"` while keeping **all four** flagged options (`target: es5`, `moduleResolution: node`, `baseUrl`, `downlevelIteration`) produces **0 errors** under TS 5.9.3.

**Implication:** none of these four options emit a deprecation _error_ in the currently-installed TypeScript. The card's "masked by ignoreDeprecations" premise is forward-looking (TS7/native `tsgo`), not the state today. Removing `ignoreDeprecations` now is safe and is the correct first step regardless — it's a no-op line today.

### 1.2 The real breakage is `target`, and it's the Bluebird conflict

Changing **only** `target` es5 → es2020 (everything else unchanged) produces **51 errors across 23 files**, all `TS1064`:

> _The return type of an async function or method must be the global `Promise<T>` type._

Under `target: es5`, TS is lenient about async functions whose return type is annotated with a **shadowed/non-global `Promise`**. From es2015+ this becomes a hard error. The 23 files either:

- `import Promise from 'bluebird'` (shadows the global) and write `async f(): Promise<T>`, or
- `import Bluebird from 'bluebird'` and write `async f(): Bluebird<T>` (e.g. `src/router/sitemap.tsx:141`).

Breakdown of the 23 files: **7 source + 16 test**.

Source files:

- `src/afo-register/ui/AfoRegisterSearchForm.tsx`
- `src/chronology/ui/DateEditor/DatesInTextSelection.tsx`
- `src/corpus/ui/WordExport.tsx`
- `src/fragmentarium/ui/fragment/WordExport.tsx`
- `src/fragmentarium/ui/image-annotation/annotation-tool/FragmentAnnotation.tsx`
- `src/router/sitemap.tsx`
- `src/test-support/AppDriver.tsx` (test support, ships in `src`)

Test files (16): under `fragmentarium/ui/**`, `signs/ui/search/**`, `dictionary/ui/search/**`, `chronology/**`, etc. Full list captured during implementation.

Note: **185 files import bluebird, but only 23 break.** The rest use Bluebird for non-async signatures (cancellable promises) and are unaffected — we must NOT mass-rewrite bluebird imports.

Bluebird import shapes across the repo (for reference):

- `import Promise from 'bluebird'` — 98 files (shadows global)
- `import Bluebird from 'bluebird'` — 73 files (no shadow)
- `import { Promise } from 'bluebird'` — 15 files (shadows global)
- `import Bluebird, { Promise } from 'bluebird'` — 1 file

### 1.3 `moduleResolution: bundler` is clean except one dotenv typing regression

Changing **only** `moduleResolution` node → bundler produces exactly **1** new error:
`src/setupTests.ts(20,3): TS2322: Type 'unknown' is not assignable to type 'string | undefined'.`

Cause: `bundler` honors `package.json` `exports`/conditional types, so `dotenv`'s `parse()` resolves to a different `.d.ts` where the value type is `unknown` instead of `string`. This is the card's "module/import resolution regression from new moduleResolution mode." Fix is one line in `setupTests.ts` (annotate/`String(value)`), behavior-preserving.

`bundler` requires `module: esnext` (already set) — compatible.

### 1.4 `downlevelIteration` is a no-op once target ≥ es2015 — safe to remove.

### 1.5 The genuinely tricky blocker: removing `baseUrl` breaks webpack + jest resolution

`node_modules/react-scripts/config/modules.js` reads **only `baseUrl`** from tsconfig (it never reads `paths`). It uses `baseUrl: src` to:

- add `src` to webpack `resolve.modules` (so `import x from 'dictionary/...'` resolves at build/dev), and
- add `src` to jest `modulePaths` (so the same bare imports resolve in tests).

If we remove `baseUrl` and rely on tsconfig `paths` instead:

- **tsc** resolves fine (measured: `paths: { "*": ["src/*"] }` gives 0 module-not-found errors), but
- **webpack and jest lose `src` from their resolution roots** → dev/build and the entire test suite fail to resolve absolute imports.

`paths` in tsconfig only informs the type-checker; CRA's webpack/jest do **not** read it. So removing `baseUrl` **requires** compensating in `craco.config.js`:

- webpack: `webpackConfig.resolve.modules` must include the `src` dir.
- jest: `jestConfig.modulePaths` (or `moduleDirectories`) must include `src`.

### 1.6 CRA does NOT rewrite tsconfig during start/build/test

`verifyTypeScriptSetup` (which would force `moduleResolution: node` and strip `paths`) is only invoked from `react-scripts/scripts/init.js` (scaffolding), **not** from `start/build/test` in `react-scripts@5.0.1`. Verified by grep. So our new config will not be silently reverted by the tooling. (This was my initial worry; it is NOT active in this version.)

### 1.7 Lint resolution is independent of tsconfig baseUrl

`.eslintrc.json` configures `import/resolver.node` with `moduleDirectory: ["node_modules","src/"]`. So `eslint-plugin-import` resolves absolute imports on its own, independent of tsconfig `baseUrl`. Removing `baseUrl` should not break the lint gate on that axis.

---

## 2. Recommended target config (`tsconfig.json`)

```jsonc
{
  "compilerOptions": {
    "target": "es2020", // was es5 (evaluated es2017/2018/2020; all equivalent for typecheck since lib=esnext & noEmit; es2020 = modern, safe)
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "esnext",
    "moduleResolution": "bundler", // was node (node10)
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "paths": { "*": ["src/*"] }, // replaces baseUrl for tsc; resolves relative to tsconfig dir
    // baseUrl removed
    // downlevelIteration removed
    // ignoreDeprecations removed
    "noImplicitAny": false,
    "noFallthroughCasesInSwitch": true,
    "sourceMap": true,
  },
  "include": ["src"],
}
```

Plus **`craco.config.js`** additions (required by §1.5):

- webpack `configure`: ensure `webpackConfig.resolve.modules` includes `path.resolve(__dirname, 'src')`.
- add craco `jest.configure`: set `jestConfig.modulePaths = ['<rootDir>/src']` (mirrors what CRA did from baseUrl).

Residual tsc errors after applying the full config = **52** (51 Bluebird `TS1064` + 1 dotenv `TS2322`) — all identified and scoped below.

---

## 3. Proposed implementation plan (small commits, per card)

1. **tsconfig transition** — remove `ignoreDeprecations`, `downlevelIteration`, `baseUrl`; set `target: es2020`, `moduleResolution: bundler`, add `paths: {"*":["src/*"]}`.
2. **build/jest resolution** — add `resolve.modules` (webpack) + `modulePaths` (jest) to `craco.config.js` so absolute imports still resolve at build & test time. Verify with a smoke build + a small test run.
3. **module-resolution regression** — fix `setupTests.ts:20` dotenv `unknown` typing (behavior-preserving `String(value)` / typed entries).
4. **Bluebird/async typing fixes** — in the 23 files, make each `async` function's return type the **global** `Promise<T>` (async functions always return a native promise at runtime, so this is purely a type correction — zero behavior change). Do NOT touch the ~160 bluebird files that don't break.
5. **validation + cleanup** — run all gates; remove these TASK docs before merge.

## 4. Gates to run (hard gates)

- `yarn lint`
- `yarn tsc`
- `CI=true yarn test --watch=false --runTestsByPath <touched test files>` (focused)
- `CI=true yarn test --watch=false` (full — justified: touches shared infra `setupTests.ts`, `AppDriver.tsx`, resolution config)

## 5. Open decisions for approval

- **Target level**: recommend `es2020`. (es2017/2018 equivalent for our type-check since `lib` is pinned to `esnext` and emit is off.)
- **baseUrl replacement**: recommend `paths` + CRACO webpack/jest compensation (fully removes `baseUrl` per card). The only alternative that avoids CRACO changes would be keeping `baseUrl`, which the card forbids.
- **Bluebird fix style**: recommend correcting async return annotations to global `Promise<T>` in the 23 files (minimal, behavior-preserving) rather than renaming bluebird imports repo-wide.

## 6. Risk notes

- Broad blast radius on _config_ (webpack/jest resolution) even though only 23 files change in `src`. Full test suite run is mandatory.
- `bundler` may surface further `exports`-map typing differences beyond dotenv in edge dependencies; measured today only `setupTests.ts` is affected, but full `tsc` + full test run will confirm.
- No suppression left behind: `ignoreDeprecations` removed, not re-added.
