import React from 'react'
import {
  Form,
  FormGroup,
  FormCheck,
  FormLabel,
  Button,
  Popover,
  Row,
  Col,
} from 'react-bootstrap'
import DateConverter from 'chronology/domain/DateConverter'
import HelpTrigger from 'common/HelpTrigger'
import { Field } from 'chronology/ui/DateConverterFormFieldData'
import { weekDayNames, monthNames } from 'chronology/domain/DateConverter'
import { CalendarProps } from 'chronology/domain/DateConverterBase'

const scenarioLabels = {
  setToGregorianDate: 'Modern date',
  setToJulianDate: 'Julian date',
  setToSeBabylonianDate: 'Seleucid (Babylonian) date',
  setToMesopotamianDate: 'Nabonassar date',
}

export function DateConverterFormControls({
  scenario,
  handleScenarioChange,
  copyToClipboard,
}: {
  scenario: string
  handleScenarioChange: (_scenario: string) => void
  copyToClipboard: () => Promise<void>
}): JSX.Element {
  return (
    <aside className="main__sidebar copy-button-container">
      <FormGroup>
        <h4>Input</h4>
        {Object.keys(scenarioLabels).map((_scenario) => (
          <FormCheck
            type="radio"
            label={scenarioLabels[_scenario]}
            key={_scenario}
            checked={scenario === _scenario}
            onChange={() => handleScenarioChange(_scenario)}
          />
        ))}
      </FormGroup>
      <Button className="copy-button btn btn-light" onClick={copyToClipboard}>
        Copy JSON
      </Button>
    </aside>
  )
}

export function DateConverterFormSection({
  title,
  fields,
  index,
  dateConverter,
  formData,
  handleChange,
  scenario,
}: {
  title: string
  fields: Field[]
  index: number
  dateConverter: DateConverter
  formData: CalendarProps
  handleChange: (event) => void
  scenario: string
}): JSX.Element {
  return (
    <Row
      className={`section-row ${index % 2 === 0 ? 'even' : 'odd'}`}
      key={index}
    >
      <Col md={1} className="section-title">
        <div>{title}</div>
      </Col>
      <Col md={11} className="section-fields">
        <Row>
          {fields.map((field, fieldIndex) => (
            <DateConverterFormField
              key={fieldIndex}
              field={field}
              index={fieldIndex}
              dateConverter={dateConverter}
              formData={formData}
              handleChange={handleChange}
              scenario={scenario}
            />
          ))}
        </Row>
      </Col>
    </Row>
  )
}

function DateConverterFormField({
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
  const isSelect = [
    'weekDay',
    'gregorianYear',
    'gregorianMonth',
    'gregorianDay',
    'julianYear',
    'julianMonth',
    'julianDay',
  ].includes(field.name)
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

function getNamesArray(field: Field): string[] {
  return ['gregorianMonth', 'julianMonth'].includes(field.name)
    ? monthNames
    : field.name === 'weekDay'
    ? weekDayNames
    : []
}

function getOptions({
  field,
  dateConverter,
}: {
  field: Field
  dateConverter: DateConverter
}): JSX.Element[] {
  if (field.name === 'gregorianYear') {
    return getNumberRangeOptions(-625, 76, getYearOptionLabel) // ToDo: Update to Gregorian dates
  }
  if (field.name === 'julianYear') {
    return getNumberRangeOptions(-625, 76, getYearOptionLabel)
  }
  if (['gregorianDay', 'julianDay'].includes(field.name)) {
    return getNumberRangeOptions(
      1,
      dateConverter.getMonthLength(field.name.includes('julian')),
      (number) => number
    )
  }
  return getNamesArray(field).map((name, index) => (
    <option key={index} value={index + 1}>
      {name}
    </option>
  ))
}

function getNumberRangeOptions(
  from: number,
  to: number,
  labelFormatter: (number) => string
): JSX.Element[] {
  const numbersArray = Array.from(
    { length: to - from + 1 },
    (_, index) => index + from
  )

  return numbersArray.map((number) => (
    <option key={number} value={number}>
      {labelFormatter(number)}
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
