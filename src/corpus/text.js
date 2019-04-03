import { List, Record, OrderedMap } from 'immutable'

const Period = Record({ name: '', abbreviation: '', description: '' })
export const periods = OrderedMap({
  'Ur III': Period({ name: 'Ur III', abbreviation: 'UrIII', description: '(ca. 2100-2000 BC)' }),
  'Old Assyrian': Period({ name: 'Old Assyrian', abbreviation: 'OA', description: '(ca. 1950-1850 BC)' }),
  'Old Babylonian': Period({ name: 'Old Babylonian', abbreviation: 'OB', description: '(ca. 2000-1600 BC)' }),
  'Middle Babylonian': Period({ name: 'Middle Babylonian', abbreviation: 'MB', description: '(ca. 1400-1100 BC)' }),
  'Middle Assyrian': Period({ name: 'Middle Assyrian', abbreviation: 'MA', description: '(ca. 1400-1000 BC)' }),
  'Hittite': Period({ name: 'Hittite', abbreviation: 'Hit', description: '(ca. 1500-1100 BC)' }),
  'Neo-Assyrian': Period({ name: 'Neo-Assyrian', abbreviation: 'NA', description: '(ca. 911-612 BC)' }),
  'Neo-Babylonian': Period({ name: 'Neo-Babylonian', abbreviation: 'NB', description: '(ca. 626-539 BC)' }),
  'Achaemenid': Period({ name: 'Achaemenid', abbreviation: 'Ach', description: '(547-331 BC)' }),
  'Hellenistic': Period({ name: 'Hellenistic', abbreviation: 'Hel', description: '(323-63 BC)' }),
  'Parthian': Period({ name: 'Parthian', abbreviation: 'Par', description: '(247-224 BC)' }),
  'Uncertain': Period({ name: 'Uncertain', abbreviation: 'Unc', description: '' })
})

const Provenance = Record({ name: '', abbreviation: '' })
export const provenances = OrderedMap({
  'Aššur': Provenance({ name: 'Aššur', abbreviation: 'Ašš' }),
  'Babylon': Provenance({ name: 'Babylon', abbreviation: 'Bab' }),
  'Babylonia': Provenance({ name: 'Babylonia', abbreviation: 'Baba' }),
  'Borsippa': Provenance({ name: 'Borsippa', abbreviation: 'Bor' }),
  'Ḫuzirina': Provenance({ name: 'Ḫuzirina', abbreviation: 'Ḫuz' }),
  'Kalḫu': Provenance({ name: 'Kalḫu', abbreviation: 'Kal' }),
  'Nineveh': Provenance({ name: 'Nineveh', abbreviation: 'Nin' }),
  'Nippur': Provenance({ name: 'Nippur', abbreviation: 'Nip' }),
  'Sippar': Provenance({ name: 'Sippar', abbreviation: 'Sip' }),
  'Šaduppûm': Provenance({ name: 'Šaduppûm', abbreviation: 'Šad' }),
  'Ur': Provenance({ name: 'Ur', abbreviation: 'Ur' }),
  'Uruk': Provenance({ name: 'Uruk', abbreviation: 'Uru' }),
  'Unclear': Provenance({ name: 'Unclear', abbreviation: 'Unc' })
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
  uniqueId: '',
  siglum: '',
  museumNumber: '',
  accession: '',
  period: periods.get('Neo-Assyrian'),
  provenance: provenances.get('Nineveh'),
  type: types.get('Library'),
  bibliography: new List()
})

export const Chapter = Record({
  classification: 'Ancient',
  stage: 'Neo-Assyrian',
  name: '',
  order: 0,
  manuscripts: new List()
})

export const Text = Record({
  category: 0,
  index: 0,
  name: '',
  chapters: new List()
})
