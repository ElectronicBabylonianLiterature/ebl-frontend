// @flow
import type { RecordFactory, RecordOf } from 'immutable'
import { List, OrderedMap, Record } from 'immutable'
import Reference from '../bibliography/Reference'
import type { Period, PeriodModifier } from './period'
import { periodModifiers, periods } from './period'

type ProvenanceProps = { name: string, abbreviation: string, parent: ?string }
const createProvenance: RecordFactory<ProvenanceProps> = Record({
  name: '',
  abbreviation: '',
  parent: null
})
export type Provenance = RecordOf<ProvenanceProps>
export const provenances: OrderedMap<string, Provenance> = OrderedMap({
  Assyria: createProvenance({ name: 'Assyria', abbreviation: 'Assa' }),
  Aššur: createProvenance({
    name: 'Aššur',
    abbreviation: 'Ašš',
    parent: 'Assyria'
  }),
  Ḫuzirina: createProvenance({
    name: 'Ḫuzirina',
    abbreviation: 'Huz',
    parent: 'Assyria'
  }),
  Kalḫu: createProvenance({
    name: 'Kalḫu',
    abbreviation: 'Kal',
    parent: 'Assyria'
  }),
  Khorsabad: createProvenance({
    name: 'Khorsabad',
    abbreviation: 'Kho',
    parent: 'Assyria'
  }),
  Nineveh: createProvenance({
    name: 'Nineveh',
    abbreviation: 'Nin',
    parent: 'Assyria'
  }),
  Tarbiṣu: createProvenance({
    name: 'Tarbiṣu',
    abbreviation: 'Tar',
    parent: 'Assyria'
  }),
  Babylonia: createProvenance({ name: 'Babylonia', abbreviation: 'Baba' }),
  Babylon: createProvenance({
    name: 'Babylon',
    abbreviation: 'Bab',
    parent: 'Babylonia'
  }),
  Borsippa: createProvenance({
    name: 'Borsippa',
    abbreviation: 'Bor',
    parent: 'Babylonia'
  }),
  Cutha: createProvenance({
    name: 'Cutha',
    abbreviation: 'Cut',
    parent: 'Babylonia'
  }),
  Isin: createProvenance({
    name: 'Isin',
    abbreviation: 'Isn',
    parent: 'Babylonia'
  }),
  Kiš: createProvenance({
    name: 'Kiš',
    abbreviation: 'Kiš',
    parent: 'Babylonia'
  }),
  Larsa: createProvenance({
    name: 'Larsa',
    abbreviation: 'Lar',
    parent: 'Babylonia'
  }),
  Meturan: createProvenance({
    name: 'Meturan',
    abbreviation: 'Met',
    parent: 'Babylonia'
  }),
  Nērebtum: createProvenance({
    name: 'Nērebtum',
    abbreviation: 'Nēr',
    parent: 'Babylonia'
  }),
  Nippur: createProvenance({
    name: 'Nippur',
    abbreviation: 'Nip',
    parent: 'Babylonia'
  }),
  Sippar: createProvenance({
    name: 'Sippar',
    abbreviation: 'Sip',
    parent: 'Babylonia'
  }),
  Šaduppûm: createProvenance({
    name: 'Šaduppûm',
    abbreviation: 'Šad',
    parent: 'Babylonia'
  }),
  Ur: createProvenance({ name: 'Ur', abbreviation: 'Ur', parent: 'Babylonia' }),
  Uruk: createProvenance({
    name: 'Uruk',
    abbreviation: 'Urk',
    parent: 'Babylonia'
  }),
  Periphery: createProvenance({ name: 'Periphery', abbreviation: '' }),
  Alalakh: createProvenance({
    name: 'Alalakh',
    abbreviation: 'Ala',
    parent: 'Periphery'
  }),
  'Tell el-Amarna': createProvenance({
    name: 'Tell el-Amarna',
    abbreviation: 'Ama',
    parent: 'Periphery'
  }),
  Emar: createProvenance({
    name: 'Emar',
    abbreviation: 'Emr',
    parent: 'Periphery'
  }),
  Ḫattuša: createProvenance({
    name: 'Ḫattuša',
    abbreviation: 'Hat',
    parent: 'Periphery'
  }),
  Mari: createProvenance({
    name: 'Mari',
    abbreviation: 'Mar',
    parent: 'Periphery'
  }),
  Megiddo: createProvenance({
    name: 'Megiddo',
    abbreviation: 'Meg',
    parent: 'Periphery'
  }),
  Susa: createProvenance({
    name: 'Susa',
    abbreviation: 'Sus',
    parent: 'Periphery'
  }),
  Ugarit: createProvenance({
    name: 'Ugarit',
    abbreviation: 'Uga',
    parent: 'Periphery'
  }),
  Uncertain: createProvenance({ name: 'Uncertain', abbreviation: 'Unc' })
})

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
