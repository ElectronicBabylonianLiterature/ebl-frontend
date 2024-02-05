import Reference from 'bibliography/domain/Reference'
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
export class PartialDate {
  readonly year: number
  readonly month?: number | null
  readonly day?: number | null

  constructor(
    year: number,
    month: number | null = null,
    day: number | null = null
  ) {
    this.year = year
    this.month = month
    this.day = day
  }

  toString(): string {
    return this.year >= 0
      ? _.reject([this.year, this.month, this.day], _.isNil).join('/')
      : `${Math.abs(this.year)} BCE`
  }
}
export type DateRange = {
  start: PartialDate
  end?: PartialDate | null
  notes?: string | null
  isPostCanonical?: boolean | null
}
function pad(s?: string | number | null, left = ' ', right = ' '): string {
  return s ? `${left}${s}${right}` : ''
}
function padLeft(s?: string | number | null, left = ' '): string {
  return pad(s, left, '')
}
function padRight(s: string | number | null, right = ' '): string {
  return pad(s, '', right)
}

export class Findspot {
  constructor(
    readonly id: number,
    readonly site: ExcavationSite = excavationSites[''],
    readonly area: string = '',
    readonly building: string = '',
    readonly buildingType: BuildingType | null = null,
    readonly levelLayerPhase: string = '',
    readonly date: DateRange | null = null,
    readonly plans: readonly ExcavationPlan[] = [],
    readonly room: string = '',
    readonly context: string = '',
    readonly primaryContext: boolean | null = null,
    readonly notes: string = ''
  ) {}

  private dateString(): string {
    const start = this.date?.start.toString()
    const end = this.date?.end?.toString()
    const notes = padLeft(this.date?.notes, ', ')

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
  readonly date?: DateRange | null
  readonly findspotId?: number | null
  readonly findspot?: Findspot | null
}
