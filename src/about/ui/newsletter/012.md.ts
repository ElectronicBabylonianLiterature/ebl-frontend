const newsletter = `
# eBL Newsletter 12

## 23 February 2023

### Fragmentarium

- eBL public!
- ⅓ = ŠUŠANA, ⅔ = ŠANABI, and ⅙ = KINGUSILI can now be entered. Shortcuts:
  Ctrl - 1 = ½, Ctrl + 2 = ⅔, etc.
- New grammar for links: @url{URL}{Text to display}
- Seals are now a label, so line numbers can be repeated in successive seals, e.g.,
  @seal 1, @seal 2 etc.
- The large collection of Geers folios (ca. 4000 folios), once in the Oriental
  Institute, is now imported into the Fragmentarium.
- SpTU 5 photos are now imported (visible to CAIC editors).
- Search for lemmata is now implemented.
- Date is now a strict category that can be modified on the frontend.

New, experimental features in the editor:

- Auto-completion: markup and other control expressions (like #note: ...) can be
  selected from a pop-up. Note that you can use the Tab key to switch to the next
  position in the template, e.g., if you select @bib{id@pages}, you can start
  right away to type the id, then press Tab to go to the pages directly, enter
  the pages, and press Tab again when you're finished to get to the end of the
  expression.
- When pressing Enter, the line number gets inserted automatically (if the
  following line is empty).
- You can now select lines and press Ctrl+Shift+UP or Ctrl+Shift+DOWN to
  increase/decrease the line numbers of all selected lines. This way there's no
  need to manually update subsequent line numbers when editing line numbers at
  the top.

### Dictionary

- The dictionary search has been thoroughly modified. It is now possible to search
  for multiple criteria, enter diacritics on the application, and use wildcards.
- Matching lemmata from Fragmentarium and Corpus are now shown on the Dictionary
  page.
- Logograms are now displayed in the dictionary.

### Corpus

- The Corpus is now cached. Loading the pages should be much faster.`

export default newsletter
