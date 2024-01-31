import createReference from 'bibliography/application/createReference'
import { ReferenceDto } from 'bibliography/domain/referenceDto'
import _ from 'lodash'
import {
  Findspot,
  ExcavationPlan,
  PartialDate,
  CommentedDateRange,
} from './archaeology'
import { Archaeology, excavationSites, SiteKey } from './archaeology'

import MuseumNumber, { museumNumberToString } from './MuseumNumber'

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
export interface PartialDateDto {
  year: number
  month?: number | null
  day?: number | null
}

export type CommentedDateRangeDto = {
  start: PartialDateDto
  end?: PartialDateDto | null
  notes?: string | null
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
function createPartialDate(dto): PartialDate {
  return new PartialDate(dto.year, dto.month, dto.day)
}

function fromDateRangeDto(dto: CommentedDateRangeDto): CommentedDateRange {
  return {
    ...dto,
    start: createPartialDate(dto.start),
    end: createPartialDate(dto.end),
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
    dto.dateRange && fromDateRangeDto(dto.dateRange),
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
