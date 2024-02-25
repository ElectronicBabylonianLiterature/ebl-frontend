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
}
type Stringlike = string | number | null | undefined
function pad(s?: Stringlike, left = ' ', right = ' '): string {
  return s ? `${left}${s}${right}` : ''
}

function padRight(s: Stringlike, right = ' '): string {
  return pad(s, '', right)
}
function parenthesize(s: Stringlike, suffix = ''): string {
  return pad(s, '(', `)${suffix}`)
}
function join(parts: Stringlike[], separator = ' '): string {
  return _.compact(parts).join(separator)
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
    const range = join([start, end], ' - ')

    return join([range, this.date?.notes], ', ')
  }

  private get premises(): string {
    const buildingType = _.capitalize(this.buildingType || '').replaceAll(
      '_',
      ' '
    )
    return join([
      join([this.area, this.building], ' > '),
      parenthesize(buildingType),
    ])
  }

  private get primaryContextString(): string {
    switch (this.primaryContext) {
      case true:
        return 'primary context'
      case false:
        return 'secondary context'
      case null:
        return ''
    }
  }

  toString(): string {
    const layer = join([this.levelLayerPhase, parenthesize(this.dateString())])
    const context = join([
      this.context,
      parenthesize(this.primaryContextString),
    ])

    const parts = join([this.premises, layer, this.room, context], ', ')
    console.log(padRight(_.trimEnd(join([parts, this.notes]), ' .'), '.'))
    return padRight(_.trimEnd(join([parts, this.notes]), ' .'), '.')
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
