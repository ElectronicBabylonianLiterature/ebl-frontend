// @flow
import { OrderedMap } from 'immutable'

export type Provenance = {
  +name: string,
  +abbreviation: string,
  +parent?: string
}
export const provenances: OrderedMap<string,
  Provenance> = OrderedMap().withMutations(map =>
  [
    { name: 'Assyria', abbreviation: 'Assa' },
    { name: 'Aššur', abbreviation: 'Ašš', parent: 'Assyria' },
    { name: 'Ḫuzirina', abbreviation: 'Huz', parent: 'Assyria' },
    { name: 'Kalḫu', abbreviation: 'Kal', parent: 'Assyria' },
    { name: 'Khorsabad', abbreviation: 'Kho', parent: 'Assyria' },
    { name: 'Nineveh', abbreviation: 'Nin', parent: 'Assyria' },
    { name: 'Tarbiṣu', abbreviation: 'Tar', parent: 'Assyria' },
    { name: 'Babylonia', abbreviation: 'Baba' },
    { name: 'Babylon', abbreviation: 'Bab', parent: 'Babylonia' },
    { name: 'Borsippa', abbreviation: 'Bor', parent: 'Babylonia' },
    { name: 'Cutha', abbreviation: 'Cut', parent: 'Babylonia' },
    { name: 'Isin', abbreviation: 'Isn', parent: 'Babylonia' },
    { name: 'Kiš', abbreviation: 'Kiš', parent: 'Babylonia' },
    { name: 'Larsa', abbreviation: 'Lar', parent: 'Babylonia' },
    { name: 'Meturan', abbreviation: 'Met', parent: 'Babylonia' },
    { name: 'Nērebtum', abbreviation: 'Nēr', parent: 'Babylonia' },
    { name: 'Nippur', abbreviation: 'Nip', parent: 'Babylonia' },
    { name: 'Sippar', abbreviation: 'Sip', parent: 'Babylonia' },
    { name: 'Šaduppûm', abbreviation: 'Šad', parent: 'Babylonia' },
    { name: 'Ur', abbreviation: 'Ur', parent: 'Babylonia' },
    { name: 'Uruk', abbreviation: 'Urk', parent: 'Babylonia' },
    { name: 'Periphery', abbreviation: '' },
    { name: 'Alalakh', abbreviation: 'Ala', parent: 'Periphery' },
    { name: 'Tell el-Amarna', abbreviation: 'Ama', parent: 'Periphery' },
    { name: 'Emar', abbreviation: 'Emr', parent: 'Periphery' },
    { name: 'Ḫattuša', abbreviation: 'Hat', parent: 'Periphery' },
    { name: 'Mari', abbreviation: 'Mar', parent: 'Periphery' },
    { name: 'Megiddo', abbreviation: 'Meg', parent: 'Periphery' },
    { name: 'Susa', abbreviation: 'Sus', parent: 'Periphery' },
    { name: 'Ugarit', abbreviation: 'Uga', parent: 'Periphery' },
    { name: 'Uncertain', abbreviation: 'Unc' }
  ].forEach(provenance => map.set(provenance.name, provenance))
)
