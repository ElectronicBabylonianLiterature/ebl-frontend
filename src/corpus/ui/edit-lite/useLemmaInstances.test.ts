import { WordInstances } from 'corpus/application/edit-lite/ChapterEditSource'
import { buildDictionaryWord } from 'corpus/ui/edit-lite/editLiteTokens.testSupport'
import {
  describeInstances,
  describeLemma,
  describeReplacedLemmas,
} from 'corpus/ui/edit-lite/useLemmaInstances'
import Lemma from 'transliteration/domain/Lemma'

function buildInstances(config: Partial<WordInstances>): WordInstances {
  return {
    word: 'kur',
    words: 0,
    lemmatized: 0,
    lines: [],
    revision: 'revision-1',
    ...config,
  }
}

test.each<[number, number[], string]>([
  [1, [4], '1 word in 1 line of this chapter.'],
  [2, [4], '2 words in 1 line of this chapter.'],
  [7, [0, 4, 9], '7 words in 3 lines of this chapter.'],
])(
  '%s instances in the lines %p are counted in words',
  (words, lines, text) => {
    expect(describeInstances(buildInstances({ words, lines }))).toBe(text)
  },
)

test.each<[number, string]>([
  [1, '1 of them already has a lemma, which will be replaced.'],
  [3, '3 of them already have a lemma, which will be replaced.'],
])(
  '%s instances with a lemma are announced as replaced',
  (lemmatized, text) => {
    expect(describeReplacedLemmas(buildInstances({ lemmatized }))).toBe(text)
  },
)

test('a complex lemma is named by all of its lemmas', () => {
  expect(
    describeLemma([
      new Lemma(buildDictionaryWord('eliš')),
      new Lemma(buildDictionaryWord('eliš', 'II')),
    ]),
  ).toBe('eliš, eliš II')
  expect(describeLemma([])).toBe('')
})
