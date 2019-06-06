// @flow
import { OrderedMap } from 'immutable'
import Reference from '../bibliography/Reference'
import type { Period, PeriodModifier } from './period'
import { periodModifiers, periods } from './period'
import type { Provenance } from './provenance'
import { provenances } from './provenance'
import { produce } from 'immer'
import { $Shape } from 'flow-bin'

export type ManuscriptType = { +name: string, +abbreviation: string }
export const types: OrderedMap<string, ManuscriptType> = OrderedMap({
  Library: { name: 'Library', abbreviation: '' },
  School: { name: 'School', abbreviation: 'Sch' },
  Varia: { name: 'Varia', abbreviation: 'Var' },
  Commentary: { name: 'Commentary', abbreviation: 'Com' },
  Quotation: { name: 'Quotation', abbreviation: 'Quo' }
})

export type Manuscript = {
  id: ?number,
  siglumDisambiguator: string,
  museumNumber: string,
  accession: string,
  periodModifier: PeriodModifier,
  period: Period,
  provenance: Provenance,
  type: ManuscriptType,
  notes: string,
  references: Array<Reference>
}
export const createManuscript: ($Shape<Manuscript>) => Manuscript = produce(
  draft => ({
    id: null,
    siglumDisambiguator: '',
    museumNumber: '',
    accession: '',
    periodModifier: periodModifiers.get('None'),
    period: periods.get('Neo-Assyrian'),
    provenance: provenances.get('Nineveh'),
    type: types.get('Library'),
    notes: '',
    references: [],
    ...draft
  })
)

export type ManuscriptLine = {
  manuscriptId: number,
  labels: Array<string>,
  number: string,
  atf: string
}
export const createManuscriptLine: (
  $Shape<ManuscriptLine>
) => ManuscriptLine = produce(draft => ({
  manuscriptId: 0,
  labels: [],
  number: '',
  atf: '',
  ...draft
}))

export type Line = {
  number: string,
  reconstruction: string,
  manuscripts: Array<ManuscriptLine>
}
export const createLine: ($Shape<Line>) => Line = produce(draft => ({
  number: '',
  reconstruction: '',
  manuscripts: [],
  ...draft
}))

export type Chapter = {
  classification: string,
  stage: string,
  version: string,
  name: string,
  order: number,
  manuscripts: Array<Manuscript>,
  lines: Array<Line>
}
export const createChapter: ($Shape<Chapter>) => Chapter = produce(draft => ({
  classification: 'Ancient',
  stage: 'Neo-Assyrian',
  version: '',
  name: '',
  order: 0,
  manuscripts: [],
  lines: [],
  ...draft
}))

export type Text = {
  category: number,
  index: number,
  name: string,
  numberOfVerses: number,
  approximateVerses: boolean,
  chapters: Array<Chapter>
}
export const createText: ($Shape<Text>) => Text = produce(draft => ({
  category: 0,
  index: 0,
  name: '',
  numberOfVerses: 0,
  approximateVerses: false,
  chapters: [],
  ...draft
}))
