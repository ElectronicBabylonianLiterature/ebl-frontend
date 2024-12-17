import { immerable } from 'immer'
import { ReferenceType } from 'bibliography/domain/Reference'
import { Provenance } from 'corpus/domain/provenance'
import { Script } from 'fragmentarium/domain/fragment'

interface DossierRecordData {
  readonly id: string
  readonly description?: string
  readonly isApproximateDate?: boolean
  readonly yearRangeFrom?: number
  readonly yearRangeTo?: number
  readonly relatedKings?: number[]
  readonly provenance?: Provenance
  readonly script?: Script
  readonly references?: ReferenceType[]
}

export default class DossierRecord {
  [immerable] = true

  readonly id: string
  readonly description?: string
  readonly isApproximateDate: boolean
  readonly yearRangeFrom?: number
  readonly yearRangeTo?: number
  readonly relatedKings: number[]
  readonly provenance?: Provenance
  readonly script?: Script
  readonly references: ReferenceType[]

  constructor({
    id,
    description,
    isApproximateDate = false,
    yearRangeFrom,
    yearRangeTo,
    relatedKings = [],
    provenance,
    script,
    references = [],
  }: DossierRecordData) {
    this.id = id
    this.description = description
    this.isApproximateDate = isApproximateDate
    this.yearRangeFrom = yearRangeFrom
    this.yearRangeTo = yearRangeTo
    this.relatedKings = relatedKings
    this.provenance = provenance
    this.script = script
    this.references = references
  }
}
