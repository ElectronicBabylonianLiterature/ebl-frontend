import React, { useState } from 'react'
import { Form, Row, Col } from 'react-bootstrap'
import DateConverter from 'chronology/domain/DateConverter'
import { sections } from 'chronology/ui/DateConverterFormFieldData'
import './DateConverterForm.sass'
import { Markdown } from 'common/Markdown'
import MarkupService from 'markup/application/MarkupService'
import Markup from 'markup/ui/markup'
import {
  DateConverterFormControls,
  DateConverterFormSection,
} from 'chronology/ui/DateConverterFormParts'

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
        text="The project includes a date converter that is based on the @url{https://webspace.science.uu.nl/~gent0113/babylon/babycal_converter.htm)}{Babylonian calendar converter} developed by Robert H. van Gent, which builds upon the calendrical tables published in @bib{RN2228}. The current converter extends to handle modern (proleptic Gregorian) dates."
      />
      <Markdown text={description} key="md_description" />
    </>
  )
}

function DateConverterForm(): JSX.Element {
  const [dateConverter] = useState(() => new DateConverter())
  const [formData, setFormData] = useState(dateConverter.calendar)
  const [scenario, setScenario] = useState('setToGregorianDate')

  const handleChange = (event): void => {
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

  const handleScenarioChange = (_scenario: string) => {
    setScenario(_scenario)
  }

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(JSON.stringify(formData))
  }

  return (
    <>
      <Row className="date_converter" key="date_converter">
        <Col md={8}>
          <Form>
            {sections.map(({ title, fields }, index) => (
              <DateConverterFormSection
                key={index}
                title={title}
                fields={fields}
                index={index}
                dateConverter={dateConverter}
                formData={formData}
                handleChange={handleChange}
                scenario={scenario}
              />
            ))}
          </Form>
        </Col>
        <Col md={4}>
          <DateConverterFormControls
            scenario={scenario}
            handleScenarioChange={handleScenarioChange}
            copyToClipboard={copyToClipboard}
          />
        </Col>
      </Row>
    </>
  )
}

export default DateConverterForm
