export type Provenance = {
  readonly name: string
  readonly abbreviation: string
  readonly parent?: string
}
export const provenances: ReadonlyMap<string, Provenance> = new Map([
  ['Assyria', { name: 'Assyria', abbreviation: 'Assa' }],
  ['Aššur', { name: 'Aššur', abbreviation: 'Ašš', parent: 'Assyria' }],
  ['Ḫuzirina', { name: 'Ḫuzirina', abbreviation: 'Huz', parent: 'Assyria' }],
  ['Kalḫu', { name: 'Kalḫu', abbreviation: 'Kal', parent: 'Assyria' }],
  ['Khorsabad', { name: 'Khorsabad', abbreviation: 'Kho', parent: 'Assyria' }],
  ['Nineveh', { name: 'Nineveh', abbreviation: 'Nin', parent: 'Assyria' }],
  ['Tarbiṣu', { name: 'Tarbiṣu', abbreviation: 'Tar', parent: 'Assyria' }],
  ['Babylonia', { name: 'Babylonia', abbreviation: 'Baba' }],
  ['Babylon', { name: 'Babylon', abbreviation: 'Bab', parent: 'Babylonia' }],
  ['Borsippa', { name: 'Borsippa', abbreviation: 'Bor', parent: 'Babylonia' }],
  ['Cutha', { name: 'Cutha', abbreviation: 'Cut', parent: 'Babylonia' }],
  ['Isin', { name: 'Isin', abbreviation: 'Isn', parent: 'Babylonia' }],
  ['Kiš', { name: 'Kiš', abbreviation: 'Kiš', parent: 'Babylonia' }],
  ['Larsa', { name: 'Larsa', abbreviation: 'Lar', parent: 'Babylonia' }],
  ['Meturan', { name: 'Meturan', abbreviation: 'Met', parent: 'Babylonia' }],
  ['Nērebtum', { name: 'Nērebtum', abbreviation: 'Nēr', parent: 'Babylonia' }],
  ['Nippur', { name: 'Nippur', abbreviation: 'Nip', parent: 'Babylonia' }],
  ['Sippar', { name: 'Sippar', abbreviation: 'Sip', parent: 'Babylonia' }],
  ['Šaduppûm', { name: 'Šaduppûm', abbreviation: 'Šad', parent: 'Babylonia' }],
  ['Ur', { name: 'Ur', abbreviation: 'Ur', parent: 'Babylonia' }],
  ['Uruk', { name: 'Uruk', abbreviation: 'Urk', parent: 'Babylonia' }],
  ['Periphery', { name: 'Periphery', abbreviation: '' }],
  ['Alalakh', { name: 'Alalakh', abbreviation: 'Ala', parent: 'Periphery' }],
  [
    'Tell el-Amarna',
    { name: 'Tell el-Amarna', abbreviation: 'Ama', parent: 'Periphery' },
  ],
  ['Emar', { name: 'Emar', abbreviation: 'Emr', parent: 'Periphery' }],
  ['Ḫattuša', { name: 'Ḫattuša', abbreviation: 'Hat', parent: 'Periphery' }],
  ['Mari', { name: 'Mari', abbreviation: 'Mar', parent: 'Periphery' }],
  ['Megiddo', { name: 'Megiddo', abbreviation: 'Meg', parent: 'Periphery' }],
  ['Susa', { name: 'Susa', abbreviation: 'Sus', parent: 'Periphery' }],
  ['Ugarit', { name: 'Ugarit', abbreviation: 'Uga', parent: 'Periphery' }],
  ['Uncertain', { name: 'Uncertain', abbreviation: 'Unc' }],
])
