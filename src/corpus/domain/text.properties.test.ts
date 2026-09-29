import { createLine, createManuscriptLine } from 'corpus/domain/line'
import { Manuscript } from 'corpus/domain/manuscript'
import {
  lineConfig,
  manuscriptConfig,
  manuscriptLineConfig,
  testProperties,
} from 'corpus/domain/text.testSupport'

describe('Manuscript', () => {
  testProperties(
    manuscriptConfig,
    () =>
      new Manuscript(
        manuscriptConfig.id,
        manuscriptConfig.siglumDisambiguator,
        manuscriptConfig.oldSigla,
        manuscriptConfig.museumNumber,
        manuscriptConfig.accession,
        manuscriptConfig.periodModifier,
        manuscriptConfig.period,
        manuscriptConfig.provenance,
        manuscriptConfig.type,
        manuscriptConfig.notes,
        manuscriptConfig.colophon,
        manuscriptConfig.unplacedLines,
        manuscriptConfig.references,
        manuscriptConfig.joins,
        manuscriptConfig.isInFragmentarium,
      ),
  )
})

describe('Manuscript line', () => {
  testProperties(manuscriptLineConfig, createManuscriptLine)
})

describe('Line', () => {
  testProperties(lineConfig, createLine)
})
