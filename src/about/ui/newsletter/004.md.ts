const newsletter = `
# eBL Newsletter 4

## 8 June 2021

### Fragmentarium

#### First Iteration of the Corpus Search

- The transliteration search under [Fragmentarium](https://www.ebl.lmu.de/fragmentarium/)
  now also queries the texts which have been imported into the Corpus.

#### First Iteration of the Sign Search

- Under [Signs](https://www.ebl.lmu.de/signs/) you can search for cuneiform signs
  via any reading or by a number from the common sign lists. The results will
  show a standardised Neo-Assyrian form, all the readings, and a summary of the
  respective entries in MZL (by permission from the Ugarit-Verlag).

#### New Folios and Legacy Transliterations

- Thanks to the generosity of U. Gabbay, M.J. Geller, and the academic executors
  of F.W. Geers and E. Reiner, the legacy data that is essential to the ongoing
  compilation of a comprehensive Fragmentarium has once more been enriched and
  expanded.

#### Translations in the Fragmentarium and the Corpus

- It is now possible to add translations to transliterations in the Fragmentarium
  and to Lines of Text in the Corpus. For Details see section 2.9 of our
  [Editorial Conventions](<https://github.com/ElectronicBabylonianLiterature/generic-documentation/wiki/Editorial-conventions-(Corpus)#29-translation>).

### Corpus

#### Conventions

- With the start of the import of text editions into the Corpus a number of minor
  changes to the Conventions had to be introduced:
- Normalised text is prepended with the newly introduced language shift %n, see
  the examples 
  [here](https://github.com/ElectronicBabylonianLiterature/generic-documentation/wiki/Editorial-conventions-(Corpus)#210-canonical-examples).
- All \\$-lines, //-lines, and #note-lines each begin in a new line below the
  Manuscript Line or Line of Text they refer to. Note that if a line is omitted,
  the siglum does not have a period at the end, see the example
  [here](https://github.com/ElectronicBabylonianLiterature/generic-documentation/wiki/Editorial-conventions-(Corpus)#2411-editorial-annotations-and-interventions>).
- The import tool is not able to parse the critical apparatus. Hence variants are
  removed from the score before uploading. They are entered during the alignment.`

export default newsletter
