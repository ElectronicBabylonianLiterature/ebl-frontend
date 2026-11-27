import {
  findLemmaToken,
  isSameLemmaToken,
  listChangedWords,
  resetWordLemmas,
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
  secondElish,
  stored,
  words,
} from 'corpus/application/edit-lite/lemmaEdits.testSupport'

test('a reset word shows what was loaded and resets the lemmas carried from it', () => {
  const acceptedEnuma = setWordLemma(loaded, loaded, line, enuma, [otherLemma])
  const changed = setWordLemma(acceptedEnuma, loaded, line, elish, [lemma])
  const reset = resetWordLemmas(changed, loaded, line, [elish])

  expect(listLemmas(acceptedEnuma)[2]).toEqual(otherAccepted)
  expect(listLemmas(reset)).toEqual([
    otherAccepted,
    empty,
    otherAccepted,
    empty,
    empty,
  ])
  expect(listLemmas(resetWordLemmas(reset, loaded, line, [enuma]))).toEqual(
    listLemmas(loaded),
  )
  expect(listLemmas(resetWordLemmas(changed, loaded, line, []))).toEqual(
    listLemmas(changed),
  )
})

test('a reset reconstruction word leaves an aligned word with a stored lemma as it is', () => {
  const chosen = setWordLemma(stored, stored, line, firstElish, [lemma])
  const changed = setWordLemma(chosen, stored, line, elish, [otherLemma])
  const reset = resetWordLemmas(changed, stored, line, [elish])

  expect(listLemmas(reset, [elish, firstElish, secondElish])).toEqual([
    empty,
    accepted,
    empty,
  ])
  expect(
    listLemmas(resetWordLemmas(reset, stored, line, [firstElish])),
  ).toEqual(listLemmas(stored))
})

test('changed words differ from what was loaded in their lemma or in being accepted', () => {
  const acceptedEnuma = setWordLemma(loaded, loaded, line, enuma, [otherLemma])
  const changed = setWordLemma(acceptedEnuma, loaded, line, firstElish, [lemma])

  expect(listChangedWords(loaded, loaded, words)).toEqual([])
  expect(listChangedWords(acceptedEnuma, loaded, words)).toEqual([
    enuma,
    firstEnuma,
  ])
  expect(listChangedWords(changed, loaded, words)).toEqual([
    enuma,
    firstEnuma,
    firstElish,
  ])
  expect(listChangedWords(changed, loaded, [elish, secondElish])).toEqual([])
  expect(
    isSameLemmaToken(
      findLemmaToken(acceptedEnuma, enuma),
      findLemmaToken(loaded, enuma),
    ),
  ).toBe(false)
  expect(
    isSameLemmaToken(
      findLemmaToken(changed, firstElish),
      findLemmaToken(
        setWordLemma(loaded, loaded, line, firstElish, [lemma]),
        firstElish,
      ),
    ),
  ).toBe(true)
})
