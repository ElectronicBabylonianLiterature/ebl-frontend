import type { RecordFactory, RecordOf } from 'immutable'
import { OrderedMap, Record } from 'immutable'

type ProvenanceProps = { name: string, abbreviation: string, parent: ?string }
const createProvenance: RecordFactory<ProvenanceProps> = Record({
  name: '',
  abbreviation: '',
  parent: null
})
export type Provenance = RecordOf<ProvenanceProps>
export const provenances: OrderedMap<
  string,
  Provenance
> = OrderedMap().withMutations(map =>
  [
    createProvenance({ name: 'Assyria', abbreviation: 'Assa' }),
    createProvenance({
      name: 'Aššur',
      abbreviation: 'Ašš',
      parent: 'Assyria'
    }),
    createProvenance({
      name: 'Ḫuzirina',
      abbreviation: 'Huz',
      parent: 'Assyria'
    }),
    createProvenance({
      name: 'Kalḫu',
      abbreviation: 'Kal',
      parent: 'Assyria'
    }),
    createProvenance({
      name: 'Khorsabad',
      abbreviation: 'Kho',
      parent: 'Assyria'
    }),
    createProvenance({
      name: 'Nineveh',
      abbreviation: 'Nin',
      parent: 'Assyria'
    }),
    createProvenance({
      name: 'Tarbiṣu',
      abbreviation: 'Tar',
      parent: 'Assyria'
    }),
    createProvenance({ name: 'Babylonia', abbreviation: 'Baba' }),
    createProvenance({
      name: 'Babylon',
      abbreviation: 'Bab',
      parent: 'Babylonia'
    }),
    createProvenance({
      name: 'Borsippa',
      abbreviation: 'Bor',
      parent: 'Babylonia'
    }),
    createProvenance({
      name: 'Cutha',
      abbreviation: 'Cut',
      parent: 'Babylonia'
    }),
    createProvenance({
      name: 'Isin',
      abbreviation: 'Isn',
      parent: 'Babylonia'
    }),
    createProvenance({
      name: 'Kiš',
      abbreviation: 'Kiš',
      parent: 'Babylonia'
    }),
    createProvenance({
      name: 'Larsa',
      abbreviation: 'Lar',
      parent: 'Babylonia'
    }),
    createProvenance({
      name: 'Meturan',
      abbreviation: 'Met',
      parent: 'Babylonia'
    }),
    createProvenance({
      name: 'Nērebtum',
      abbreviation: 'Nēr',
      parent: 'Babylonia'
    }),
    createProvenance({
      name: 'Nippur',
      abbreviation: 'Nip',
      parent: 'Babylonia'
    }),
    createProvenance({
      name: 'Sippar',
      abbreviation: 'Sip',
      parent: 'Babylonia'
    }),
    createProvenance({
      name: 'Šaduppûm',
      abbreviation: 'Šad',
      parent: 'Babylonia'
    }),
    createProvenance({ name: 'Ur', abbreviation: 'Ur', parent: 'Babylonia' }),
    createProvenance({
      name: 'Uruk',
      abbreviation: 'Urk',
      parent: 'Babylonia'
    }),
    createProvenance({ name: 'Periphery', abbreviation: '' }),
    createProvenance({
      name: 'Alalakh',
      abbreviation: 'Ala',
      parent: 'Periphery'
    }),
    createProvenance({
      name: 'Tell el-Amarna',
      abbreviation: 'Ama',
      parent: 'Periphery'
    }),
    createProvenance({
      name: 'Emar',
      abbreviation: 'Emr',
      parent: 'Periphery'
    }),
    createProvenance({
      name: 'Ḫattuša',
      abbreviation: 'Hat',
      parent: 'Periphery'
    }),
    createProvenance({
      name: 'Mari',
      abbreviation: 'Mar',
      parent: 'Periphery'
    }),
    createProvenance({
      name: 'Megiddo',
      abbreviation: 'Meg',
      parent: 'Periphery'
    }),
    createProvenance({
      name: 'Susa',
      abbreviation: 'Sus',
      parent: 'Periphery'
    }),
    createProvenance({
      name: 'Ugarit',
      abbreviation: 'Uga',
      parent: 'Periphery'
    }),
    createProvenance({ name: 'Uncertain', abbreviation: 'Unc' })
  ].forEach(provenance => map.set(provenance.name, provenance))
)
