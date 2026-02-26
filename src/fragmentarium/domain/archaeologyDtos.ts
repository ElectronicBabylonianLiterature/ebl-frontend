import createReference from 'bibliography/application/createReference'
import { ReferenceDto } from 'bibliography/domain/referenceDto'
import _ from 'lodash'
import { Findspot, ExcavationPlan, PartialDate, DateRange } from './archaeology'
import { Archaeology, excavationSites, SiteKey } from './archaeology'

import MuseumNumber, { museumNumberToString } from './MuseumNumber'

export function createArchaeology(
  dto: Omit<ArchaeologyDto, 'excavationNumber'> & {
    excavationNumber?: MuseumNumber
  },
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

export type DateRangeDto = {
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
  | 'sector'
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
  date: DateRangeDto | null
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

function fromDateRangeDto(dto: DateRangeDto): DateRange {
  return {
    ...dto,
    start: createPartialDate(dto.start),
    end: dto.end ? createPartialDate(dto.end) : null,
  }
}

export function fromFindspotDto(dto: FindspotDto): Findspot {
  return new Findspot(
    dto._id,
    excavationSites[dto.site || ''],
    dto.sector,
    dto.area,
    dto.building,
    dto.buildingType,
    dto.levelLayerPhase,
    dto.date && fromDateRangeDto(dto.date),
    dto.plans.map(fromPlanDto),
    dto.room,
    dto.context,
    dto.primaryContext,
    dto.notes,
  )
}

export function toFindspotDto(findspot: Findspot): FindspotDto {
  return {
    ..._.omit(findspot, 'id'),
    _id: findspot.id,
    site: findspot.site.name as SiteKey,
    plans: findspot.plans.map(toPlanDto),
  }
}
