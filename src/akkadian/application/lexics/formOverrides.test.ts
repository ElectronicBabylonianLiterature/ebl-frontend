import { getFormOverrideAndTransform } from 'akkadian/application/lexics/formOverrides'
import { AkkadianWord } from 'transliteration/domain/token'

const word: AkkadianWord = {
  value: 'šiāhīšu',
  cleanValue: 'šiāhīšu',
  enclosureType: [],
  erasure: 'NONE',
  parts: [
    {
      value: 'šiāhīšu',
      cleanValue: 'šiāhīšu',
      enclosureType: [],
      erasure: 'NONE',
      type: 'ValueToken',
    },
  ],
  language: 'AKKADIAN',
  normalized: true,
  lemmatizable: true,
  alignable: true,
  uniqueLemma: ['šiāhu I'],
  alignment: null,
  variant: null,
  hasVariantAlignment: false,
  hasOmittedAlignment: false,
  modifiers: [],
  type: 'AkkadianWord',
  sentenceIndex: 2,
}

test.each([
  [
    'ana',
    'ana I',
    {
      initialForm: 'ana',
      overrideForm: 'aš',
      transformedForm: 'aš',
      transformations: {
        transformedForm: 'aš',
        record: [
          {
            initialForm: 'an',
            isSandhi: true,
            transformation: 'assimilation: nC>CC',
            transformedForm: 'aš',
          },
        ],
      },
      isSandhi: true,
      isMidSyllableSandhi: false,
      isStressless: true,
      rules: { nextWordBeginsWith: 'C|A' },
    },
  ],
  [
    'ina',
    'ina I',
    {
      initialForm: 'ina',
      isMidSyllableSandhi: false,
      isSandhi: true,
      isStressless: true,
      overrideForm: 'iš',
      transformedForm: 'iš',
      transformations: {
        transformedForm: 'iš',
        record: [
          {
            initialForm: 'in',
            isSandhi: true,
            transformation: 'assimilation: nC>CC',
            transformedForm: 'iš',
          },
        ],
      },
      rules: { nextWordBeginsWith: 'C|A' },
    },
  ],
])('Converts syllable to meter', (initialForm, uniqueLemma, expected) => {
  expect(
    getFormOverrideAndTransform(initialForm, uniqueLemma, {
      wordContext: { nextWord: word },
    }),
  ).toEqual(expected)
})
