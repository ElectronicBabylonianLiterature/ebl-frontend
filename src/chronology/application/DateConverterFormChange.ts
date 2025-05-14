import DateConverter from 'chronology/domain/DateConverter'
import { CalendarProps } from 'chronology/domain/DateConverterBase'
import { FormChangeProps } from 'chronology/ui/DateConverter/DateConverterForm'

export function handleDateConverterFormChange({
  event,
  scenario,
  formData,
  dateConverter,
  setFormData,
}: FormChangeProps): void {
  const { name, value } = event.target
  const data = {
    ...formData,
    [name]: name === 'ruler' ? value : parseInt(value),
  } as CalendarProps
  if (scenario === 'setToGregorianDate') {
    setFormToGregorianDate(data, dateConverter)
  } else if (scenario === 'setToJulianDate') {
    setFormToJulianDate(data, dateConverter)
  } else if (isSetSeBabylonianDate(scenario, data)) {
    setFormToSeBabylonianDate(data, dateConverter)
  } else if (isSetMesopotamianDate(scenario, data)) {
    setFormToMesopotamianDate(data, dateConverter)
  }
  setFormData({ ...dateConverter.calendar })
}

function isSetSeBabylonianDate(scenario: string, data: CalendarProps): boolean {
  const setToSeBabylonianDateArgs = [
    data.seBabylonianYear,
    data.mesopotamianMonth,
    data.mesopotamianDay,
  ]
  return !!(
    scenario === 'setToSeBabylonianDate' &&
    !setToSeBabylonianDateArgs.includes(undefined)
  )
}

function isSetMesopotamianDate(scenario: string, data: CalendarProps): boolean {
  const setToMesopotamianDateArgs = [
    data.ruler,
    data.regnalYear,
    data.mesopotamianMonth,
    data.mesopotamianDay,
  ]
  return !!(
    scenario === 'setToMesopotamianDate' &&
    !setToMesopotamianDateArgs.includes(undefined)
  )
}

function setFormToGregorianDate(
  data: CalendarProps,
  dateConverter: DateConverter
): void {
  dateConverter.setToGregorianDate(
    data.gregorianYear as number,
    data.gregorianMonth as number,
    data.gregorianDay as number
  )
}

function setFormToSeBabylonianDate(
  data: CalendarProps,
  dateConverter: DateConverter
): void {
  dateConverter.setToSeBabylonianDate(
    data.seBabylonianYear as number,
    data.mesopotamianMonth as number,
    data.mesopotamianDay as number
  )
}

function setFormToMesopotamianDate(
  data: CalendarProps,
  dateConverter: DateConverter
): void {
  function getRegnalYear(): number {
    let { regnalYear } = data
    regnalYear = isNaN(regnalYear as number) ? 1 : regnalYear
    const totalOfYears =
      Number(dateConverter.rulerToBrinkmanKings(data.ruler)?.totalOfYears) ?? 1
    return (regnalYear as number) < totalOfYears + 1
      ? (regnalYear as number)
      : totalOfYears
  }

  dateConverter.setToMesopotamianDate(
    data.ruler as string,
    getRegnalYear(),
    data.mesopotamianMonth as number,
    data.mesopotamianDay as number
  )
}

function setFormToJulianDate(
  data: CalendarProps,
  dateConverter: DateConverter
): void {
  dateConverter.setToJulianDate(
    data.julianYear as number,
    data.julianMonth as number,
    data.julianDay as number
  )
}
