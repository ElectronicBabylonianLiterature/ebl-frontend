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
export type CommentedDateRange = {
  start?: number
  end?: number
  notes?: string
}
export type CommentedDateRangeDto = {
  start?: number
  end?: number
  notes?: string
}

function makeDate(date?: number) {
  return date || date === 0 ? `${Math.abs(date)}${date < 0 ? ' BCE' : ''}` : ''
}
function pad(s?: string, left = ' ', right = ' '): string {
  return s ? `${left}${s}${right}` : ''
}
function padLeft(s?: string, left = ' '): string {
  return pad(s, left, '')
}
function padRight(s: string, right = ' '): string {
  return pad(s, '', right)
}

export class Findspot {
  readonly [immerable] = true

  constructor(
    readonly id: number,
    readonly site: ExcavationSite = excavationSites[''],
    readonly area: string = '',
    readonly building: string = '',
    readonly buildingType: BuildingType | null = null,
    readonly levelLayerPhase: string = '',
    readonly dateRange: CommentedDateRange | null = null,
    readonly plans: readonly ExcavationPlan[] = [],
    readonly room: string = '',
    readonly context: string = '',
    readonly primaryContext: boolean | null = null,
    readonly notes: string = ''
  ) {}

  private dateString(): string {
    const start = makeDate(this.dateRange?.start)
    const end = makeDate(this.dateRange?.end)
    const notes = padLeft(this.dateRange?.notes, ', ')

    return end ? ` (${start} - ${end}${notes})` : start ? ` (${start})` : ''
  }

  toString(): string {
    const area = padRight(this.area, ' > ')
    const dateInfo = this.dateString()
    const notes = padLeft(this.notes, ', ')
    const buildingTypeInfo =
      this.buildingType === 'NOT_IN_BUILDING'
        ? ' (Not in building)'
        : !this.buildingType
        ? ''
        : ` (${_.capitalize(this.buildingType)})`
    const buildingSep = this.levelLayerPhase || dateInfo || notes ? ',' : ''
    return `${area}${this.building}${buildingTypeInfo}${buildingSep}${padLeft(
      this.levelLayerPhase
    )}${dateInfo}${_.trimEnd(notes, '.')}.`
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

export type ArchaeologyDto = Omit<Archaeology, 'site' | 'findspot'> & {
  site?: SiteKey
  findspot?: FindspotDto | null
}

export function fromPlanDto(dto: PlanDto): ExcavationPlan {
  return {
    svg: dto.svg,
    references: dto.references.map(createReference),
  }
}
export function toPlanDto(plan: ExcavationPlan): PlanDto {
  return {
    svg: plan.svg,
    references: plan.references.map((reference) => ({
      ..._.pick(reference, 'id', 'type', 'pages', 'notes', 'linesCited'),
      document: reference.document.toCslData(),
    })),
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
    dto.dateRange,
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
    dateRange: findspot.dateRange,
    plans: findspot.plans.map(toPlanDto),
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
