# TASK-REALIA-RLA-COUNT — TODO

In Realia search results, count RlA articles in the source badge, the same way
AfO articles are already counted.

## Checklist

- [x] `RealiaResultsList.tsx`: RlA badge carries `count: entry.reallexikon.length`
      (was a presence-only badge), matching the AfO badge.
- [x] Update the affected test to assert the RlA count alongside AfO/References.
- [x] Fix the two `RealiaSearch.integration.test.tsx` failures the change caused
      (count assertion + snapshot — legitimate UI change, snapshot inspected).
- [x] `yarn lint` zero.
- [x] `yarn tsc` zero.
- [x] Full `yarn test --watchAll=false` — 324 suites, zero failures, zero
      console output.
- [ ] Remind to remove TASK-\* tracking files before merge.

## Notes

- Data model already exposed `reallexikon` as an array, so only the badge
  presentation changed; no domain/repository changes needed.
- Process correction: these TASK-\*.md tracking files were initially missed for
  this task and created after the code change to comply with the mandatory
  per-task TODO/log convention.
