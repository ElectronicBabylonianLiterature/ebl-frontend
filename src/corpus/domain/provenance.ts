export const Provenances = {
  'Standard Text': { name: 'Standard Text', abbreviation: 'Std', parent: null },
  Assyria: { name: 'Assyria', abbreviation: 'Assa', parent: null },
  Aššur: { name: 'Aššur', abbreviation: 'Ašš', parent: 'Assyria' },
  Ḫuzirina: { name: 'Ḫuzirina', abbreviation: 'Huz', parent: 'Assyria' },
  Kalḫu: { name: 'Kalḫu', abbreviation: 'Kal', parent: 'Assyria' },
  Khorsabad: { name: 'Khorsabad', abbreviation: 'Kho', parent: 'Assyria' },
  Nineveh: { name: 'Nineveh', abbreviation: 'Nin', parent: 'Assyria' },
  Tarbiṣu: { name: 'Tarbiṣu', abbreviation: 'Tar', parent: 'Assyria' },
  Babylonia: { name: 'Babylonia', abbreviation: 'Baba', parent: null },
  Babylon: { name: 'Babylon', abbreviation: 'Bab', parent: 'Babylonia' },
  Borsippa: { name: 'Borsippa', abbreviation: 'Bor', parent: 'Babylonia' },
  Cutha: { name: 'Cutha', abbreviation: 'Cut', parent: 'Babylonia' },
  Dilbat: { name: 'Dilbat', abbreviation: 'Dil', parent: 'Babylonia' },
  Isin: { name: 'Isin', abbreviation: 'Isn', parent: 'Babylonia' },
  Kiš: { name: 'Kiš', abbreviation: 'Kiš', parent: 'Babylonia' },
  Larsa: { name: 'Larsa', abbreviation: 'Lar', parent: 'Babylonia' },
  Meturan: { name: 'Meturan', abbreviation: 'Met', parent: 'Babylonia' },
  Nērebtum: { name: 'Nērebtum', abbreviation: 'Nēr', parent: 'Babylonia' },
  Nippur: { name: 'Nippur', abbreviation: 'Nip', parent: 'Babylonia' },
  Sippar: { name: 'Sippar', abbreviation: 'Sip', parent: 'Babylonia' },
  Šaduppûm: { name: 'Šaduppûm', abbreviation: 'Šad', parent: 'Babylonia' },
  Ur: { name: 'Ur', abbreviation: 'Ur', parent: 'Babylonia' },
  Uruk: { name: 'Uruk', abbreviation: 'Urk', parent: 'Babylonia' },
  Periphery: { name: 'Periphery', abbreviation: '', parent: null },
  Alalakh: { name: 'Alalakh', abbreviation: 'Ala', parent: 'Periphery' },
  'Tell el-Amarna': {
    name: 'Tell el-Amarna',
    abbreviation: 'Ama',
    parent: 'Periphery',
  },
  Emar: { name: 'Emar', abbreviation: 'Emr', parent: 'Periphery' },
  Ḫattuša: { name: 'Ḫattuša', abbreviation: 'Hat', parent: 'Periphery' },
  Mari: { name: 'Mari', abbreviation: 'Mar', parent: 'Periphery' },
  Megiddo: { name: 'Megiddo', abbreviation: 'Meg', parent: 'Periphery' },
  Susa: { name: 'Susa', abbreviation: 'Sus', parent: 'Periphery' },
  Ugarit: { name: 'Ugarit', abbreviation: 'Uga', parent: 'Periphery' },
  Uncertain: { name: 'Uncertain', abbreviation: 'Unc', parent: null },
} as const
export type Provenance = typeof Provenances[keyof typeof Provenances]
export const provenances = [
  Provenances['Standard Text'],
  Provenances.Assyria,
  Provenances.Aššur,
  Provenances.Ḫuzirina,
  Provenances.Kalḫu,
  Provenances.Khorsabad,
  Provenances.Nineveh,
  Provenances.Tarbiṣu,
  Provenances.Babylonia,
  Provenances.Babylon,
  Provenances.Borsippa,
  Provenances.Cutha,
  Provenances.Dilbat,
  Provenances.Isin,
  Provenances.Kiš,
  Provenances.Larsa,
  Provenances.Meturan,
  Provenances.Nērebtum,
  Provenances.Nippur,
  Provenances.Sippar,
  Provenances.Šaduppûm,
  Provenances.Ur,
  Provenances.Uruk,
  Provenances.Periphery,
  Provenances.Alalakh,
  Provenances['Tell el-Amarna'],
  Provenances.Emar,
  Provenances.Ḫattuša,
  Provenances.Mari,
  Provenances.Megiddo,
  Provenances.Susa,
  Provenances.Ugarit,
  Provenances.Uncertain,
] as const

export function compareStandardText(
  first: Provenance,
  second: Provenance
): number {
  if (first === second) {
    return 0
  } else if (first === Provenances['Standard Text']) {
    return -1
  } else if (second === Provenances['Standard Text']) {
    return 1
  } else {
    return 0
  }
}

export function compareAssyriaAndBabylonia(
  first: Provenance,
  second: Provenance
): number {
  function isCity(provenance: Provenance): boolean {
    const nonCities: Provenance[] = [
      Provenances['Standard Text'],
      Provenances.Assyria,
      Provenances.Babylonia,
    ]
    return !nonCities.includes(provenance)
  }
  if (isCity(first) && isCity(second)) {
    return 0
  } else if (isCity(first)) {
    return 1
  } else if (isCity(second)) {
    return -1
  } else {
    return compareName(first, second)
  }
}

export function compareName(first: Provenance, second: Provenance): number {
  return first.name.localeCompare(second.name)
}
