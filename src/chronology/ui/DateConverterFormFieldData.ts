const generalInformationFields = [
  {
    name: 'year',
    type: 'number',
    placeholder: 'Year',
    required: true,
    help:
      'The modern (Gregorian) CE year. BCE years are displayed in negative numbers, e.g. -310 for 311 BCE.',
  },
  {
    name: 'bcYear',
    type: 'number',
    placeholder: 'BCE Year',
    help: 'The modern (Gregorian) BCE year, if before CE.',
  },
  {
    name: 'month',
    type: 'number',
    placeholder: 'Month',
    required: true,
    help: 'The modern (Gregorian) month as a number from 1 to 12.',
  },
  {
    name: 'day',
    type: 'number',
    placeholder: 'Day',
    required: true,
    help: 'The modern (Gregorian) day of the month as a number from 1 to 31.',
  },
  {
    name: 'weekDay',
    type: 'number',
    placeholder: 'Week Day',
    required: true,
    help:
      'The modern (Gregorian) day of the week as a number from 1 (Monday) to 7 (Sunday).',
  },
]

const specializedDateInformationFields = [
  {
    name: 'cjdn',
    type: 'number',
    placeholder: 'CJDN',
    required: true,
    help:
      'Chronological Julian Day Number, a continuous count of days since the beginning of the Julian Period (November 24, 4714 BCE in the proleptic Gregorian calendar).',
  },
  {
    name: 'lunationNabonassar',
    type: 'number',
    placeholder: 'Lunation Nabonassar',
    help:
      'Lunation following the Nabonassar (Nabû-nāṣir, 747-734 BCE) Era. Begins on Wednesday, February 26, 747 BCE.',
    required: true,
  },
]

const seleucidEraInformationFields = [
  {
    name: 'seBabylonianYear',
    type: 'number',
    placeholder: 'SE Babylonian Year',
    required: true,
    help: 'Seleucid Era Babylonian year, counting from the year 312 BCE.',
  },
  {
    name: 'seMacedonianYear',
    type: 'number',
    placeholder: 'SE Macedonian Year',
    help: 'Seleucid Era Macedonian year, counting from the year 312 BCE.',
  },
  {
    name: 'seArsacidYear',
    type: 'number',
    placeholder: 'SE Arsacid Year',
    help: 'Year count during the Arsacid (Parthian) Dynasty, 247 BCE - 224 CE.',
  },
]

const mesopotamianDateInformationFields = [
  {
    name: 'ruler',
    type: 'text',
    placeholder: 'Ruler',
    help: 'Name of the ruler or king reigning at the time.',
  },
  {
    name: 'regnalYear',
    type: 'number',
    placeholder: 'Regnal Year',
    help:
      'Regnal year, or the year of the ruler’s reign, as a number starting from 1.',
  },
  {
    name: 'mesopotamianMonth',
    type: 'number',
    placeholder: 'Mesopotamian Month',
    required: true,
    help:
      'Mesopotamian month as a number from 1 to 12 or 13 (depending on the year).',
  },
  {
    name: 'mesopotamianDay',
    type: 'number',
    placeholder: 'Mesopotamian Day',
    help: 'Mesopotamian day of the month as a number from 1 to 30.',
  },
  {
    name: 'mesopotamianMonthLength',
    type: 'number',
    placeholder: 'Mesopotamian Month Length',
    help: 'Length of the Mesopotamian month, either 29 or 30 days.',
  },
]

export const sections = [
  { title: 'Modern', fields: generalInformationFields },
  { title: 'Mesopotamian', fields: mesopotamianDateInformationFields },
  { title: 'Seleucid', fields: seleucidEraInformationFields },
  {
    title: 'Specialized',
    fields: specializedDateInformationFields,
  },
]

export type Field = {
  name: string
  type: string
  placeholder: string
  required?: boolean
  help: string
}
