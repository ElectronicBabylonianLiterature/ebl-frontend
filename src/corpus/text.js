// @flow
import { List, Record, OrderedMap } from 'immutable'
import type { RecordFactory, RecordOf } from 'immutable'
import Reference from '../bibliography/Reference'

type PeriodModifierProps = { name: string, displayName: string }
const createPeriodModifier: RecordFactory<PeriodModifierProps> = Record({ name: '', displayName: '' })
export type PeriodModifier = RecordOf<PeriodModifierProps>
export const periodModifiers: OrderedMap<string, PeriodModifier> = OrderedMap({
  'None': createPeriodModifier({ name: 'None', displayName: '-' }),
  'Early': createPeriodModifier({ name: 'Early', displayName: 'Early' }),
  'Late': createPeriodModifier({ name: 'Late', displayName: 'Late' })
})

type PeriodProps = { name: string, abbreviation: string, description: string, parent: ?string }
const createPeriod: RecordFactory<PeriodProps> = Record({ name: '', abbreviation: '', description: '', parent: null })
export type Period = RecordOf<PeriodProps>
export const periods: OrderedMap<string, Period> = OrderedMap({
  'Ur III': createPeriod({ name: 'Ur III', abbreviation: 'Ur3', description: '(ca. 2100–2002 BCE)' }),
  'Old Assyrian': createPeriod({ name: 'Old Assyrian', abbreviation: 'OA', description: '(ca. 1950–1850 BCE)' }),
  'Old Babylonian': createPeriod({ name: 'Old Babylonian', abbreviation: 'OB', description: '(ca. 2002–1595 BCE)' }),
  'Middle Babylonian': createPeriod({ name: 'Middle Babylonian', abbreviation: 'MB', description: '(ca. 1595–1000 BCE)' }),
  'Middle Assyrian': createPeriod({ name: 'Middle Assyrian', abbreviation: 'MA', description: '(ca. 1595–1000 BCE)' }),
  'Hittite': createPeriod({ name: 'Hittite', abbreviation: 'Hit', description: '(ca. 1500–1100 BCE)' }),
  'Neo-Assyrian': createPeriod({ name: 'Neo-Assyrian', abbreviation: 'NA', description: '(ca. 1000–609 BCE)' }),
  'Neo-Babylonian': createPeriod({ name: 'Neo-Babylonian', abbreviation: 'NB', description: '(ca. 1000–539 BCE)' }),
  'Late Babylonian': createPeriod({ name: 'Late Babylonian', abbreviation: 'LB', description: '(ca. 539 BCE–ca. 100 CE)' }),
  'Persian': createPeriod({ name: 'Persian', abbreviation: 'Per', description: '(539–331 BCE)', parent: 'Late Babylonian' }),
  'Hellenistic': createPeriod({ name: 'Hellenistic', abbreviation: 'Hel', description: '(331–141 BCE)', parent: 'Late Babylonian' }),
  'Parthian': createPeriod({ name: 'Parthian', abbreviation: 'Par', description: '(141 BCE–ca. 100 CE)', parent: 'Late Babylonian' }),
  'Uncertain': createPeriod({ name: 'Uncertain', abbreviation: 'Unc', description: '' })
})

