import React, { useState } from 'react'
import {
  Form,
  FormGroup,
  FormControl,
  Row,
  Col,
  FormCheck,
  FormLabel,
  Popover,
  Button,
} from 'react-bootstrap'
import DateConverter from 'chronology/domain/DateConverter'
import HelpTrigger from 'common/HelpTrigger'
import { sections, Field } from 'chronology/ui/DateConverterFormFieldData'
import './DateConverterForm.sass'
import { Markdown } from 'common/Markdown'

// ToDo:
// Fix errors. Note that changing the modern month moves the seleucid years (!).

const description = `The project uses a date converter that is based on the converter developed by [Robert H. van Gent](https://webspace.science.uu.nl/~gent0113/babylon/babycal_converter.htm).
The form below presents a dedicated interface designed for users who need to convert dates between different ancient calendar systems. Users can choose from three different input scenarios for conversion:

- **Modern Date**: For conversion related to contemporary dates.
- **Seleucid (Babylonian) Date**: For dates in the Seleucid or Babylonian calendar.
- **Nabonassar Date**: For dates in the Nabonassar calendar system.

Each section of the form is dynamically updating based on the selected scenario. Fields that are relevant to the chosen scenario are highlighted for convenience.`

function DateForm(): JSX.Element {
  const dateConverter = new DateConverter()
  const [formData, setFormData] = useState(dateConverter.calendar)
  const [scenario, setScenario] = useState('setToModernDate')

  const handleChange = (event) => {
    const { name, value } = event.target
    const _formData = { ...formData, [name]: value }
    const {
      year,
      month,
      day,
      ruler,
      regnalYear,
      seBabylonianYear,
      mesopotamianMonth,
      mesopotamianDay,
    } = _formData
    const setSeBabylonianDateArgs = [
      seBabylonianYear,
      mesopotamianMonth,
      mesopotamianDay,
    ]
    const setMesopotamianDateArgs = [
      ruler,
      regnalYear,
      mesopotamianMonth,
      mesopotamianDay,
    ]
    if (scenario === 'setToModernDate') {
      dateConverter.setToModernDate(
        year as number,
        month as number,
        day as number
      )
    } else if (
      scenario === 'setSeBabylonianDate' &&
      !setSeBabylonianDateArgs.includes(undefined)
    ) {
      dateConverter.setSeBabylonianDate(
        seBabylonianYear as number,
        mesopotamianMonth as number,
        mesopotamianDay as number
      )
    } else if (
      scenario === 'setMesopotamianDate' &&
      !setMesopotamianDateArgs.includes(undefined)
    ) {
      dateConverter.setMesopotamianDate(
        ruler as string,
        regnalYear as number,
        mesopotamianMonth as number,
        mesopotamianDay as number
      )
    }
    setFormData({ ...dateConverter.calendar })
  }

  const handleScenarioChange = (_scenario) => {
    setScenario(_scenario)
  }

  const fieldIsActive = (fieldName) => {
    switch (scenario) {
      case 'setToModernDate':
        return ['year', 'month', 'day'].includes(fieldName)
      case 'setSeBabylonianDate':
        return [
          'seBabylonianYear',
          'mesopotamianMonth',
          'mesopotamianDay',
        ].includes(fieldName)
      case 'setMesopotamianDate':
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

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(JSON.stringify(formData))
  }

  function getField(field: Field, index: number): JSX.Element {
    return (
      <Col xs={12} sm={12} md={6} lg={6} key={index}>
        <FormGroup>
          <FormLabel htmlFor={field.name}>{field.placeholder}</FormLabel>{' '}
          <HelpTrigger
            overlay={
              <Popover id={field.name} title={field.name}>
                <Popover.Content>{field.help}</Popover.Content>
              </Popover>
            }
          />
          <FormControl
            id={field.name}
            name={field.name}
            type={field.type}
            value={formData[field.name] || ''}
            onChange={handleChange}
            placeholder={field.placeholder}
            disabled={!fieldIsActive(field.name)}
            required={field.required && fieldIsActive(field.name)}
            className={fieldIsActive(field.name) ? 'active-field' : ''}
          />
        </FormGroup>
      </Col>
    )
  }

  function getSection(
    title: string,
    fields: Field[],
    index: number
  ): JSX.Element {
    return (
      <Row className={`section-row ${index % 2 === 0 ? 'even' : 'odd'}`}>
        <Col md={1} className="section-title">
          <div>{title}</div>
        </Col>
        <Col md={11} className="section-fields">
          <Row>
            {fields.map((field, fieldIndex) => getField(field, fieldIndex))}
          </Row>
        </Col>
      </Row>
    )
  }

  const scenarioLabels = {
    setToModernDate: 'Modern date',
    setSeBabylonianDate: 'Seleucid (Babylonian) date',
    setMesopotamianDate: 'Nabonassar date',
  }

  function getControls(): JSX.Element {
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

  return (
    <>
      <Markdown text={description} />
      <Row className="date_converter">
        <Col md={8}>
          <Form>
            {sections.map(({ title, fields }, index) =>
              getSection(title, fields, index)
            )}
          </Form>
        </Col>
        <Col md={4}>{getControls()}</Col>
      </Row>
    </>
  )
}

export default DateForm
