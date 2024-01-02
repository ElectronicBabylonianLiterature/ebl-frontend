import React from 'react'
import { Form, FormGroup, FormLabel, Popover, Col } from 'react-bootstrap'
import DateConverter from 'chronology/domain/DateConverter'
import HelpTrigger from 'common/HelpTrigger'
import { Field } from 'chronology/application/DateConverterFormFieldData'
import { weekDayNames, monthNames } from 'chronology/domain/DateConverter'
import { CalendarProps } from 'chronology/domain/DateConverterBase'
import { romanize } from 'romans'

const selectFields = [
  'weekDay',
  'gregorianYear',
  'gregorianMonth',
  'gregorianDay',
  'julianYear',
  'julianMonth',
  'julianDay',
  'regnalYear',
  'mesopotamianMonth',
  'mesopotamianDay',
]

export function DateConverterFormField({
  field,
  index,
  dateConverter,
  formData,
  handleChange,
  scenario,
}: {
  field: Field
  index: number
  dateConverter: DateConverter
  formData: CalendarProps
  handleChange: (event) => void
  scenario: string
}): JSX.Element {
  const isSelect = selectFields.includes(field.name)
  return (
    <Col xs={12} sm={12} md={6} lg={6} key={index}>
      <FormGroup>
        <FormLabel htmlFor={field.name}>{field.placeholder}</FormLabel>{' '}
        <DateConverterFormHelpTrigger field={field} />
        <Form.Control
          {...(isSelect
            ? { as: 'select', children: getOptions({ field, dateConverter }) }
            : {})}
          id={field.name}
          name={field.name}
          value={formData[field.name] || ''}
          onChange={handleChange}
          disabled={!fieldIsActive(field.name, scenario)}
          required={field.required && fieldIsActive(field.name, scenario)}
          className={fieldIsActive(field.name, scenario) ? 'active-field' : ''}
        />
      </FormGroup>
    </Col>
  )
}

function getOptions({
  field,
  dateConverter,
}: {
  field: Field
  dateConverter: DateConverter
}): JSX.Element[] {
  if (field.name.includes('Year')) {
    return getYearOptions(field)
  }
  if (field.name.includes('Month')) {
    return getMonthOptions(field)
  }
  if (field.name.includes('Day')) {
    return getDayOptions(field, dateConverter)
  }
  return []
}

const getYearOptions = (field: Field): JSX.Element[] => {
  if (field.name === 'gregorianYear') {
    return getGregorianYearOptions()
  }
  if (field.name === 'julianYear') {
    return getJulianYearOptions()
  }
  if (field.name === 'regnalYear') {
    return getRegnalYearOptions()
  }
  return []
}

const getMonthOptions = (field: Field): JSX.Element[] => {
  if (['gregorianMonth', 'julianMonth'].includes(field.name)) {
    return getGregorianJulianMonthOptions()
  }
  if (field.name === 'mesopotamianMonth') {
    return getMesopotamianMonthOptions()
  }
  return []
}

const getDayOptions = (
  field: Field,
  dateConverter: DateConverter
): JSX.Element[] => {
  if (['gregorianDay', 'julianDay'].includes(field.name)) {
    return getGregorianJulianDayOptions(field, dateConverter)
  }
  if (field.name === 'weekDay') {
    return getGregorianJulianweekDayOptions()
  }
  if (field.name === 'mesopotamianDay') {
    return getMesopotamianDayOptions(dateConverter)
  }
  return []
}

const getGregorianYearOptions = (): JSX.Element[] => {
  // ToDo: Update to Gregorian dates
  return getNumberRangeOptions(-625, 76, getYearOptionLabel)
}

const getJulianYearOptions = (): JSX.Element[] => {
  return getNumberRangeOptions(-625, 76, getYearOptionLabel)
}

const getRegnalYearOptions = (): JSX.Element[] => {
  // ToDo: Implement restrictions
  return getNumberRangeOptions(1, 40)
}

const getGregorianJulianMonthOptions = (): JSX.Element[] => {
  return getStringOptions(monthNames)
}

const getMesopotamianMonthOptions = (): JSX.Element[] => {
  // ToDo: Implement restrictions
  return getNumberRangeOptions(1, 13, romanize)
}

// ToDo: Implement for SE Babylonian Year

const getGregorianJulianDayOptions = (
  field: Field,
  dateConverter: DateConverter
): JSX.Element[] => {
  return getNumberRangeOptions(
    1,
    dateConverter.getMonthLength(field.name.includes('julian'))
  )
}

const getGregorianJulianweekDayOptions = (): JSX.Element[] => {
  return getStringOptions(weekDayNames)
}

const getMesopotamianDayOptions = (
  dateConverter: DateConverter
): JSX.Element[] => {
  return getNumberRangeOptions(
    1,
    dateConverter.calendar?.mesopotamianMonthLength ?? 30
  )
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
  return options.map((name, index) => (
    <option key={index} value={index + 1}>
      {name}
    </option>
  ))
}

function getYearOptionLabel(year: number): string {
  return year < 1 ? `${Math.abs(year) + 1} BCE` : `${year} CE`
}

const fieldIsActive = (fieldName: string, scenario: string) => {
  switch (scenario) {
    case 'setToGregorianDate':
      return ['gregorianYear', 'gregorianMonth', 'gregorianDay'].includes(
        fieldName
      )
    case 'setToJulianDate':
      return ['julianYear', 'julianMonth', 'julianDay'].includes(fieldName)
    case 'setToSeBabylonianDate':
      return [
        'seBabylonianYear',
        'mesopotamianMonth',
        'mesopotamianDay',
      ].includes(fieldName)
    case 'setToMesopotamianDate':
      return [
        'ruler',
        'regnalYear',
        'mesopotamianMonth',
        'mesopotamianDay',
      ].includes(fieldName)
    default:
      return false
  }
}

function DateConverterFormHelpTrigger({
  field,
}: {
  field: Field
}): JSX.Element {
  return (
    <HelpTrigger
      overlay={
        <Popover id={field.name} title={field.name}>
          <Popover.Content>{field.help}</Popover.Content>
        </Popover>
      }
    />
  )
}