type ProvenanceProps = { name: string, abbreviation: string, parent: ?string }
const createProvenance: RecordFactory<ProvenanceProps> = Record({ name: '', abbreviation: '', parent: null })
export type Provenance = RecordOf<ProvenanceProps>
export const provenances: OrderedMap<string, Provenance> = OrderedMap({
  'Assyria': createProvenance({ name: 'Assyria', abbreviation: 'Assa' }),
  'Aššur': createProvenance({ name: 'Aššur', abbreviation: 'Ašš', parent: 'Assyria' }),
  'Ḫuzirina': createProvenance({ name: 'Ḫuzirina', abbreviation: 'Huz', parent: 'Assyria' }),
  'Kalḫu': createProvenance({ name: 'Kalḫu', abbreviation: 'Kal', parent: 'Assyria' }),
  'Khorsabad': createProvenance({ name: 'Khorsabad', abbreviation: 'Kho', parent: 'Assyria' }),
  'Nineveh': createProvenance({ name: 'Nineveh', abbreviation: 'Nin', parent: 'Assyria' }),
  'Tarbiṣu': createProvenance({ name: 'Tarbiṣu', abbreviation: 'Tar', parent: 'Assyria' }),
  'Babylonia': createProvenance({ name: 'Babylonia', abbreviation: 'Baba' }),
  'Babylon': createProvenance({ name: 'Babylon', abbreviation: 'Bab', parent: 'Babylonia' }),
  'Borsippa': createProvenance({ name: 'Borsippa', abbreviation: 'Bor', parent: 'Babylonia' }),
  'Cutha': createProvenance({ name: 'Cutha', abbreviation: 'Cut', parent: 'Babylonia' }),
  'Isin': createProvenance({ name: 'Isin', abbreviation: 'Isn', parent: 'Babylonia' }),
  'Kiš': createProvenance({ name: 'Kiš', abbreviation: 'Kiš', parent: 'Babylonia' }),
  'Larsa': createProvenance({ name: 'Larsa', abbreviation: 'Lar', parent: 'Babylonia' }),
  'Meturan': createProvenance({ name: 'Meturan', abbreviation: 'Met', parent: 'Babylonia' }),
  'Nērebtum': createProvenance({ name: 'Nērebtum', abbreviation: 'Nēr', parent: 'Babylonia' }),
  'Nippur': createProvenance({ name: 'Nippur', abbreviation: 'Nip', parent: 'Babylonia' }),
  'Sippar': createProvenance({ name: 'Sippar', abbreviation: 'Sip', parent: 'Babylonia' }),
  'Šaduppûm': createProvenance({ name: 'Šaduppûm', abbreviation: 'Šad', parent: 'Babylonia' }),
  'Ur': createProvenance({ name: 'Ur', abbreviation: 'Ur', parent: 'Babylonia' }),
  'Uruk': createProvenance({ name: 'Uruk', abbreviation: 'Urk', parent: 'Babylonia' }),
  'Periphery': createProvenance({ name: 'Periphery', abbreviation: '' }),
  'Alalakh': createProvenance({ name: 'Alalakh', abbreviation: 'Ala', parent: 'Periphery' }),
  'Tell el-Amarna': createProvenance({ name: 'Tell el-Amarna', abbreviation: 'Ama', parent: 'Periphery' }),
  'Emar': createProvenance({ name: 'Emar', abbreviation: 'Emr', parent: 'Periphery' }),
  'Ḫattuša': createProvenance({ name: 'Ḫattuša', abbreviation: 'Hat', parent: 'Periphery' }),
  'Mari': createProvenance({ name: 'Mari', abbreviation: 'Mar', parent: 'Periphery' }),
  'Megiddo': createProvenance({ name: 'Megiddo', abbreviation: 'Meg', parent: 'Periphery' }),
  'Susa': createProvenance({ name: 'Susa', abbreviation: 'Sus', parent: 'Periphery' }),
  'Ugarit': createProvenance({ name: 'Ugarit', abbreviation: 'Uga', parent: 'Periphery' }),
  'Uncertain': createProvenance({ name: 'Uncertain', abbreviation: 'Unc' })
})

type ManuscriptTypeProps = { name: string, abbreviation: string }
const createManuscriptType: RecordFactory<ManuscriptTypeProps> = Record({ name: '', abbreviation: '' })
export type ManuscriptType = RecordOf<ManuscriptTypeProps>
export const types: OrderedMap<string, ManuscriptType> = OrderedMap({
  'Library': createManuscriptType({ name: 'Library', abbreviation: '' }),
  'School': createManuscriptType({ name: 'School', abbreviation: 'Sch' }),
  'Varia': createManuscriptType({ name: 'Varia', abbreviation: 'Var' }),
  'Commentary': createManuscriptType({ name: 'Commentary', abbreviation: 'Com' }),
  'Quotation': createManuscriptType({ name: 'Quotation', abbreviation: 'Quo' })
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

type LineProps = {
  number: string,
  reconstruction: string,
  lines: List<Object>
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
