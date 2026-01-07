import Word from 'dictionary/domain/Word'

export const wordDto: Word = {
  _id: 'test I',
  lemma: ['test'],
  attested: true,
  legacyLemma: 'test',
  homonym: 'I',
  forms: [
    {
      lemma: [''],
      notes: ['dsdsds'],
      attested: true,
    },
    {
      lemma: ["abā'um"],
      notes: ['**BOLD**'],
      attested: true,
    },
  ],
  meaning: '\\~ "to weed" O/jB',
  amplifiedMeanings: [
    {
      meaning: '(*i/i*) field',
      vowels: [
        {
          value: ['i', 'i'],
          notes: ['dsdsds'],
        },
      ],
      key: 'G',
      entries: [
        {
          meaning: 'mmkkk',
          vowels: [
            {
              value: [''],
              notes: [],
            },
          ],
        },
      ],
    },
  ],
  logograms: [
    {
      logogram: [''],
      notes: ['dsadas'],
    },
  ],
  derived: [
    [
      {
        lemma: ['wabûtu'],
        homonym: 'I',
        notes: [],
      },
    ],
  ],
  derivedFrom: {
    lemma: ['sadasd'],
    homonym: '',
    notes: [''],
  },
  source: 'This is a test word!',
  roots: ["wb'", "'b'"],
  pos: ['V'],
  guideWord: 'weed',
  arabicGuideWord: 'weed',
  origin: 'CDA',
  cdaAddenda: '(egg-shaped) bead',
  supplementsAkkadianDictionaries: 'word',
  oraccWords: [],
  akkadischeGlossareUndIndices: [],
}
