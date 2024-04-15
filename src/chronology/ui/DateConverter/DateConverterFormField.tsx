import React from 'react'
import { Form, FormGroup, FormLabel, Popover, Col } from 'react-bootstrap'
import DateConverter from 'chronology/domain/DateConverter'
import HelpTrigger from 'common/HelpTrigger'
import { Field } from 'chronology/application/DateConverterFormFieldData'
import { CalendarProps } from 'chronology/domain/DateConverterBase'
import getOptions from 'chronology/ui/DateConverter/DateConverterFormOptions'

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
  'seBabylonianYear',
  'ruler',
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
