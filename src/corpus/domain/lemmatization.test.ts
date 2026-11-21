import {
  LineLemmatization,
  setManuscriptLemma,
  setReconstructionLemma,
} from 'corpus/domain/lemmatization'
import {
  createManuscriptLine,
  createVariant,
  LineVariant,
} from 'corpus/domain/line'
import { wordFactory } from 'test-support/word-fixtures'
import Lemma from 'transliteration/domain/Lemma'
import {
  LemmatizationToken,
  UniqueLemma,
} from 'transliteration/domain/Lemmatization'
import { Token } from 'transliteration/domain/token'

const lemma: UniqueLemma = [new Lemma(wordFactory.build())]
const oldLemma: UniqueLemma = [new Lemma(wordFactory.build())]

function word(value: string, alignment: number | null): Token {
  return { type: 'Word', value, lemmatizable: true, alignment } as Token
}

const variant: LineVariant = createVariant({
  reconstruction: 'kur ra',
  manuscripts: [
    createManuscriptLine({
      atfTokens: [
        word('empty', 1),
        word('suggested', 1),
        word('lemmatized', 1),
        word('elsewhere', 0),
        word('unaligned', null),
        { type: 'UnknownNumberOfSigns', value: '...' } as Token,
      ],
    }),
    createManuscriptLine({ atfTokens: [word('second', 1)] }),
  ],
})
const lemmatization: LineLemmatization = [
  [
    new LemmatizationToken('kur', true, [], []),
    new LemmatizationToken('ra', true, [], []),
  ],
  [
    [
      new LemmatizationToken('empty', true, [], []),
      new LemmatizationToken('suggested', true, oldLemma, [], true),
      new LemmatizationToken('lemmatized', true, oldLemma, []),
      new LemmatizationToken('elsewhere', true, [], []),
      new LemmatizationToken('unaligned', true, [], []),
      new LemmatizationToken('...', false),
    ],
    [new LemmatizationToken('second', true, null, [])],
  ],
]

describe('setReconstructionLemma', () => {
  const [reconstruction, [first, second]] = setReconstructionLemma(
    lemmatization,
    variant,
    1,
    lemma,
  )

  it('sets the lemma of the reconstruction word as a value', () => {
    expect(reconstruction).toEqual([
      lemmatization[0][0],
      new LemmatizationToken('ra', true, lemma, []),
    ])
  })

  it('suggests it for the aligned words without a lemma of their own', () => {
    expect(first.slice(0, 2)).toEqual([
      new LemmatizationToken('empty', true, lemma, [], true),
      new LemmatizationToken('suggested', true, lemma, [], true),
    ])
    expect(second).toEqual([
      new LemmatizationToken('second', true, lemma, [], true),
    ])
  })

  it('leaves every other word as it is', () => {
    expect(first.slice(2)).toEqual(lemmatization[1][0].slice(2))
  })

  it('does not change the lemmatization it was given', () => {
    expect(lemmatization[0][1].uniqueLemma).toEqual([])
    expect(lemmatization[1][0][0].uniqueLemma).toEqual([])
  })
})

describe('setManuscriptLemma', () => {
  const changed = setManuscriptLemma(lemmatization, 0, 3, lemma)

  it('sets the lemma of the one manuscript word as a value', () => {
    expect(changed[1][0][3]).toEqual(
      new LemmatizationToken('elsewhere', true, lemma, []),
    )
  })

  it('keeps the reconstruction and every other word', () => {
    expect(changed[0]).toBe(lemmatization[0])
    expect(changed[1][1]).toBe(lemmatization[1][1])
    expect(changed[1][0].filter((_token, index) => index !== 3)).toEqual(
      lemmatization[1][0].filter((_token, index) => index !== 3),
    )
  })
})
