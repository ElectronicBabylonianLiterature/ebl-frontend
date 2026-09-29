import { produce, Draft, castDraft, immerable } from 'immer'
import _ from 'lodash'

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
    name?: NameAttestation,
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
    return this.formatItemString(this.name, '')
  }

  private get sonOfString(): string {
    return this.formatItemString(this.sonOf, 's.')
  }
  private get grandsonOfString(): string {
    return this.formatItemString(this.grandsonOf, 'gs.')
  }

  private get familyString(): string {
    return this.formatItemString(this.family, 'f.')
  }

  private get nativeOfString(): string {
    return this.formatItemString(this.nativeOf, 'n.')
  }

  private formatItemString(
    item?: NameAttestation | ProvenanceAttestation,
    prefix?: string,
  ): string {
    if (this.isItemEmpty(item)) {
      return ''
    }

    const prefixString = prefix ? `${prefix} ` : ''
    const valueString = this.formatValueString(
      item as NameAttestation | ProvenanceAttestation,
    )

    return `${prefixString}${valueString}`
  }

  private isItemEmpty(item?: NameAttestation | ProvenanceAttestation): boolean {
    return !item || _.isEmpty(item) || _.every(item, (val) => val === false)
  }

  private formatValueString(
    item: NameAttestation | ProvenanceAttestation,
  ): string {
    const value = item.value ?? '…'
    const brokenSymbol = item.isBroken ? '[' : ''
    const uncertainSymbol = item.isUncertain ? '?' : ''
    const closingBrokenSymbol = item.isBroken ? ']' : ''

    return `${brokenSymbol}${value}${uncertainSymbol}${closingBrokenSymbol}`
  }
}
