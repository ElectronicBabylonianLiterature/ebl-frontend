import Reference from 'bibliography/domain/Reference'
import MuseumNumber, { museumNumberToString } from './MuseumNumber'
import { Provenances } from 'corpus/domain/provenance'
import _ from 'lodash'
import { immerable } from 'immer'
import { ReferenceDto } from 'bibliography/domain/referenceDto'
import createReference from 'bibliography/application/createReference'

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
type CommentedDateRange = {
  start?: Date | null
  end?: Date | null
  notes?: string
}
type CommentedDateRangeDto = { start?: string; end?: string; notes?: string }

export class Findspot {
  readonly [immerable] = true

  constructor(
    readonly id: number,
    readonly site: ExcavationSite = excavationSites[''],
    readonly area: string = '',
    readonly building: string = '',
    readonly buildingType: BuildingType = 'UNKNOWN',
    readonly levelLayerPhase: string = '',
    readonly dateRange: CommentedDateRange | null = null,
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
    return `${area}${this.building} (${this.buildingTypeValue}), ${this.levelLayerPhase} ().`
  }
}

export interface Archaeology {
  readonly excavationNumber?: string
  readonly site?: ExcavationSite
  readonly isRegularExcavation?: boolean
  readonly findspotId?: number | null
  readonly findspot?: Findspot | null
}

interface PlanDto {
  svg: string
  references: readonly ReferenceDto[]
}

export type FindspotDto = Pick<
  Findspot,
  | 'area'
  | 'building'
  | 'buildingType'
  | 'levelLayerPhase'
  | 'room'
  | 'context'
  | 'primaryContext'
  | 'notes'
> & {
  _id: number
  site: SiteKey
  dateRange: CommentedDateRangeDto | null
  plans: readonly PlanDto[]
}

export interface ArchaeologyDto {
  readonly excavationNumber?: string
  readonly site?: SiteKey
  readonly isRegularExcavation?: boolean
  readonly findspotId?: number | null
  readonly findspot?: FindspotDto | null
}

function fromDateRangeDto(dto: CommentedDateRangeDto): CommentedDateRange {
  return {
    start: dto.start ? new Date(dto.start) : null,
    end: dto.end ? new Date(dto.end) : null,
    notes: dto.notes || '',
  }
}
function toDateRangeDto(dateRange: CommentedDateRange): CommentedDateRangeDto {
  return {
    start: dateRange.start?.toString(),
    end: dateRange.end?.toString(),
    notes: dateRange.notes,
  }
}
function fromPlanDto(dto: PlanDto): ExcavationPlan {
  return {
    svg: dto.svg,
    references: dto.references.map(createReference),
  }
}

export function fromFindspotDto(dto: FindspotDto): Findspot {
  return new Findspot(
    dto._id,
    excavationSites[dto.site || ''],
    dto.area,
    dto.building,
    dto.buildingType,
    dto.levelLayerPhase,
    dto.dateRange ? fromDateRangeDto(dto.dateRange) : null,
    dto.plans.map(fromPlanDto),
    dto.room,
    dto.context,
    dto.primaryContext,
    dto.notes
  )
}

export function toFindspotDto(findspot: Findspot): FindspotDto {
  return {
    _id: findspot.id,
    area: findspot.area,
    building: findspot.building,
    buildingType: findspot.buildingType,
    levelLayerPhase: findspot.levelLayerPhase,
    room: findspot.room,
    context: findspot.context,
    primaryContext: findspot.primaryContext,
    notes: findspot.notes,
    site: findspot.site.name as SiteKey,
    dateRange: findspot.dateRange ? toDateRangeDto(findspot.dateRange) : null,
    plans: findspot.plans,
  }
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
    findspot: dto.findspot ? fromFindspotDto(dto.findspot) : null,
  }
}

export function toArchaeologyDto(archaeology: Archaeology): ArchaeologyDto {
  return {
    ...archaeology,
    site: (archaeology.site?.name || '') as SiteKey,
    findspot: archaeology.findspot ? toFindspotDto(archaeology.findspot) : null,
  }
}
