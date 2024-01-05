import React from 'react'
import DateConverter from 'chronology/domain/DateConverter'
import { weekDayNames, monthNames } from 'chronology/domain/DateConverterBase'
import { Field } from 'chronology/application/DateConverterFormFieldData'

type Edges = [number, number]

export default function getOptions({
  field,
  dateConverter,
}: {
  field: Field
  dateConverter: DateConverter
}): JSX.Element[] {
  const optionsMap = {
    Year: () => getYearOptions(field, dateConverter),
    Month: () => getMonthOptions(field, dateConverter),
    Day: () => getDayOptions(field, dateConverter),
  }
  for (const key in optionsMap) {
    if (field.name.includes(key)) {
      return optionsMap[key]()
    }
  }
  return []
}

const getValuesAtEdges = (
  fieldName: string,
  dateConverter: DateConverter
): Edges => {
  return [
    dateConverter.earliestDate[fieldName],
    dateConverter.latestDate[fieldName],
  ]
}

const getAllFieldTypeEdges = (
  field: Field,
  dateConverter: DateConverter
): { yearEdges: Edges; monthEdges: Edges; dayEdges: Edges } => {
  const prefixes = getDateFieldPrefixes(field)
  const [yearEdges, monthEdges, dayEdges] = [
    `${prefixes.yearPrefix}Year`,
    `${prefixes.monthPrefix}Month`,
    `${prefixes.dayPrefix}Day`,
  ].map((fieldName) => getValuesAtEdges(fieldName, dateConverter))
  return { yearEdges, monthEdges, dayEdges }
}

const getFieldTypeYearAndMonth = (
  field: Field,
  dateConverter: DateConverter
): { year: number; month: number } => {
  const prefixes = getDateFieldPrefixes(field)
  const year = dateConverter.calendar[`${prefixes.yearPrefix}Year`]
  const month = dateConverter.calendar[`${prefixes.yearPrefix}Month`]
  return { year, month }
}

const getDateFieldPrefixes = (
  field: Field
): { yearPrefix: string; monthPrefix: string; dayPrefix: string } => {
  const toPlainPrefix = (prefix: string) => ({
    yearPrefix: prefix,
    monthPrefix: prefix,
    dayPrefix: prefix,
  })
  if (field.name.includes('gregorian')) {
    return toPlainPrefix('gregorian')
  } else if (field.name.includes('julian')) {
    return toPlainPrefix('julian')
  } else {
    return {
      yearPrefix: 'seBabylonian',
      monthPrefix: 'mesopotamian',
      dayPrefix: 'mesopotamian',
    }
  }
}

function getLabelValueOptions(
  options: { label: string | JSX.Element; value: number | string }[]
): JSX.Element[] {
  return options.map(({ label, value }, index) => (
    <option key={index} value={value}>
      {label}
    </option>
  ))
}

function getYearOptionLabel(
  year: number,
  era: 'western' | 'se' = 'western'
): string {
  const { eraPrefix, beforeEraPrefix } = {
    western: { eraPrefix: 'CE', beforeEraPrefix: 'BCE' },
    se: { eraPrefix: 'SE', beforeEraPrefix: 'BSE' },
  }[era]
  return year < 1
    ? `${Math.abs(year) + 1} ${beforeEraPrefix}`
    : `${year} ${eraPrefix}`
}

function getNumberRangeOptions(
  from: number,
  to: number,
  labelFormatter?: (number) => string
): JSX.Element[] {
  const numbersArray = Array.from(
    { length: to - from + 1 },
    (_, index) => index + from
  )
  return numbersArray.map((number) => (
    <option key={number} value={number}>
      {labelFormatter ? labelFormatter(number) : number}
    </option>
  ))
}

function getStringOptions(options: string[]): JSX.Element[] {
  return options.map((label, index) => (
    <option key={index} value={index + 1}>
      {label}
    </option>
  ))
}

