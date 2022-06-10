import {
  alignedLine,
  alignedLineWithVariants,
  alignedManuscript,
  alignedManuscriptWithVariants,
} from 'test-support/test-aligned-manuscript-tokens'
import { LemmatizableToken } from 'transliteration/domain/token'
import {
  createAlignmentMap,
  AlignmentLineDisplay,
} from './AlignedManuscriptTokens'

test('createAlignmentMap', () => {
  const manuscriptLines = [alignedManuscript]
  const alignIndex = 1
  const alignmentMap = new Map([
    [
      'DINGIR-MEŠ',
      new AlignmentLineDisplay(
        alignedLine.content[0] as LemmatizableToken,
        alignedManuscript.siglum
      ),
    ],
  ])
  expect(alignmentMap).toEqual(createAlignmentMap(manuscriptLines, alignIndex))
})

test('createAlignmentMap with variants', () => {
  const manuscriptLines = [alignedManuscript, alignedManuscriptWithVariants]
  const alignIndex = 2
  const alignmentMap = new Map([
    [
      'uš-ha-qa',
      new AlignmentLineDisplay(
        alignedLineWithVariants.content[0] as LemmatizableToken,
        alignedManuscriptWithVariants.siglum
      ),
    ],
    [
      'u₂-šah-maṭ',
      new AlignmentLineDisplay(
        alignedLineWithVariants.content[1] as LemmatizableToken,
        alignedManuscriptWithVariants.siglum
      ),
    ],
  ])
  expect(alignmentMap).toEqual(createAlignmentMap(manuscriptLines, alignIndex))
})
