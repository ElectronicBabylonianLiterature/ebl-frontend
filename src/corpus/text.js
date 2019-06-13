// @flow
import { OrderedMap } from 'immutable'
import Reference from '../bibliography/Reference'
import type { Period, PeriodModifier } from './period'
import { periodModifiers, periods } from './period'
import type { Provenance } from './provenance'
import { provenances } from './provenance'
// $FlowFixMe
import { Draft, immerable, produce } from 'immer'
import _ from 'lodash'

export type ManuscriptType = { +name: string, +abbreviation: string }
export const types: OrderedMap<string, ManuscriptType> = OrderedMap({
  Library: { name: 'Library', abbreviation: '' },
  School: { name: 'School', abbreviation: 'Sch' },
  Varia: { name: 'Varia', abbreviation: 'Var' },
  Commentary: { name: 'Commentary', abbreviation: 'Com' },
  Quotation: { name: 'Quotation', abbreviation: 'Quo' }
})

export class Manuscript {
  id: ?number = null
  siglumDisambiguator: string = ''
  museumNumber: string = ''
  accession: string = ''
  periodModifier: PeriodModifier = periodModifiers.get(
    'None',
    periodModifiers.first()
  )
  period: Period = periods.get('Neo-Assyrian', periods.first())
  provenance: Provenance = provenances.get('Nineveh', provenances.first())
  type: ManuscriptType = types.get('Library', types.first())
  notes: string = ''
  references: $ReadOnlyArray<Reference> = []

  get siglum() {
    return [
      _.get(this, 'provenance.abbreviation', ''),
      _.get(this, 'period.abbreviation', ''),
      _.get(this, 'type.abbreviation', ''),
      this.siglumDisambiguator
    ].join('')
  }
}
Manuscript[immerable] = true

export function createManuscript(data: $Shape<Manuscript>): Manuscript {
  return produce(new Manuscript(), (draft: Draft<Manuscript>) => {
    _.assign(draft, data)
  })
}

type AtfToken = {|
  type: string,
  value: string,
  uniqueLemma?: string[],
  normalized?: boolean,
  language?: string,
  lemmatizable?: boolean,
  erasure?: string
|}
export type ManuscriptLine = {|
  manuscriptId: number,
  labels: Array<string>,
  number: string,
  atf: string,
  atfTokens: AtfToken[]
|}
export const createManuscriptLine: (
  $Shape<ManuscriptLine>
) => ManuscriptLine = produce(
  (draft: $Shape<ManuscriptLine>): ManuscriptLine => ({
    manuscriptId: 0,
    labels: [],
    number: '',
    atf: '',
    atfTokens: [],
    ...draft
  })
)
type ReconstructionToken = {|
  type: string,
  value: string
|}
export type Line = {|
  number: string,
  reconstruction: string,
  reconstructionTokens: ReconstructionToken[],
  manuscripts: ManuscriptLine[]
|}
export const createLine: ($Shape<Line>) => Line = produce(
  (draft: $Shape<Line>): Line => ({
    number: '',
    reconstruction: '',
    manuscripts: [],
    ...draft
  })
)

export type Chapter = {
  classification: string,
  stage: string,
  version: string,
  name: string,
  order: number,
  manuscripts: Array<Manuscript>,
  lines: Array<Line>
}
export const createChapter: ($Shape<Chapter>) => Chapter = produce(
  (draft: $Shape<Chapter>): Chapter => ({
    classification: 'Ancient',
    stage: 'Neo-Assyrian',
    version: '',
    name: '',
    order: 0,
    manuscripts: [],
    lines: [],
    ...draft
  })
)

export type Text = {
  category: number,
  index: number,
  name: string,
  numberOfVerses: number,
  approximateVerses: boolean,
  chapters: Array<Chapter>
}
export const createText: ($Shape<Text>) => Text = produce(
  (draft: $Shape<Text>): Text => ({
    category: 0,
    index: 0,
    name: '',
    numberOfVerses: 0,
    approximateVerses: false,
    chapters: [],
    ...draft
  })
)
