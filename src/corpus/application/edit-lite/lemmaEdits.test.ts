import {
  findLemmaToken,
  setWordLemma,
} from 'corpus/application/edit-lite/lemmaEdits'
import {
  accepted,
  elish,
  empty,
  enuma,
  firstElish,
  firstEnuma,
  lemma,
  line,
  listLemmas,
  loaded,
  otherAccepted,
  otherLemma,
  otherSuggested,
  secondElish,
  stored,
} from 'corpus/application/edit-lite/lemmaEdits.testSupport'
import {
  createManuscriptLine,
  createVariant,
  Line,
  ManuscriptLine,
} from 'corpus/domain/line'
import { buildLineLemmatization } from 'corpus/ui/edit-lite/editLiteTokens.testSupport'
import { Token } from 'transliteration/domain/token'

function withoutLemmatizableToken(
  manuscriptLine: ManuscriptLine,
  tokenIndex: number,
): ManuscriptLine {
  return createManuscriptLine({
    ...manuscriptLine,
    atfTokens: manuscriptLine.atfTokens.map((token, index) =>
      index === tokenIndex
        ? ({ ...token, lemmatizable: false } as Token)
        : token,
    ),
  })
}

const [variant] = line.variants
const unlemmatizableLine: Line = {
  ...line,
  variants: [
    createVariant({
      ...variant,
      manuscripts: [
        variant.manuscripts[0],
        withoutLemmatizableToken(variant.manuscripts[1], 3),
      ],
    }),
  ],
}

test('a lemma set on a reconstruction word is accepted for the aligned words without a stored lemma', () => {
  const changed = setWordLemma(loaded, loaded, line, elish, [lemma])

  expect(listLemmas(changed)).toEqual([
    otherSuggested,
    accepted,
    empty,
    accepted,
    accepted,
  ])
  expect(listLemmas(loaded)).toEqual([
    otherSuggested,
    empty,
    empty,
    empty,
    empty,
  ])
})

test('the carried lemmas follow a later lemma of the reconstruction word', () => {
  const changed = setWordLemma(loaded, loaded, line, elish, [lemma])

  expect(
    listLemmas(setWordLemma(changed, loaded, line, elish, [otherLemma])),
  ).toEqual([
    otherSuggested,
    otherAccepted,
    empty,
    otherAccepted,
    otherAccepted,
  ])
  expect(listLemmas(setWordLemma(changed, loaded, line, elish, []))).toEqual([
    otherSuggested,
    empty,
    empty,
    empty,
    empty,
  ])
})

test('an aligned word with a stored lemma keeps its lemma', () => {
  const changed = setWordLemma(stored, stored, line, elish, [lemma])
  const chosen = setWordLemma(stored, stored, line, firstElish, [lemma])

  expect(listLemmas(changed, [elish, firstElish, secondElish])).toEqual([
    accepted,
    otherAccepted,
    accepted,
  ])
  expect(
    listLemmas(setWordLemma(chosen, stored, line, elish, [otherLemma]), [
      elish,
      firstElish,
      secondElish,
    ]),
  ).toEqual([otherAccepted, accepted, otherAccepted])
})

test('words not aligned to the reconstruction word or not lemmatizable are left alone', () => {
  const changed = setWordLemma(loaded, loaded, line, elish, [lemma])
  const unlemmatizable = buildLineLemmatization(unlemmatizableLine)
  const changedUnlemmatizable = setWordLemma(
    unlemmatizable,
    unlemmatizable,
    unlemmatizableLine,
    elish,
    [lemma],
  )

  expect(findLemmaToken(changed, enuma)).toBe(findLemmaToken(loaded, enuma))
  expect(findLemmaToken(changed, firstEnuma)).toBe(
    findLemmaToken(loaded, firstEnuma),
  )
  expect(findLemmaToken(changedUnlemmatizable, secondElish)).toBe(
    findLemmaToken(unlemmatizable, secondElish),
  )
  expect(
    listLemmas(changedUnlemmatizable, [elish, firstElish, secondElish]),
  ).toEqual([accepted, accepted, empty])
})

test('a lemma set on a manuscript word stays on that word until the reconstruction word changes', () => {
  const changed = setWordLemma(loaded, loaded, line, firstElish, [lemma])

  expect(listLemmas(changed)).toEqual([
    otherSuggested,
    empty,
    empty,
    accepted,
    empty,
  ])
  expect(
    listLemmas(setWordLemma(changed, loaded, line, elish, [otherLemma])),
  ).toEqual([
    otherSuggested,
    otherAccepted,
    empty,
    otherAccepted,
    otherAccepted,
  ])
})
