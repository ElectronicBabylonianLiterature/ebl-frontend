# TASK rla-vol15 — TODO

Issue: "Why is the RlA not shown here? https://www.ebl.lmu.de/tools/realia/Zylinder%20als%20Schrifttr%C3%A4ger — Can you check if that happens in other items?"

- [x] Read `.github/copilot-instructions.md` and follow every gate
- [x] Branch `fix/rla-volume-15-pdf-pages` from `origin/master` with `--no-track`; verify no upstream
- [x] Investigate: fetch the live realia entry and the badw RlA index
- [x] Decide data vs frontend: cross-check every eBL RlA link against the badw index
- [x] Identify root cause (vol. 15 pages are PDFs, parser only accepts `.jpg`)
- [x] Check how the RlA site itself renders vol. 15 pages (`<object type="application/pdf">`)
- [x] `rlaPageIndex.ts`: accept `jpg` and `pdf` page calls, record the page format, build URLs by format
- [x] `ReallexikonArticle.tsx`: render PDF pages in an `<object>` with a fallback link; keep `<img>` for JPG pages
- [x] `Realia.sass`: size the PDF embed to the vol. 15 page aspect ratio
- [x] Tests: parser (pdf rows, format, URL builder), article (pdf embed, fallback link, paging)
- [x] 100% coverage on changed files
- [x] `yarn lint` clean
- [x] `yarn tsc` clean
- [x] `yarn test:ci` zero failures, zero console output (master CI command; `test:ci` not on master yet)
- [x] 250-line ceiling check on changed script files
- [x] Commit (code + task docs in one commit), push, open PR
- [ ] Before merge: remove `TASK-rla-vol15-*.md`
