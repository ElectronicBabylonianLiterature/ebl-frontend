import React, { useState } from 'react'
import { Form, Row, Col } from 'react-bootstrap'
import DateConverter from 'chronology/domain/DateConverter'
import { sections } from 'chronology/application/DateConverterFormFieldData'
import './DateConverterForm.sass'
import { Markdown } from 'common/Markdown'
import MarkupService from 'markup/application/MarkupService'
import Markup from 'markup/ui/markup'
import {
  DateConverterFormControls,
  DateConverterFormSection,
} from 'chronology/ui/DateConverter/DateConverterFormParts'
import { CalendarProps } from 'chronology/domain/DateConverterBase'
import { handleDateConverterFormChange } from 'chronology/application/DateConverterFormChange'

// ToDo:
// - Errors:
//    - Check dates around 1 BCE / CE
//    - Fix errors with first and last ruler

const descriptionMarkup = `The project includes a date converter that is based on the 
@url{https://webspace.science.uu.nl/~gent0113/babylon/babycal_converter.htm}{Babylonian calendar converter} 
developed by Robert H. van Gent, which builds upon the calendrical tables published in @bib{RN2228}. 
The current converter extends to handle modern (proleptic Gregorian) dates.`

const descriptionMarkdown = `The form below presents a dedicated interface designed for users 
who need to convert dates between different ancient calendar systems.
The valid range is between March 29, 625 BCE (PGC), the accession of the Babylonian king Nabopolassar, and February 22, 76 CE (PGC).
Users can choose from three different input scenarios for conversion:

- **Modern date**: For conversion to proleptic Gregorian dates.
- **Julian date**: For conversion to (proleptic) Julian dates.
- **Seleucid Babylonian date**: For dates in the Seleucid Babylonian calendar.
- **Nabonassar date**: For dates in the Nabonassar calendar system (from Nabopolassar on).

Each section of the form is dynamically updating based on the selected scenario. 
Fields that are relevant to the chosen scenario are highlighted for convenience. 
Note that the Babylonian day started at sunset, so the Western dates provided by the 
converter actually represent the time between midnight and the next sunset.`

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
