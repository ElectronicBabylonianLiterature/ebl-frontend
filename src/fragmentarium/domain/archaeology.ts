import Reference from 'bibliography/domain/Reference'
import MuseumNumber, { museumNumberToString } from './MuseumNumber'
import { Provenances } from 'corpus/domain/provenance'
import _ from 'lodash'
import { DateRange } from './Date'
import { immerable } from 'immer'

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
export type BuildingType =
  | 'RESIDENTIAL'
  | 'TEMPLE'
  | 'PALACE'
  | 'OTHER_MONUMENTAL'
  | 'UNKNOWN'
  | 'NOT_IN_BUILDING'

export interface ExcavationPlan {
  readonly svg: string
  readonly references: readonly Reference[]
}

export class Findspot {
  readonly [immerable] = true

  constructor(
    readonly site: ExcavationSite = excavationSites[''],
    readonly area: string = '',
    readonly building: string = '',
    readonly buildingType: BuildingType = 'UNKNOWN',
    readonly levelLayerPhase: string = '',
    readonly dateRange: (DateRange & { notes?: string }) | null = null,
    readonly plans: readonly ExcavationPlan[] = [],
    readonly room: string = '',
    readonly context: string = '',
    readonly primaryContext: boolean | null = null,
    readonly notes: string = ''
  ) {}

  get buildingTypeValue(): string {
    return this.buildingType === 'NOT_IN_BUILDING'
      ? 'Not in building'
      : _.capitalize(this.buildingType)
  }

  toString(): string {
    const area = this.area ? `${this.area} > ` : ''
    console.log(
      `${area}${this.building} (${this.buildingTypeValue}), ${this.levelLayerPhase} ().`
    )
    return `${area}${this.building} (${this.buildingTypeValue}), ${this.levelLayerPhase} ().`
  }
}

export interface Archaeology {
  readonly excavationNumber?: string
  readonly site?: ExcavationSite
  readonly isRegularExcavation?: boolean
  readonly findspot?: Findspot | null
}

export interface ArchaeologyDto {
  readonly excavationNumber?: string
  readonly site?: SiteKey
  readonly isRegularExcavation?: boolean
  readonly findspot?: any
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
    findspot: _.isNull(dto.findspot)
      ? null
      : new Findspot(
          dto.findspot.site,
          dto.findspot.area,
          dto.findspot.building,
          dto.findspot.buildingType,
          dto.findspot.levelLayerPhase,
          dto.findspot.dateRange,
          dto.findspot.plans,
          dto.findspot.room,
          dto.findspot.context,
          dto.findspot.primaryContext,
          dto.findspot.notes
        ),
  }
}

export function toArchaeologyDto(archaeology: Archaeology): ArchaeologyDto {
  return {
    ...archaeology,
    site: (archaeology.site?.name || '') as SiteKey,
  }
}
