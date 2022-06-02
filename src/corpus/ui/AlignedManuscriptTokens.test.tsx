import {
  alignedLine,
  alignedLineWithVariants,
  alignedManuscript,
  alignedManuscriptWithVariants,
} from 'test-support/test-aligned-manuscript-tokens'
import { createAlignmentMap } from './AlignedManuscriptTokens'

test('createAlignmentMap', () => {
  const manuscriptLines = [alignedManuscript]
  const tokenIndex = 1
  const alignmentMap = new Map([
    [
      'DINGIR-MEŠ',
      {
        token: alignedLine.content[0],
        sigla: [alignedManuscript.siglum],
        isVariant: false,
      },
    ],
  ])
  expect(alignmentMap).toEqual(createAlignmentMap(manuscriptLines, tokenIndex))
})

test('createAlignmentMap with variants', () => {
  const manuscriptLines = [alignedManuscript, alignedManuscriptWithVariants]
  const tokenIndex = 2
  const alignmentMap = new Map([
    [
      'uš-ha-qa',
      {
        token: alignedLineWithVariants.content[0],
        sigla: [alignedManuscriptWithVariants.siglum],
        isVariant: false,
      },
    ],
    [
      'u₂-šah-maṭ',
      {
        token: alignedLineWithVariants.content[1],
        sigla: [alignedManuscriptWithVariants.siglum],
        isVariant: true,
      },
    ],
  ])
  expect(alignmentMap).toEqual(createAlignmentMap(manuscriptLines, tokenIndex))
})
