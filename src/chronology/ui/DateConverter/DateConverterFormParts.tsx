import React from 'react'
import { FormGroup, FormCheck, Button, Row, Col } from 'react-bootstrap'
import DateConverter from 'chronology/domain/DateConverter'
import { Field } from 'chronology/application/DateConverterFormFieldData'
import { CalendarProps } from 'chronology/domain/DateConverterBase'
import { DateConverterFormField } from 'chronology/ui/DateConverter/DateConverterFormField'

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
            aria-label={scenarioLabels[_scenario]}
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
