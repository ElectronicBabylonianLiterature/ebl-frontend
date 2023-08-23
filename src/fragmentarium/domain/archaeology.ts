import { Provenance } from 'corpus/domain/provenance'
import MuseumNumber from './MuseumNumber'
import { Provenances } from 'corpus/domain/provenance'
import _ from 'lodash'

export const excavationSites = {
  ..._.omit(Provenances, 'Standard Text'),
  '': {
    name: '',
    abbreviation: '',
    parent: null,
  },
}

export type SiteKey = keyof typeof excavationSites
export type ExcavationSite = typeof excavationSites[SiteKey]

export interface Archaeology {
  readonly excavationNumber: MuseumNumber
  readonly site: Provenance
}

export interface ArchaeologyDto {
  excavationNumber: MuseumNumber
  site?: SiteKey
}

export function createArchaeology(dto: ArchaeologyDto): Archaeology {
  return {
    ...dto,
    site: Provenances[dto.site || ''],
  }
}

export function toArchaeologyDto(archaeology: Archaeology): ArchaeologyDto {
  return {
    ...archaeology,
    site: archaeology.site.name as SiteKey,
  }
}
