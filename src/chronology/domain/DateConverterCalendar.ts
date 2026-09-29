export const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export const weekDayNames = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

export const babylonianMonths = [
  { name: 'Nisannu', number: 'I', value: 1 },
  { name: 'Ayyāru', number: 'II', value: 2 },
  { name: 'Simānu', number: 'III', value: 3 },
  { name: 'Duʾūzu', number: 'IV', value: 4 },
  { name: 'Abu', number: 'V', value: 5 },
  { name: 'Ulūlu', number: 'VI', value: 6 },
  { name: 'Tašrītu', number: 'VII', value: 7 },
  { name: 'Araḫsamna', number: 'VIII', value: 8 },
  { name: 'Kislīmu', number: 'IX', value: 9 },
  { name: 'Ṭebētu', number: 'X', value: 10 },
  { name: 'Šabāṭu', number: 'XI', value: 11 },
  { name: 'Addaru', number: 'XII', value: 12 },
  { name: 'Ulūlu II', number: 'VIb', value: 13 },
  { name: 'Addāru II', number: 'XIIb', value: 14 },
]

export interface GregorianProps {
  gregorianYear: number
  gregorianMonth: number
  gregorianDay: number
}

export interface JulianProps {
  julianYear: number
  julianMonth: number
  julianDay: number
}

export interface SeBabylonianProps {
  seBabylonianYear: number
  mesopotamianMonth: number
  mesopotamianDay?: number
}

export interface CalendarProps
  extends GregorianProps, JulianProps, SeBabylonianProps {
  bcGregorianYear?: number
  bcJulianYear?: number
  weekDay: number
  cjdn: number
  lunationNabonassar: number
  seMacedonianYear?: number
  seArsacidYear?: number
  mesopotamianMonthLength?: number
  ruler?: string
  regnalYear?: number
  regnalYears?: number
}
