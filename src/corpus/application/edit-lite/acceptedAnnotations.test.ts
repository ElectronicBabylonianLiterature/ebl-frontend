import {
  keepAcceptedAlignment,
  keepAcceptedLemmatization,
  storesSameAlignment,
  storesSameLemmatization,
  toAcceptedAlignmentDto,
  toAcceptedLemmatizationDto,
} from 'corpus/application/edit-lite/acceptedAnnotations'
import { toLineAlignmentDto } from 'corpus/application/chapterDtoSerialization'
import { setAlignmentToken, setOmittedWords } from 'corpus/domain/alignment'
import { LineLemmatization } from 'corpus/domain/lemmatization'
import { createLineAlignment, Line } from 'corpus/domain/line'
import {
  buildAnnotatedLines,
  buildDictionaryWord,
  buildLineLemmatization,
} from 'corpus/ui/edit-lite/editLiteTokens.testSupport'
import Lemma from 'transliteration/domain/Lemma'

const [line]: readonly Line[] = buildAnnotatedLines(1)
const alignment = createLineAlignment(line)
const [[firstManuscript, secondManuscript]] = alignment
const [suggestedToken, otherToken] = firstManuscript.alignment
const lemma = new Lemma(buildDictionaryWord('eliš'))
const [[reconstruction, manuscripts]] = buildLineLemmatization(line)
const lemmatization: LineLemmatization[] = [
  [
    [
      reconstruction[0],
      reconstruction[1].setUniqueLemma([lemma], true),
      reconstruction[2],
      reconstruction[3].setUniqueLemma([lemma]),
    ],
    [
      [manuscripts[0][0].setUniqueLemma([lemma], true), manuscripts[0][1]],
      manuscripts[1],
    ],
  ],
]

test('an alignment that is still a suggestion is stored as no alignment', () => {
  const accepted = setAlignmentToken(firstManuscript, 0, {
    ...suggestedToken,
    variant: { value: 'e-nu', type: 'Word', language: 'AKKADIAN' },
    suggested: false,
  } as typeof suggestedToken)
  const kept = keepAcceptedAlignment([[accepted, secondManuscript]])

  expect(suggestedToken).toMatchObject({ alignment: 1, suggested: true })
  expect(kept[0][0].alignment).toEqual([
    accepted.alignment[0],
    { ...otherToken, alignment: null, variant: null, suggested: false },
  ])
  expect(kept[0][0].alignment[0]).toBe(accepted.alignment[0])
  expect(kept[0][1].alignment[3]).toMatchObject({
    alignment: null,
    suggested: false,
  })
  expect(kept[0][1].omittedWords).toBe(secondManuscript.omittedWords)
  expect(toAcceptedAlignmentDto([[accepted, secondManuscript]])).toEqual(
    toLineAlignmentDto(kept),
  )
  expect(toAcceptedAlignmentDto(alignment)[0][0].alignment).toEqual([
    { value: 'e-nu-ma', alignment: null, variant: '', type: '', language: '' },
    { value: 'e-liš', alignment: null, variant: '', type: '', language: '' },
  ])
})

test('a lemma that is still a suggestion is stored as no lemma', () => {
  const [[keptReconstruction, keptManuscripts]] =
    keepAcceptedLemmatization(lemmatization)

  expect(keptReconstruction.map((token) => token.uniqueLemma)).toEqual([
    null,
    [],
    null,
    [lemma],
  ])
  expect(keptReconstruction[3]).toBe(lemmatization[0][0][3])
  expect(keptReconstruction[1].suggested).toBe(false)
  expect(keptManuscripts[0].map((token) => token.uniqueLemma)).toEqual([[], []])
  const [dto] = toAcceptedLemmatizationDto(lemmatization)

  expect(dto.reconstruction.map((token) => token.uniqueLemma)).toEqual([
    undefined,
    [],
    undefined,
    ['eliš I'],
  ])
  expect(dto.manuscripts.flat().map((token) => token.uniqueLemma)).toEqual([
    [],
    [],
    undefined,
    undefined,
    undefined,
    [],
  ])
})

test('values that differ only in suggestions store the same', () => {
  const unaligned = keepAcceptedAlignment(alignment)
  const omitted = [[setOmittedWords(firstManuscript, [1]), secondManuscript]]
  const suggestedOnly: LineLemmatization[] = [
    [[...reconstruction], lemmatization[0][1]],
  ]

  expect(storesSameAlignment(alignment, unaligned)).toBe(true)
  expect(storesSameAlignment(alignment, omitted)).toBe(false)
  expect(
    storesSameAlignment(alignment, [
      [
        setAlignmentToken(firstManuscript, 0, {
          ...suggestedToken,
          suggested: false,
        }),
        secondManuscript,
      ],
    ]),
  ).toBe(false)
  expect(
    storesSameLemmatization(suggestedOnly, buildLineLemmatization(line)),
  ).toBe(true)
  expect(
    storesSameLemmatization(lemmatization, buildLineLemmatization(line)),
  ).toBe(false)
})
