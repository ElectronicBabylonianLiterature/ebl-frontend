import {
  compareGlossaryEntries,
  GlossaryEntry,
} from 'transliteration/domain/glossary'
import Label from 'transliteration/domain/Label'
import { lemmatized } from 'test-support/lines/text-lemmatization'
import { createDictionaryWord } from 'test-support/glossary'
import { isWord } from 'transliteration/domain/type-guards'
import DictionaryWord from 'dictionary/domain/Word'

const [token] = lemmatized[0].content.filter(isWord)

function entry(dictionaryWord: DictionaryWord | null): GlossaryEntry {
  return [
    token.uniqueLemma[0],
    [
      {
        label: new Label(),
        value: token.value,
        word: token,
        uniqueLemma: token.uniqueLemma[0],
        dictionaryWord,
      },
    ],
  ]
}

test('compares entries by their dictionary words', () => {
  expect(
    compareGlossaryEntries(
      entry(createDictionaryWord('hepû I')),
      entry(createDictionaryWord('hepû II')),
    ),
  ).toBeLessThan(0)
})

test('rejects entries without a dictionary word', () => {
  expect(() =>
    compareGlossaryEntries(entry(createDictionaryWord('hepû I')), entry(null)),
  ).toThrow('Either of the glossary entries is missing the dictionary word.')
})
