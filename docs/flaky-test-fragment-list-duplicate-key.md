# Flaky test: `FragmentList` duplicate React key

## Summary

`src/fragmentarium/ui/FragmentList.test.tsx` failed intermittently on `master` with a React
duplicate-key `console.error` and an ambiguous element query. The cause was test **fixture data**,
not the component: `fragmentInfoFactory` generated fragment numbers from an unseeded random word
list, so two fragments in the same list occasionally received the same `number` — which
`FragmentList` uses as its React key.

This document records the issue, the evidence, and the fix, so the same class of bug is recognisable
if it appears in another factory.

## Symptom

The failure is intermittent: the suite passed on one run of a given commit and failed on the next,
with no code change in between.

```text
FAIL src/fragmentarium/ui/FragmentList.test.tsx
  ● Console
    console.error
      Warning: Encountered two children with the same key, `ma`. Keys should be unique so that
      components maintain their identity across updates. Non-unique keys may cause children to be
      duplicated and/or omitted — the behavior is unsupported and could change in a future version.
          at tbody
          at table
          at FragmentList (src/fragmentarium/ui/FragmentList.tsx:14:3)

  ● No config › Fragment 1 › Links to the fragment
    TestingLibraryElementError: Found multiple elements with the text: ma
```

Both halves of that output come from the same root cause: two rendered fragments shared the number
`ma`, so React saw a duplicate key **and** `screen.getByText(fragment.number)` matched two `<a>`
elements instead of one.

## Root cause

Three facts combine:

1. `src/fragmentarium/ui/FragmentList.tsx` keys its table rows by the fragment number, which is
   correct — the number is the fragment's identity:

   ```tsx
   <tr key={fragment.number}>
   ```

2. `src/test-support/fragment-fixtures.ts` generated that number from a random word:

   ```ts
   export const fragmentInfoFactory = Factory.define<FragmentInfo>(
     ({ associations }) => ({
       number: defaultChance.word(),
       …
   ```

3. `defaultChance` is constructed **without a seed** (`const defaultChance = new Chance()`), so every
   test run draws different values, and `chance.word()` draws from a small space — short words such
   as `ma` collide readily.

`FragmentList.test.tsx` builds a list of 2 fragments and re-runs `setup()` for every test case
(~15 times per suite run). Any single collision inside one list reproduces the failure.

The component was never at fault. The factory was silently violating an invariant the component
legitimately depends on: **fragment numbers are unique**.

## Evidence

Uniqueness measured directly by building 300 fragments from the factory and counting distinct
numbers:

| Factory                  | Fragments built | Distinct numbers       |
| ------------------------ | --------------- | ---------------------- |
| before (`chance.word()`) | 300             | **291** — 9 collisions |
| after (word + sequence)  | 300             | **300**                |

Because the failure rate per suite run is on the order of a percent, repeatedly running
`FragmentList.test.tsx` and seeing it pass is _not_ evidence of a fix. The uniqueness count above is,
since it tests the invariant rather than sampling the symptom.

## Fix

Make the generated number unique by construction, using the factory's monotonically increasing
`sequence`:

```diff
 export const fragmentInfoFactory = Factory.define<FragmentInfo>(
-  ({ associations }) => ({
-    number: defaultChance.word(),
+  ({ associations, sequence }) => ({
+    number: `${defaultChance.word()}.${sequence}`,
```

The value keeps its random, museum-number-like shape (`ma.17`) while guaranteeing distinctness, so
no collision is possible regardless of the random seed.

## What was deliberately _not_ done

- **Not** mocking or silencing `console.error`. That hides the warning while leaving the duplicate
  keys — and therefore the `getByText` ambiguity — in place. Suppressing console output is never an
  acceptable fix for console noise; the source has to be fixed.
- **Not** seeding `Chance` alone. Seeding makes the suite reproducible, which is worthwhile in its
  own right, but on its own it would only make the failure deterministic — it would either always
  collide or always pass, by luck of the seed, and would not restore the uniqueness invariant.
- **Not** loosening the assertion (e.g. `getAllByText(...)[0]`). That would make the test pass while
  preserving the invalid render.

## Generalisation

Any factory field used as a React `key`, a map key, a lookup id, or a URL segment must be unique per
build. When such a field is randomly generated, prefer the factory `sequence` (alone or as a suffix)
over a raw random draw. The failure mode is silent, low-frequency, and surfaces far from its cause —
it looks like a flaky UI test rather than a broken fixture.

Fields worth auditing are those a component treats as identity. In this repository, `FragmentInfo.number`
was the one in use; other factories should be checked before their values are used as keys.

## Verification

On the fix branch:

| Check                           | Result                                                                |
| ------------------------------- | --------------------------------------------------------------------- |
| Factory uniqueness (300 builds) | 300 distinct numbers                                                  |
| `FragmentList.test.tsx` ×10     | 15/15 tests pass each run, zero console output                        |
| `yarn lint`                     | clean                                                                 |
| `yarn tsc`                      | clean                                                                 |
| `yarn test --watchAll=false`    | 339/339 suites, 3460 passed, 2 skipped, 0 failed, zero console output |
