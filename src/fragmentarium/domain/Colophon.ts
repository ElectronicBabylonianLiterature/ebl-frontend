import produce, { Draft, castDraft, immerable } from 'immer'

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

export enum IndividualType {
  Owner = 'Owner',
  Scribe = 'Scribe',
  Other = 'Other',
}

export interface NameAttestation {
  readonly value?: string
  readonly isBroken?: boolean
  readonly isUncertain?: boolean
}

export interface ProvenanceAttestation {
  readonly value?: string
  readonly isBroken?: boolean
  readonly isUncertain?: boolean
}

export interface IndividualTypeAttestation {
  readonly value?: IndividualType
  readonly isBroken?: boolean
  readonly isUncertain?: boolean
}

export interface IndividualAttestationDto {
  readonly name?: NameAttestation
  readonly sonOf?: NameAttestation
  readonly grandsonOf?: NameAttestation
  readonly family?: NameAttestation
  readonly nativeOf?: ProvenanceAttestation
  readonly type?: IndividualTypeAttestation
}

export class IndividualAttestation {
  readonly [immerable] = true
  readonly name?: NameAttestation
  readonly sonOf?: NameAttestation
  readonly grandsonOf?: NameAttestation
  readonly family?: NameAttestation
  readonly nativeOf?: ProvenanceAttestation
  readonly type?: IndividualTypeAttestation

  constructor({
    name,
    sonOf,
    grandsonOf,
    family,
    nativeOf,
    type,
  }: {
    readonly name?: NameAttestation
    readonly sonOf?: NameAttestation
    readonly grandsonOf?: NameAttestation
    readonly family?: NameAttestation
    readonly nativeOf?: ProvenanceAttestation
    readonly type?: IndividualTypeAttestation
  }) {
    this.name = name
    this.sonOf = sonOf
    this.grandsonOf = grandsonOf
    this.family = family
    this.nativeOf = nativeOf
    this.type = type
  }

  setNameField(
    field: 'name' | 'sonOf' | 'grandsonOf' | 'family',
    name?: NameAttestation
  ): IndividualAttestation {
    return produce(this, (draft: Draft<IndividualAttestation>) => {
      draft[field] = castDraft(name)
    })
  }

  setTypeField(type?: IndividualTypeAttestation): IndividualAttestation {
    return produce(this, (draft: Draft<IndividualAttestation>) => {
      draft.type = castDraft(type)
    })
  }

  setNativeOf(provenance?: ProvenanceAttestation): IndividualAttestation {
    return produce(this, (draft: Draft<IndividualAttestation>) => {
      draft.nativeOf = castDraft(provenance)
    })
  }

  toString(): string {
    return `${this.typeString}${[
      this.nameString,
      this.sonOfString,
      this.grandsonOfString,
      this.familyString,
      this.nativeOfString,
    ]
      .filter((value) => value !== '')
      .join(', ')}`
  }

  private get typeString(): string {
    return this?.type?.value ? `${this.type.value}: ` : ''
  }
  private get nameString(): string {
    return this?.name?.value ?? ''
  }

  private get sonOfString(): string {
    return this?.sonOf?.value ? `s. ${this.sonOf.value}` : ''
  }
  private get grandsonOfString(): string {
    return this?.grandsonOf?.value ? `gs. ${this.grandsonOf.value}` : ''
  }

  private get familyString(): string {
    return this?.family?.value ? `f. ${this.family.value}` : ''
  }

  private get nativeOfString(): string {
    return this?.nativeOf?.value ? `n. ${this.nativeOf.value}` : ''
  }
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
        (indiviual) => new IndividualAttestation(indiviual)
      ),
    })
  }
}
