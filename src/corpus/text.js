import { List, Record, OrderedMap } from 'immutable'

const PeriodModifier = Record({ name: '', displayName: '' })
export const periodModifiers = OrderedMap({
  'None': PeriodModifier({ name: 'None', displayName: '-' }),
  'Early': PeriodModifier({ name: 'Early', displayName: 'Early' }),
  'Late': PeriodModifier({ name: 'Late', displayName: 'Late' })
})

const Period = Record({ name: '', abbreviation: '', description: '', parent: null })
export const periods = OrderedMap({
  'Ur III': Period({ name: 'Ur III', abbreviation: 'Ur3', description: '(ca. 2100–2002 BCE)' }),
  'Old Assyrian': Period({ name: 'Old Assyrian', abbreviation: 'OA', description: '(ca. 1950–1850 BCE)' }),
  'Old Babylonian': Period({ name: 'Old Babylonian', abbreviation: 'OB', description: '(ca. 2002–1595 BCE)' }),
  'Middle Babylonian': Period({ name: 'Middle Babylonian', abbreviation: 'MB', description: '(ca. 1595–1000 BCE)' }),
  'Middle Assyrian': Period({ name: 'Middle Assyrian', abbreviation: 'MA', description: '(ca. 1595–1000 BCE)' }),
  'Hittite': Period({ name: 'Hittite', abbreviation: 'Hit', description: '(ca. 1500–1100 BCE)' }),
  'Neo-Assyrian': Period({ name: 'Neo-Assyrian', abbreviation: 'NA', description: '(ca. 1000–609 BCE)' }),
  'Neo-Babylonian': Period({ name: 'Neo-Babylonian', abbreviation: 'NB', description: '(ca. 1000–539 BCE)' }),
  'Late Babylonian': Period({ name: 'Late Babylonian', abbreviation: 'LB', description: '(ca. 539 BCE–ca. 100 CE)' }),
  'Persian': Period({ name: 'Persian', abbreviation: 'Per', description: '(539–331 BCE)', parent: 'Late Babylonian' }),
  'Hellenistic': Period({ name: 'Hellenistic', abbreviation: 'Hel', description: '(331–141 BCE)', parent: 'Late Babylonian' }),
  'Parthian': Period({ name: 'Parthian', abbreviation: 'Par', description: '(141 BCE–ca. 100 CE)', parent: 'Late Babylonian' }),
  'Uncertain': Period({ name: 'Uncertain', abbreviation: 'Unc', description: '' })
})

const Provenance = Record({ name: '', abbreviation: '', parent: null })
export const provenances = OrderedMap({
  'Assyria': Provenance({ name: 'Assyria', abbreviation: 'Assa' }),
  'Aššur': Provenance({ name: 'Aššur', abbreviation: 'Ašš', parent: 'Assyria' }),
  'Ḫuzirina': Provenance({ name: 'Ḫuzirina', abbreviation: 'Huz', parent: 'Assyria' }),
  'Kalḫu': Provenance({ name: 'Kalḫu', abbreviation: 'Kal', parent: 'Assyria' }),
  'Khorsabad': Provenance({ name: 'Khorsabad', abbreviation: 'Kho', parent: 'Assyria' }),
  'Nineveh': Provenance({ name: 'Nineveh', abbreviation: 'Nin', parent: 'Assyria' }),
  'Tarbiṣu': Provenance({ name: 'Tarbiṣu', abbreviation: 'Tar', parent: 'Assyria' }),
  'Babylonia': Provenance({ name: 'Babylonia', abbreviation: 'Baba' }),
  'Babylon': Provenance({ name: 'Babylon', abbreviation: 'Bab', parent: 'Babylonia' }),
  'Borsippa': Provenance({ name: 'Borsippa', abbreviation: 'Bor', parent: 'Babylonia' }),
  'Cutha': Provenance({ name: 'Cutha', abbreviation: 'Cut', parent: 'Babylonia' }),
  'Isin': Provenance({ name: 'Isin', abbreviation: 'Isn', parent: 'Babylonia' }),
  'Kiš': Provenance({ name: 'Kiš', abbreviation: 'Kiš', parent: 'Babylonia' }),
  'Larsa': Provenance({ name: 'Larsa', abbreviation: 'Lar', parent: 'Babylonia' }),
  'Meturan': Provenance({ name: 'Meturan', abbreviation: 'Met', parent: 'Babylonia' }),
  'Nērebtum': Provenance({ name: 'Nērebtum', abbreviation: 'Nēr', parent: 'Babylonia' }),
  'Nippur': Provenance({ name: 'Nippur', abbreviation: 'Nip', parent: 'Babylonia' }),
  'Sippar': Provenance({ name: 'Sippar', abbreviation: 'Sip', parent: 'Babylonia' }),
  'Šaduppûm': Provenance({ name: 'Šaduppûm', abbreviation: 'Šad', parent: 'Babylonia' }),
  'Ur': Provenance({ name: 'Ur', abbreviation: 'Ur', parent: 'Babylonia' }),
  'Uruk': Provenance({ name: 'Uruk', abbreviation: 'Urk', parent: 'Babylonia' }),
  'Periphery': Provenance({ name: 'Periphery', abbreviation: '' }),
  'Alalakh': Provenance({ name: 'Alalakh', abbreviation: 'Ala', parent: 'Periphery' }),
  'Tell el-Amarna': Provenance({ name: 'Tell el-Amarna', abbreviation: 'Ama', parent: 'Periphery' }),
  'Emar': Provenance({ name: 'Emar', abbreviation: 'Emr', parent: 'Periphery' }),
  'Ḫattuša': Provenance({ name: 'Ḫattuša', abbreviation: 'Hat', parent: 'Periphery' }),
  'Mari': Provenance({ name: 'Mari', abbreviation: 'Mar', parent: 'Periphery' }),
  'Megiddo': Provenance({ name: 'Megiddo', abbreviation: 'Meg', parent: 'Periphery' }),
  'Susa': Provenance({ name: 'Susa', abbreviation: 'Sus', parent: 'Periphery' }),
  'Ugarit': Provenance({ name: 'Ugarit', abbreviation: 'Uga', parent: 'Periphery' }),
  'Uncertain': Provenance({ name: 'Uncertain', abbreviation: 'Unc' })
})

const ManuscriptType = Record({ name: '', abbreviation: '' })
export const types = OrderedMap({
  'Library': ManuscriptType({ name: 'Library', abbreviation: '' }),
  'School': ManuscriptType({ name: 'School', abbreviation: 'Sch' }),
  'Varia': ManuscriptType({ name: 'Varia', abbreviation: 'Var' }),
  'Commentary': ManuscriptType({ name: 'Commentary', abbreviation: 'Com' }),
  'Quotation': ManuscriptType({ name: 'Quotation', abbreviation: 'Quo' })
})

export const Manuscript = Record({
  id: '',
  siglumDisambiguator: '',
  museumNumber: '',
  accession: '',
  periodModifier: periodModifiers.get('None'),
  period: periods.get('Neo-Assyrian'),
  provenance: provenances.get('Nineveh'),
  type: types.get('Library'),
  notes: '',
  references: new List()
})

export const Chapter = Record({
  classification: 'Ancient',
  stage: 'Neo-Assyrian',
  version: '',
  name: '',
  order: 0,
  manuscripts: new List()
})

export const Text = Record({
  category: 0,
  index: 0,
  name: '',
  numberOfVerses: 0,
  approximateVerses: false,
  chapters: new List()
})
