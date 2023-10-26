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
  'Dūr-Katlimmu': {
    name: 'Dūr-Katlimmu',
    abbreviation: 'Dka',
    parent: 'Assyria',
  },
  Ḫarrān: { name: 'Ḫarrān', abbreviation: 'Har', parent: 'Assyria' },
  'Imgur-Enlil': {
    name: 'Imgur-Enlil',
    abbreviation: 'Img',
    parent: 'Assyria',
  },
  'Kār-Tukulti-Ninurta': {
    name: 'Kār-Tukulti-Ninurta',
    abbreviation: 'Ktn',
    parent: 'Assyria',
  },
  'Šubat-Enlil': {
    name: 'Šubat-Enlil',
    abbreviation: 'Šub',
    parent: 'Assyria',
  },
  Guzana: { name: 'Guzana', abbreviation: 'Guz', parent: 'Assyria' },
  Adab: { name: 'Adab', abbreviation: 'Adb', parent: 'Babylonia' },
  Ešnunna: { name: 'Ešnunna', abbreviation: 'Ešn', parent: 'Babylonia' },
  Girsu: { name: 'Girsu', abbreviation: 'Gir', parent: 'Babylonia' },
  Lagaš: { name: 'Lagaš', abbreviation: 'Lag', parent: 'Babylonia' },
  Nigin: { name: 'Nigin', abbreviation: 'Nig', parent: 'Babylonia' },
  'Sippar-Amnānum': {
    name: 'Sippar-Amnānum',
    abbreviation: 'Sipam',
    parent: 'Babylonia',
  },
  Šuruppak: { name: 'Šuruppak', abbreviation: 'Šur', parent: 'Babylonia' },
  Ḫursagkalama: {
    name: 'Ḫursagkalama',
    abbreviation: 'Hur',
    parent: 'Babylonia',
  },
  Tutub: { name: 'Tutub', abbreviation: 'Ttb', parent: 'Babylonia' },
  Umma: { name: 'Umma', abbreviation: 'Umm', parent: 'Babylonia' },
  Zabalam: { name: 'Zabalam', abbreviation: 'Zab', parent: 'Babylonia' },
  'Bad-Tibira': {
    name: 'Bad-Tibira',
    abbreviation: 'Btb',
    parent: 'Babylonia',
  },
  'Dūr-Kurigalzu': {
    name: 'Dūr-Kurigalzu',
    abbreviation: 'Dku',
    parent: 'Babylonia',
  },
  Eridu: { name: 'Eridu', abbreviation: 'Eri', parent: 'Babylonia' },
  Garšana: { name: 'Garšana', abbreviation: 'Gar', parent: 'Babylonia' },
  Irisagrig: { name: 'Irisagrig', abbreviation: 'Irs', parent: 'Babylonia' },
  Kisurra: { name: 'Kisurra', abbreviation: 'Ksr', parent: 'Babylonia' },
  Kutalla: { name: 'Kutalla', abbreviation: 'Kut', parent: 'Babylonia' },
  Marad: { name: 'Marad', abbreviation: 'Mrd', parent: 'Babylonia' },
  'Maškan-šāpir': {
    name: 'Maškan-šāpir',
    abbreviation: 'Maš',
    parent: 'Babylonia',
  },
  'Puzriš-Dagān': {
    name: 'Puzriš-Dagān',
    abbreviation: 'Puz',
    parent: 'Babylonia',
  },
  Larak: { name: 'Larak', abbreviation: 'Lrk', parent: 'Babylonia' },
  'Pī-Kasî': { name: 'Pī-Kasî', abbreviation: 'Pik', parent: 'Babylonia' },
  Malgium: { name: 'Malgium', abbreviation: 'Mal', parent: 'Babylonia' },
  Pašime: { name: 'Pašime', abbreviation: 'Paš', parent: 'Periphery' },
  Tuttul: { name: 'Tuttul', abbreviation: 'Ttl', parent: 'Periphery' },
  Elam: { name: 'Elam', abbreviation: 'Elam', parent: 'Periphery' },
  Anšan: { name: 'Anšan', abbreviation: 'Anš', parent: 'Periphery' },
  Dēr: { name: 'Dēr', abbreviation: 'Der', parent: 'Periphery' },
  'Dūr-Untaš': { name: 'Dūr-Untaš', abbreviation: 'Dun', parent: 'Periphery' },
  Ebla: { name: 'Ebla', abbreviation: 'Ebl', parent: 'Periphery' },
  Kaneš: { name: 'Kaneš', abbreviation: 'Kan', parent: 'Periphery' },
  Karkemiš: { name: 'Karkemiš', abbreviation: 'Kar', parent: 'Periphery' },
  Persepolis: { name: 'Persepolis', abbreviation: 'Per', parent: 'Periphery' },
  Terqa: { name: 'Terqa', abbreviation: 'Ter', parent: 'Periphery' },
  'Tepe Gotvand': {
    name: 'Tepe Gotvand',
    abbreviation: 'Tgo',
    parent: 'Periphery',
  },
  Qaṭnā: { name: 'Qaṭnā', abbreviation: 'Qaṭ', parent: 'Periphery' },
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
