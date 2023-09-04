import MuseumNumber, { museumNumberToString } from './MuseumNumber'
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
  readonly excavationNumber?: string
  readonly site?: ExcavationSite
  readonly isRegularExcavation?: boolean
}

export interface ArchaeologyDto {
  readonly excavationNumber?: string
  readonly site?: SiteKey
  readonly isRegularExcavation?: boolean
}

export function createArchaeology(
  dto: Omit<ArchaeologyDto, 'excavationNumber'> & {
    excavationNumber?: MuseumNumber
  }
): Archaeology {
  return {
    ...dto,
    excavationNumber: dto.excavationNumber
      ? museumNumberToString(dto.excavationNumber)
      : undefined,
    site: excavationSites[dto.site || ''],
  }
}

export function toArchaeologyDto(archaeology: Archaeology): ArchaeologyDto {
  return {
    ...archaeology,
    site: (archaeology.site?.name || '') as SiteKey,
  }
}
