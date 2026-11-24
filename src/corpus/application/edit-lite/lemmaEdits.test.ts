import {
  AnnotationWord,
  listLemmatizableWords,
} from 'corpus/application/edit-lite/annotationWords'
import {
  findLemmaToken,
  isSameLemmaToken,
  listChangedWords,
  resetWordLemmas,
  setWordLemma,
} from 'corpus/application/edit-lite/lemmaEdits'
import { LineLemmatization } from 'corpus/domain/lemmatization'
import { Line } from 'corpus/domain/line'
import { buildEditLiteLines } from 'corpus/ui/edit-lite/editLite.testSupport'
import {
  annotateLine,
  buildDictionaryWord,
  buildLineLemmatization,
} from 'corpus/ui/edit-lite/editLiteTokens.testSupport'
import { buildAlignedLine } from 'corpus/ui/edit-lite/fakeAnnotationRequests.testSupport'
import Lemma from 'transliteration/domain/Lemma'

const line: Line = annotateLine(buildAlignedLine(buildEditLiteLines(1)[0]))
const words = listLemmatizableWords(line)
const [enuma, elish, firstEnuma, firstElish, secondElish] = words
const lemma = new Lemma(buildDictionaryWord('eliš'))
const otherLemma = new Lemma(buildDictionaryWord('eliš', 'II'))
const [[reconstruction, manuscripts]] = buildLineLemmatization(line)
const loaded: LineLemmatization[] = [
  [
    [
      reconstruction[0],
      reconstruction[1].setUniqueLemma([otherLemma], true),
      ...reconstruction.slice(2),
    ],
    manuscripts,
  ],
]

function listLemmas(
  lemmatization: readonly LineLemmatization[],
  listed: readonly AnnotationWord[] = words,
): [string[], boolean][] {
  return listed.map((word) => {
    const token = findLemmaToken(lemmatization, word)
    return [
      (token.uniqueLemma ?? []).map((item) => item.value),
      token.suggested,
    ]
  })
}

test('a lemma set on a reconstruction word is suggested for the words aligned to it', () => {
  const changed = setWordLemma(loaded, line, elish, [lemma])

  expect(listLemmas(changed)).toEqual([
    [['eliš II'], true],
    [['eliš I'], false],
    [[], false],
    [['eliš I'], true],
    [['eliš I'], true],
  ])
  expect(listLemmas(setWordLemma(changed, line, elish, []))).toEqual([
    [['eliš II'], true],
    [[], false],
    [[], false],
    [[], false],
    [[], false],
  ])
  expect(listLemmas(loaded)).toEqual([
    [['eliš II'], true],
    [[], false],
    [[], false],
    [[], false],
    [[], false],
  ])
})

test('a lemma set on a manuscript word stays on that word and is kept by later suggestions', () => {
  const changed = setWordLemma(
    setWordLemma(loaded, line, firstElish, [otherLemma]),
    line,
    elish,
    [lemma],
  )

  expect(listLemmas(changed, [elish, firstElish, secondElish])).toEqual([
    [['eliš I'], false],
    [['eliš II'], false],
    [['eliš I'], true],
  ])
  expect(findLemmaToken(changed, enuma)).toBe(findLemmaToken(loaded, enuma))
})

test('a reset word shows what was loaded and takes its suggestions with it', () => {
  const accepted = setWordLemma(loaded, line, enuma, [otherLemma])
  const changed = setWordLemma(
    setWordLemma(accepted, line, elish, [lemma]),
    line,
    firstElish,
    [lemma],
  )
  const reset = resetWordLemmas(changed, loaded, line, [elish])

  expect(listLemmas(accepted)[2]).toEqual([['eliš II'], true])
  expect(listLemmas(reset)).toEqual([
    [['eliš II'], false],
    [[], false],
    [['eliš II'], true],
    [['eliš I'], false],
    [[], false],
  ])
  expect(
    listLemmas(resetWordLemmas(reset, loaded, line, [enuma, firstElish])),
  ).toEqual(listLemmas(loaded))
  expect(listLemmas(resetWordLemmas(changed, loaded, line, []))).toEqual(
    listLemmas(changed),
  )
})

test('changed words differ from what was loaded in their lemma or in being accepted', () => {
  const accepted = setWordLemma(loaded, line, enuma, [otherLemma])
  const changed = setWordLemma(accepted, line, firstElish, [lemma])

  expect(listChangedWords(loaded, loaded, words)).toEqual([])
  expect(listChangedWords(accepted, loaded, words)).toEqual([enuma, firstEnuma])
  expect(listChangedWords(changed, loaded, words)).toEqual([
    enuma,
    firstEnuma,
    firstElish,
  ])
  expect(listChangedWords(changed, loaded, [elish, secondElish])).toEqual([])
  expect(
    isSameLemmaToken(
      findLemmaToken(accepted, enuma),
      findLemmaToken(loaded, enuma),
    ),
  ).toBe(false)
  expect(
    isSameLemmaToken(
      findLemmaToken(changed, firstElish),
      findLemmaToken(
        setWordLemma(loaded, line, firstElish, [lemma]),
        firstElish,
      ),
    ),
  ).toBe(true)
})