const getYearOptions = (
  field: Field,
  dateConverter: DateConverter
): JSX.Element[] => {
  const seYearLabelGetter = (number) => getYearOptionLabel(number, 'se')
  const labelGetter =
    field.name === 'seBabylonianYear' ? seYearLabelGetter : getYearOptionLabel
  if (field.name !== 'regnalYear') {
    return getNumberRangeOptions(
      ...getValuesAtEdges(field.name, dateConverter),
      labelGetter
    )
  } else if (field.name === 'regnalYear') {
    return getRegnalYearOptions(dateConverter)
  } else {
    return []
  }
}

const getMonthOptions = (
  field: Field,
  dateConverter: DateConverter
): JSX.Element[] => {
  const optionsMap: { [key: string]: () => JSX.Element[] } = {
    gregorianMonth: () => getGregorianJulianMonthOptions(field, dateConverter),
    julianMonth: () => getGregorianJulianMonthOptions(field, dateConverter),
    mesopotamianMonth: () => getMesopotamianMonthOptions(field, dateConverter),
  }
  return optionsMap[field.name]?.() ?? []
}

const getDayOptions = (
  field: Field,
  dateConverter: DateConverter
): JSX.Element[] => {
  if (field.name.includes('week')) {
    return getStringOptions(weekDayNames)
  }
  const indexOffset = getDayOffset(field, dateConverter)
  return getNumberRangeOptions(
    1 + indexOffset[0],
    indexOffset[1] ?? getMonthLength(field, dateConverter)
  )
}

const getMonthLength = (field: Field, dateConverter: DateConverter): number => {
  if (field.name.includes('mesopotamian')) {
    return dateConverter.calendar.mesopotamianMonthLength ?? 30
  } else {
    return dateConverter.getMonthLength(field.name.includes('julian'))
  }
}

const getMonthOffset = (
  field: Field,
  dateConverter: DateConverter
): number[] => {
  let indexOffset = [0]
  const { year } = getFieldTypeYearAndMonth(field, dateConverter)
  const { yearEdges, monthEdges } = getAllFieldTypeEdges(field, dateConverter)
  if (year === yearEdges[0]) {
    indexOffset = [monthEdges[0] - 1]
  } else if (year === yearEdges[1]) {
    indexOffset = [0, monthEdges[1]]
  }
  return indexOffset
}

const getDayOffset = (field: Field, dateConverter: DateConverter): number[] => {
  let indexOffset = [0]
  const { year, month } = getFieldTypeYearAndMonth(field, dateConverter)
  const { yearEdges, monthEdges, dayEdges } = getAllFieldTypeEdges(
    field,
    dateConverter
  )
  if (year === yearEdges[0] && month === monthEdges[0]) {
    indexOffset = [dayEdges[0] - 1]
  } else if (year === yearEdges[1] && month === monthEdges[1]) {
    indexOffset = [0, dayEdges[1]]
  }
  return indexOffset
}

const getGregorianJulianMonthOptions = (
  field: Field,
  dateConverter: DateConverter
): JSX.Element[] => {
  const indexOffset = getMonthOffset(field, dateConverter)
  return getLabelValueOptions(
    monthNames
      .slice(...indexOffset)
      .map((label) => ({ value: monthNames.indexOf(label) + 1, label }))
  )
}

const getMesopotamianMonthOptions = (
  field: Field,
  dateConverter: DateConverter
): JSX.Element[] => {
  const months = dateConverter.getMesopotamianMonthsOfSeYear(
    dateConverter.calendar.seBabylonianYear
  )
  const indexOffset = getMonthOffset(field, dateConverter)
  return getLabelValueOptions(
    months.slice(...indexOffset).map(({ name, number, value }) => {
      return {
        label: `${number}. ${name}`,
        value,
      }
    })
  )
}

const getRegnalYearOptions = (dateConverter: DateConverter): JSX.Element[] => {
  // ToDo: Check
  const { regnalYears } = dateConverter.calendar
  console.log('!!!', regnalYears)
  return regnalYears ? getNumberRangeOptions(1, regnalYears) : []
}

// ToDo: Implement
/*
  const getRulerOptions = (): JSX.Element[] => {
    const kings = kingNames.map( (kingName) => 
    // Modify `rulerToBrinkmanKings` to accept optional kingName
    dateConverter.rulerToBrinkmanKings(kingName))
  }*/
