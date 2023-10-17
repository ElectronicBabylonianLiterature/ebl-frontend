import React, { useState } from 'react'
import {
  Form,
  FormGroup,
  Row,
  Col,
  FormCheck,
  FormLabel,
  Popover,
  Button,
} from 'react-bootstrap'
import DateConverter, {
  weekDayNames,
  monthNames,
} from 'chronology/domain/DateConverter'
import HelpTrigger from 'common/HelpTrigger'
import { sections, Field } from 'chronology/ui/DateConverterFormFieldData'
import './DateConverterForm.sass'
import { Markdown } from 'common/Markdown'
import MarkupService from 'markup/application/MarkupService'
import Markup from 'markup/ui/markup'

// ToDo:
// - General range: 29 March 625? BCE - 22 February 76? CE.
//    - Check the valid range and adjust description. This should be a correct PGC date.
//    - Month:
//      - 626 BCE - until March only (incl.)
//      - 76 CE - until February (incl.)
//    - Day:
//      - March 626 BCE from the 29th (incl.)
//      - February 76 CE - until the 22nd (incl.)
// - Errors:
//    - January & February have issues (both Julean & Gregorian date drifts upon change)
// - Mesopotamian month & day should be selectable.
//    - Month displayed as text with latin number.
//    - Days (both modern & Mes.) should be restricted to the actual number.
// - Regnal years should be selectable and restricted.
// - Add tests
// - Refactor
// - Clean up

const description = `The form below presents a dedicated interface designed for users who need to convert dates between different ancient calendar systems.
The valid range is between March 29, 624 BCE (PGC), the accession of the Babylonian king Nabopolassar, and February 22, 76 CE (PGC).
Users can choose from three different input scenarios for conversion:

- **Modern date**: For conversion to proleptic Gregorian dates.
- **Julian date**: For conversion to (proleptic) Julian dates.
- **Seleucid Babylonian date**: For dates in the Seleucid Babylonian calendar.
- **Nabonassar date**: For dates in the Nabonassar calendar system (from Nabopolassar on).

Each section of the form is dynamically updating based on the selected scenario. Fields that are relevant to the chosen scenario are highlighted for convenience.`

export function AboutDateConverter(markupService: MarkupService): JSX.Element {
  return (
    <>
      <Markup
        key="markup_intro"
        markupService={markupService}
        text="The project includes a date converter that is based on the @url{https://webspace.science.uu.nl/~gent0113/babylon/babycal_converter.htm)}{Babylonian calendar converter} developed by Robert H. van Gent, which builds upon the calendrical tables published in @bib{RN2228}. The current converter extends to handle modern (proleptic Gregorian) dates"
      />
      <Markdown text={description} key="md_description" />
    </>
  )
}

function DateConverterForm(): JSX.Element {
  const [dateConverter] = useState(() => new DateConverter())
  const [formData, setFormData] = useState(dateConverter.calendar)
  const [scenario, setScenario] = useState('setToGregorianDate')

  const handleChange = (event) => {
    const { name, value } = event.target
    const _formData = {
      ...formData,
      [name]: name === 'ruler' ? value : parseInt(value),
    }
    const {
      gregorianYear,
      gregorianMonth,
      gregorianDay,
      julianYear,
      julianMonth,
      julianDay,
      ruler,
      regnalYear,
      seBabylonianYear,
      mesopotamianMonth,
      mesopotamianDay,
    } = _formData
    const setToSeBabylonianDateArgs = [
      seBabylonianYear,
      mesopotamianMonth,
      mesopotamianDay,
    ]
    const setToMesopotamianDateArgs = [
      ruler,
      regnalYear,
      mesopotamianMonth,
      mesopotamianDay,
    ]
    if (scenario === 'setToGregorianDate') {
      dateConverter.setToGregorianDate(
        gregorianYear as number,
        gregorianMonth as number,
        gregorianDay as number
      )
    } else if (scenario === 'setToJulianDate') {
      dateConverter.setToJulianDate(
        julianYear as number,
        julianMonth as number,
        julianDay as number
      )
    } else if (
      scenario === 'setToSeBabylonianDate' &&
      !setToSeBabylonianDateArgs.includes(undefined)
    ) {
      dateConverter.setToSeBabylonianDate(
        seBabylonianYear as number,
        mesopotamianMonth as number,
        mesopotamianDay as number
      )
    } else if (
      scenario === 'setToMesopotamianDate' &&
      !setToMesopotamianDateArgs.includes(undefined)
    ) {
      dateConverter.setToMesopotamianDate(
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

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(JSON.stringify(formData))
  }

  function getField(field: Field, index: number): JSX.Element {
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
          {getHelpTrigger(field)}
          <Form.Control
            {...(isSelect ? { as: 'select', children: getOptions(field) } : {})}
            id={field.name}
            name={field.name}
            value={formData[field.name] || ''}
            onChange={handleChange}
            disabled={!fieldIsActive(field.name)}
            required={field.required && fieldIsActive(field.name)}
            className={fieldIsActive(field.name) ? 'active-field' : ''}
          />
        </FormGroup>
      </Col>
    )
  }

  function getHelpTrigger(field: Field): JSX.Element {
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

  function getOptions(field: Field): JSX.Element[] {
    if (field.name === 'gregorianYear') {
      return getNumberRangeOptions(-625, 76, getYearOptionLabel) //ToDo: Update to Gregorian dates
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
    const namesArray = ['gregorianMonth', 'julianMonth'].includes(field.name)
      ? monthNames
      : field.name === 'weekDay'
      ? weekDayNames
      : []
    return namesArray.map((name, index) => (
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

  function getSection(
    title: string,
    fields: Field[],
    index: number
  ): JSX.Element {
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
            {fields.map((field, fieldIndex) => getField(field, fieldIndex))}
          </Row>
        </Col>
      </Row>
    )
  }

  const scenarioLabels = {
    setToGregorianDate: 'Modern date',
    setToJulianDate: 'Julian date',
    setToSeBabylonianDate: 'Seleucid (Babylonian) date',
    setToMesopotamianDate: 'Nabonassar date',
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
      <Row className="date_converter" key="date_converter">
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

export default DateConverterForm
