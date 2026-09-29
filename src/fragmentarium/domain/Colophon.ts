import {
  IndividualAttestation,
  IndividualAttestationDto,
  ProvenanceAttestation,
} from 'fragmentarium/domain/IndividualAttestation'

export {
  IndividualAttestation,
  IndividualType,
} from 'fragmentarium/domain/IndividualAttestation'
export type {
  IndividualAttestationDto,
  IndividualTypeAttestation,
  NameAttestation,
  ProvenanceAttestation,
} from 'fragmentarium/domain/IndividualAttestation'

export enum ColophonStatus {
  Yes = 'Yes',
  No = 'No',
  Broken = 'Broken',
  OnlyColophon = 'Only Colophon',
}

export enum ColophonType {
  AsbA = 'Asb a',
  AsbB = 'Asb b',
  AsbC = 'Asb c',
  AsbD = 'Asb d',
  AsbE = 'Asb e',
  AsbF = 'Asb f',
  AsbG = 'Asb g BAK 321',
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

export enum ColophonOwnership {
  Library = 'Library',
  Private = 'Private',
  Individual = 'Individual',
}

export interface ColophonDto {
  readonly colophonStatus?: ColophonStatus
  readonly colophonOwnership?: ColophonOwnership
  readonly colophonTypes?: ColophonType[]
  readonly originalFrom?: ProvenanceAttestation
  readonly writtenIn?: ProvenanceAttestation
  readonly notesToScribalProcess?: string
  readonly individuals?: IndividualAttestationDto[]
}

export class Colophon {
  readonly colophonStatus?: ColophonStatus
  readonly colophonOwnership?: ColophonOwnership
  readonly colophonTypes?: ColophonType[]
  readonly originalFrom?: ProvenanceAttestation
  readonly writtenIn?: ProvenanceAttestation
  readonly notesToScribalProcess?: string
  readonly individuals?: IndividualAttestation[]

  constructor({
    colophonStatus,
    colophonOwnership,
    colophonTypes,
    originalFrom,
    writtenIn,
    notesToScribalProcess,
    individuals,
  }: {
    readonly colophonStatus?: ColophonStatus
    readonly colophonOwnership?: ColophonOwnership
    readonly colophonTypes?: ColophonType[]
    readonly originalFrom?: ProvenanceAttestation
    readonly writtenIn?: ProvenanceAttestation
    readonly notesToScribalProcess?: string
    readonly individuals?: IndividualAttestation[]
  }) {
    this.colophonStatus = colophonStatus
    this.colophonOwnership = colophonOwnership
    this.colophonTypes = colophonTypes
    this.originalFrom = originalFrom
    this.writtenIn = writtenIn
    this.notesToScribalProcess = notesToScribalProcess
    this.individuals = individuals
  }

  static fromJson(colophonDto: ColophonDto): Colophon {
    return new Colophon({
      ...colophonDto,
      individuals: colophonDto?.individuals?.map(
        (indiviual) => new IndividualAttestation(indiviual),
      ),
    })
  }
}
