import type { RecordFactory, RecordOf } from 'immutable'
import { OrderedMap, Record } from 'immutable'

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
