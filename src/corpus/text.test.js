// @flow
import _ from 'lodash'
import {
  createText,
  createChapter,
  createManuscript,
  types,
  createLine,
  createManuscriptLine
} from './text'
import type {
  ManuscriptProps,
  ManuscriptLineProps,
  LineProps,
  ChapterProps,
  TextProps
} from './text'
import { periods, periodModifiers } from './period'
import { provenances } from './provenance'
import type { RecordFactory } from 'immutable'
import { List } from 'immutable'
import type { Any } from 'flow-bin'

const manuscriptConfig: ManuscriptProps = {
  id: 1,
  siglumDisambiguator: '1',
  museumNumber: 'BM.X',
  accession: 'X.1',
  periodModifier: periodModifiers.first(),
  period: periods.first(),
  provenance: provenances.first(),
  type: types.first(),
  notes: 'some notes',
  references: List()
}

const manuscrpitLineConfig: ManuscriptLineProps = {
  manuscriptId: 1,
  labels: List.of('iii'),
  number: 'a+1',
  atf: 'kur'
}

const lineConfig: LineProps = {
  number: '2',
  reconstruction: 'reconstructed text',
  manuscripts: List.of(createManuscriptLine(manuscrpitLineConfig))
}

const chapterConfig: ChapterProps = {
  classification: 'Ancient',
  stage: 'Old Babylonian',
  version: 'A',
  name: 'III',
  order: -1,
  manuscripts: List.of(createManuscript(manuscriptConfig)),
  lines: List.of(createLine(lineConfig))
}

const textConfig: TextProps = {
  category: 1,
  index: 1,
  name: 'Palm and Vine',
  numberOfVerses: 930,
  approximateVerses: true,
  chapters: List.of(createChapter(chapterConfig))
}

describe('Text', () => {
  testProperties(textConfig, createText)
})

describe('Chapter', () => {
  testProperties(chapterConfig, createChapter)
})

describe('Manuscript', () => {
  testProperties(manuscriptConfig, createManuscript)
})

describe('Manuscript line', () => {
  testProperties(manuscrpitLineConfig, createManuscriptLine)
})

describe('Line', () => {
  testProperties(lineConfig, createLine)
})

function testProperties (config, factory: RecordFactory<Any>) {
  test.each(_.toPairs(config))('%s', (property, expected) => {
    expect(factory(config)[property]).toEqual(expected)
  })
}
