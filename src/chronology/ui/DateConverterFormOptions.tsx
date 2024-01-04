import React from 'react'
import DateConverter, {
  weekDayNames,
  monthNames,
} from 'chronology/domain/DateConverterBase'
import { Field } from 'chronology/application/DateConverterFormFieldData'

export default function getOptions({
  field,
  dateConverter,
}: {
  field: Field
  dateConverter: DateConverter
}): JSX.Element[] {
  return field.name.includes('Year')
    ? getYearOptions(field)
    : field.name.includes('Month')
    ? getMonthOptions(field, dateConverter)
    : field.name.includes('Day')
    ? getDayOptions(field, dateConverter)
    : []
}

const getYearOptions = (field: Field): JSX.Element[] => {
  return field.name === 'gregorianYear'
    ? getGregorianYearOptions()
    : field.name === 'julianYear'
    ? getJulianYearOptions()
    : field.name === 'regnalYear'
    ? getRegnalYearOptions()
    : field.name === 'seBabylonianYear'
    ? getSeBabylonianYearOptions()
    : []
}

const getMonthOptions = (
  field: Field,
  dateConverter: DateConverter
): JSX.Element[] => {
  if (['gregorianMonth', 'julianMonth'].includes(field.name)) {
    return getGregorianJulianMonthOptions(field, dateConverter)
  }
  if (field.name === 'mesopotamianMonth') {
    return getMesopotamianMonthOptions(dateConverter)
  }
  return []
}

const getDayOptions = (
  field: Field,
  dateConverter: DateConverter
): JSX.Element[] => {
  return ['gregorianDay', 'julianDay'].includes(field.name)
    ? getGregorianJulianDayOptions(field, dateConverter)
    : field.name === 'weekDay'
    ? getGregorianJulianWeekDayOptions()
    : field.name === 'mesopotamianDay'
    ? getMesopotamianDayOptions(dateConverter)
    : []
}

const getGregorianYearOptions = (): JSX.Element[] => {
  return getNumberRangeOptions(-624, 76, getYearOptionLabel)
}

const getJulianYearOptions = (): JSX.Element[] => {
  return getNumberRangeOptions(-625, 76, getYearOptionLabel)
}

const getRegnalYearOptions = (): JSX.Element[] => {
  // ToDo: Implement restrictions
  return getNumberRangeOptions(1, 40)
}

const getSeBabylonianYearOptions = (): JSX.Element[] => {
  return getNumberRangeOptions(-314, 386, (number) =>
    getYearOptionLabel(number, 'se')
  )
}

const getGregorianJulianMonthOptions = (
  field: Field,
  dateConverter: DateConverter
): JSX.Element[] => {
  if (
    field.name === 'gregorianMonth' &&
    dateConverter?.calendar.gregorianYear === -624
  ) {
    return getLabelValueOptions(
      monthNames
        .filter((name, index) => index > 1)
        .map((label) => ({ value: monthNames.indexOf(label) + 1, label }))
    )
  }
  if (
    field.name === 'julianMonth' &&
    dateConverter?.calendar.julianYear === -625
  ) {
    return getLabelValueOptions(
      monthNames
        .filter((name, index) => index > 2)
        .map((label) => ({ value: monthNames.indexOf(label) + 1, label }))
    )
  }
  // ToDo: Implement restrictions for Gregorian months: latest year
  // ToDo: Implement restrictions for Julian months: latest year
  return getStringOptions(monthNames)
}

const getMesopotamianMonthOptions = (
  dateConverter: DateConverter
): JSX.Element[] => {
  // ToDo: Implement restrictions for latest year
  const months = dateConverter.getMesopotamianMonthsOfSeYear(
    dateConverter.calendar.seBabylonianYear
  )
  return getLabelValueOptions(
    months.map(({ name, number, value }) => {
      return {
        label: `${number}. ${name}`,
        value,
      }
    })
  )
}

const getGregorianJulianDayOptions = (
  field: Field,
  dateConverter: DateConverter
): JSX.Element[] => {
  // ToDo: Implement restrictions for first and latest year
  return getNumberRangeOptions(
    1,
    dateConverter.getMonthLength(field.name.includes('julian'))
  )
}

const getGregorianJulianWeekDayOptions = (): JSX.Element[] => {
  return getStringOptions(weekDayNames)
}

const getMesopotamianDayOptions = (
  dateConverter: DateConverter
): JSX.Element[] => {
  // ToDo: Implement restrictions for latest year
  return getNumberRangeOptions(
    1,
    dateConverter.calendar?.mesopotamianMonthLength ?? 30
  )
}

/*
  const getRulerOptions = (): JSX.Element[] => {
    // ToDo: Implement 
    return getStringOptions([])
    //return getStringOptions(rulerNames)
  }*/

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
