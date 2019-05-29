// @flow
import type { RecordFactory, RecordOf } from 'immutable'
import { List, OrderedMap, Record } from 'immutable'
import Reference from '../bibliography/Reference'
import type { Period, PeriodModifier } from './period'
import { periodModifiers, periods } from './period'
import type { Provenance } from './provenance'
import { provenances } from './provenance'

type ManuscriptTypeProps = { name: string, abbreviation: string }
const createManuscriptType: RecordFactory<ManuscriptTypeProps> = Record({
  name: '',
  abbreviation: ''
})
export type ManuscriptType = RecordOf<ManuscriptTypeProps>
export const types: OrderedMap<string, ManuscriptType> = OrderedMap({
  Library: createManuscriptType({ name: 'Library', abbreviation: '' }),
  School: createManuscriptType({ name: 'School', abbreviation: 'Sch' }),
  Varia: createManuscriptType({ name: 'Varia', abbreviation: 'Var' }),
  Commentary: createManuscriptType({ name: 'Commentary', abbreviation: 'Com' }),
  Quotation: createManuscriptType({ name: 'Quotation', abbreviation: 'Quo' })
})

type ManuscriptProps = {
  id: ?number,
  siglumDisambiguator: string,
  museumNumber: string,
  accession: string,
  periodModifier: PeriodModifier,
  period: Period,
  provenance: Provenance,
  type: ManuscriptType,
  notes: string,
  references: List<Reference>
}
export const createManuscript: RecordFactory<ManuscriptProps> = Record({
  id: null,
  siglumDisambiguator: '',
  museumNumber: '',
  accession: '',
  periodModifier: periodModifiers.get('None'),
  period: periods.get('Neo-Assyrian'),
  provenance: provenances.get('Nineveh'),
  type: types.get('Library'),
  notes: '',
  references: List()
})
export type Manuscript = RecordOf<ManuscriptProps>

type ManuscriptLineProps = {
  manuscriptId: number,
  labels: List<string>,
  number: string,
  atf: string
}
export const createManuscriptLine: RecordFactory<ManuscriptLineProps> = Record({
  manuscriptId: 0,
  labels: List(),
  number: '',
  atf: ''
})
export type ManuscriptLine = RecordOf<ManuscriptLineProps>

type LineProps = {
  number: string,
  reconstruction: string,
  manuscripts: List<ManuscriptLine>
}
export const createLine: RecordFactory<LineProps> = Record({
  number: '',
  reconstruction: '',
  manuscripts: List()
})
export type Line = RecordOf<LineProps>

type ChapterProps = {
  classification: string,
  stage: string,
  version: string,
  name: string,
  order: number,
  manuscripts: List<Manuscript>,
  lines: List<Line>
}
export const createChapter: RecordFactory<ChapterProps> = Record({
  classification: 'Ancient',
  stage: 'Neo-Assyrian',
  version: '',
  name: '',
  order: 0,
  manuscripts: List(),
  lines: List()
})
export type Chapter = RecordOf<ChapterProps>

type TextProps = {
  category: number,
  index: number,
  name: string,
  numberOfVerses: number,
  approximateVerses: boolean,
  chapters: List<Chapter>
}
export const createText: RecordFactory<TextProps> = Record({
  category: 0,
  index: 0,
  name: '',
  numberOfVerses: 0,
  approximateVerses: false,
  chapters: List()
})
export type Text = RecordOf<TextProps>
