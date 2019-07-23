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

export type ManuscriptType = {| +name: string, +abbreviation: string |}
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
  references: $ReadOnlyArray<Reference> = Array()

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

export type AtfToken = {|
  +type: string,
  +value: string,
  +uniqueLemma?: $ReadOnlyArray<string>,
  +normalized?: boolean,
  +language?: string,
  +lemmatizable?: boolean,
  +erasure?: string,
  +alignment?: ?number
|}
export type ManuscriptLine = {|
  +manuscriptId: number,
  +labels: $ReadOnlyArray<string>,
  +number: string,
  +atf: string,
  +atfTokens: $ReadOnlyArray<AtfToken>
|}
export const createManuscriptLine: (
  $Shape<ManuscriptLine>
) => ManuscriptLine = produce(
  (draft: $Shape<ManuscriptLine>): ManuscriptLine => ({
    manuscriptId: 0,
    labels: Array(),
    number: '',
    atf: '',
    atfTokens: Array(),
    ...draft
  })
)
export type ReconstructionToken = {|
  +type: string,
  +value: string
|}
export type Line = {|
  +number: string,
  +reconstruction: string,
  +reconstructionTokens: $ReadOnlyArray<ReconstructionToken>,
  +manuscripts: $ReadOnlyArray<ManuscriptLine>
|}
export const createLine: ($Shape<Line>) => Line = produce(
  (draft: $Shape<Line>): Line => ({
    number: '',
    reconstruction: '',
    manuscripts: Array(),
    ...draft
  })
)

export type Chapter = {|
  +classification: string,
  +stage: string,
  +version: string,
  +name: string,
  +order: number,
  +manuscripts: $ReadOnlyArray<Manuscript>,
  +lines: $ReadOnlyArray<Line>
|}
export const createChapter: ($Shape<Chapter>) => Chapter = produce(
  (draft: $Shape<Chapter>): Chapter => ({
    classification: 'Ancient',
    stage: 'Neo-Assyrian',
    version: '',
    name: '',
    order: 0,
    manuscripts: Array(),
    lines: Array(),
    ...draft
  })
)

export class Text {
  category: number = 0
  index: number = 0
  name: string = ''
  numberOfVerses: number = 0
  approximateVerses: boolean = false
  chapters: $ReadOnlyArray<Chapter> = Array()

  findChapterIndex(stage: string, name: string) {
    return this.chapters.findIndex(
      chapter => chapter.stage === stage && chapter.name === name
    )
  }
}
Text[immerable] = true

export function createText(data: $Shape<Text>): Text {
  return produce(new Text(), (draft: Draft<Text>) => {
    _.assign(draft, data)
  })
}
