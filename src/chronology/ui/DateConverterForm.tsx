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
import { CalendarProps } from 'chronology/domain/DateConverterBase'
import { handleDateConverterFormChange } from 'chronology/application/DateConverterFormChange'

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
// - Clean up

const descriptionMarkup = `The project includes a date converter that is based on the 
@url{https://webspace.science.uu.nl/~gent0113/babylon/babycal_converter.htm)}
{Babylonian calendar converter} developed by Robert H. van Gent, which builds upon the calendrical tables published in @bib{RN2228}. 
The current converter extends to handle modern (proleptic Gregorian) dates.`

const descriptionMarkdown = `The form below presents a dedicated interface designed for users who need to convert dates between different ancient calendar systems.
The valid range is between March 29, 624 BCE (PGC), the accession of the Babylonian king Nabopolassar, and February 22, 76 CE (PGC).
Users can choose from three different input scenarios for conversion:

- **Modern date**: For conversion to proleptic Gregorian dates.
- **Julian date**: For conversion to (proleptic) Julian dates.
- **Seleucid Babylonian date**: For dates in the Seleucid Babylonian calendar.
- **Nabonassar date**: For dates in the Nabonassar calendar system (from Nabopolassar on).

Each section of the form is dynamically updating based on the selected scenario. 
Fields that are relevant to the chosen scenario are highlighted for convenience.`

export function AboutDateConverter(markupService: MarkupService): JSX.Element {
  return (
    <>
      <Markup
        key="markup_intro"
        markupService={markupService}
        text={descriptionMarkup}
      />
      <Markdown text={descriptionMarkdown} key="md_description" />
    </>
  )
}

interface ConverterFormParams {
  scenario: string
  formData: CalendarProps
  dateConverter: DateConverter
  setScenario: React.Dispatch<React.SetStateAction<string>>
  setFormData: React.Dispatch<React.SetStateAction<CalendarProps>>
}

interface ConverterFormMethods {
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  handleScenarioChange: (_scenario: string) => void
  copyToClipboard: () => Promise<void>
}

export interface FormChangeProps extends ConverterFormParams {
  event: React.ChangeEvent<HTMLInputElement>
}

interface FormProps extends ConverterFormParams, ConverterFormMethods {}

function useConverterFormMethods(
  converterFormState: ConverterFormParams
): ConverterFormMethods {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    handleDateConverterFormChange({
      ...converterFormState,
      event,
    })
  const handleScenarioChange = (_scenario: string): void => {
    converterFormState.setScenario(_scenario)
  }
  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(
      JSON.stringify(converterFormState.formData)
    )
  }
  return {
    handleChange,
    handleScenarioChange,
    copyToClipboard,
  }
}

function useConverterForm(): FormProps {
  const [dateConverter] = useState(() => new DateConverter())
  const [formData, setFormData] = useState(dateConverter.calendar)
  const [scenario, setScenario] = useState('setToGregorianDate')
  const converterFormState = {
    scenario,
    setScenario,
    formData,
    setFormData,
    dateConverter,
  }
  return {
    ...converterFormState,
    ...useConverterFormMethods(converterFormState),
  }
}

function DateConverterFormContent(params: FormProps): JSX.Element {
  return (
    <Form>
      {sections.map(({ title, fields }, index) => (
        <DateConverterFormSection
          key={index}
          title={title}
          fields={fields}
          index={index}
          dateConverter={params.dateConverter}
          formData={params.formData}
          handleChange={params.handleChange}
          scenario={params.scenario}
        />
      ))}
    </Form>
  )
}

function DateConverterFormControlsContent(params: FormProps): JSX.Element {
  return (
    <DateConverterFormControls
      scenario={params.scenario}
      handleScenarioChange={params.handleScenarioChange}
      copyToClipboard={params.copyToClipboard}
    />
  )
}

function DateConverterForm(): JSX.Element {
  const params = useConverterForm()
  return (
    <>
      <Row className="date_converter" key="date_converter">
        <Col md={8}>
          <DateConverterFormContent {...params} />
        </Col>
        <Col md={4}>
          <DateConverterFormControlsContent {...params} />
        </Col>
      </Row>
    </>
  )
}

export default DateConverterForm
