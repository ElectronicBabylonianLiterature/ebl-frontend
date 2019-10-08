// @flow
import Reference from 'bibliography/Reference'
import type { Period, PeriodModifier } from './period'
import { periodModifiers, periods } from './period'
import type { Provenance } from './provenance'
import { provenances } from './provenance'
import { immerable, produce } from 'immer'
import type { Draft } from 'immer'
import _ from 'lodash'

export type ManuscriptType = {| +name: string, +abbreviation: string |}
export const types: $ReadOnlyMap<string, ManuscriptType> = new Map([
  ['Library', { name: 'Library', abbreviation: '' }],
  ['School', { name: 'School', abbreviation: 'Sch' }],
  ['Varia', { name: 'Varia', abbreviation: 'Var' }],
  ['Commentary', { name: 'Commentary', abbreviation: 'Com' }],
  ['Quotation', { name: 'Quotation', abbreviation: 'Quo' }]
])

export class Manuscript {
  id: ?number = null
  siglumDisambiguator: string = ''
  museumNumber: string = ''
  accession: string = ''
  // $FlowFixMe
  periodModifier: PeriodModifier = periodModifiers.get('None')
  // $FlowFixMe
  period: Period = periods.get('Neo-Assyrian')
  // $FlowFixMe
  provenance: Provenance = provenances.get('Nineveh')
  // $FlowFixMe
  type: ManuscriptType = types.get('Library')
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
    labels: [],
    number: '',
    atf: '',
    atfTokens: [],
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
    manuscripts: [],
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
    manuscripts: [],
    lines: [],
    ...draft
  })
)

export class Text {
  category: number = 0
  index: number = 0
  name: string = ''
  numberOfVerses: number = 0
  approximateVerses: boolean = false
  chapters: $ReadOnlyArray<Chapter> = []

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
