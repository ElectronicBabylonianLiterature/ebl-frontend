import {
  AlignmentToken,
  LineAlignment,
  ManuscriptAlignment,
  setAlignmentToken,
  setManuscriptAlignment,
  setOmittedWords,
} from 'corpus/domain/alignment'

const kur: AlignmentToken = {
  value: 'kur',
  alignment: null,
  variant: null,
  isAlignable: true,
  suggested: false,
}
const ra: AlignmentToken = { ...kur, value: 'ra', alignment: 1 }
const alignedKur: AlignmentToken = { ...kur, alignment: 3 }
const manuscript: ManuscriptAlignment = {
  alignment: [kur, ra],
  omittedWords: [],
}
const other: ManuscriptAlignment = { alignment: [ra], omittedWords: [2] }

it('sets the alignment of one token and keeps the rest', () => {
  const changed = setAlignmentToken(manuscript, 0, alignedKur)

  expect(changed).toEqual({ alignment: [alignedKur, ra], omittedWords: [] })
  expect(changed.alignment[1]).toBe(ra)
  expect(manuscript.alignment[0]).toBe(kur)
})

it('sets the omitted words and keeps the tokens', () => {
  const changed = setOmittedWords(manuscript, [1, 3])

  expect(changed).toEqual({ alignment: [kur, ra], omittedWords: [1, 3] })
  expect(changed.alignment).toBe(manuscript.alignment)
  expect(manuscript.omittedWords).toEqual([])
})

it('replaces the alignment of one manuscript line of one variant', () => {
  const line: LineAlignment = [[manuscript, other], [other]]

  const changed = setManuscriptAlignment(line, 0, 1, manuscript)

  expect(changed).toEqual([[manuscript, manuscript], [other]])
  expect(changed[1]).toBe(line[1])
  expect(changed[0][0]).toBe(manuscript)
  expect(line[0][1]).toBe(other)
})
