import { Provenance } from 'corpus/domain/provenance'

enum ColophonStatus {
  Yes = 'Yes',
  No = 'No',
  Broken = 'Broken',
  OnlyColophon = 'Only Colophon',
}

enum ColophonType {
  AsbA = 'Asb a',
  AsbB = 'Asb b',
  AsbC = 'Asb c',
  AsbD = 'Asb d',
  AsbE = 'Asb e',
  AsbF = 'Asb f',
  AsbG = 'Asb g', // BAK 321
  AsbH = 'Asb h',
  AsbI = 'Asb i',
  AsbK = 'Asb k',
  AsbL = 'Asb l',
  AsbM = 'Asb m',
  AsbN = 'Asb n',
  AsbO = 'Asb o',
  AsbP = 'Asb p',
  AsbQ = 'Asb q',
  AsbRS = 'Asb r/s',
  AsbT = 'Asb t',
  AsbU = 'Asb u',
  AsbV = 'Asb v',
  AsbW = 'Asb w',
  AsbUnclear = 'Asb Unclear',
  NzkBAK293 = 'Nzk BAK 293',
  NzkBAK294 = 'Nzk BAK 294',
  NzkBAK295 = 'Nzk BAK 295',
  NzkBAK296 = 'Nzk BAK 296',
  NzkBAK297 = 'Nzk BAK 297',
}

enum ColophonOwnership {
  Library = 'Library',
  Private = 'Private',
  Individual = 'Individual',
}

enum IndividualType {
  Owner = 'Owner',
  Scribe = 'Scribe',
  Other = 'Other',
}

interface Name {
  value: string
  isBroken: boolean
  isUncertain: boolean
}

interface Individual {
  name: Name
  sonOf: Name
  grandsonOf: Name
  family: Name
  nativeOf: Provenance
  type: IndividualType
}

export interface Colophon {
  colophonStatus: ColophonStatus
  colophonOwnership: ColophonOwnership
  colophonType: ColophonType[]
  originalFrom: Provenance
  writtenIn: Provenance
  notesToScribalProcess: string
  individuals: Individual[]
}
