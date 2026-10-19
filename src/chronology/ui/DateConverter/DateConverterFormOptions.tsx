import DateConverter from 'chronology/domain/DateConverter'
import { weekDayNames, monthNames } from 'chronology/domain/DateConverterBase'
import { Field } from 'chronology/application/DateConverterFormFieldData'
import data from 'chronology/domain/dateConverterData.json'
import {
  getValuesAtEdges,
  getAllFieldTypeEdges,
  getFieldTypeYearAndMonth,
} from 'chronology/ui/DateConverter/dateConverterFieldEdges'
import {
  getLabelValueOptions,
  getYearOptionLabel,
  getNumberRangeOptions,
  getStringOptions,
} from 'chronology/ui/DateConverter/dateConverterOptionElements'

export default function getOptions({
  field,
  dateConverter,
}: {
  field: Field
  dateConverter: DateConverter
}): JSX.Element[] {
  if (field.name.includes('Year')) {
    return getYearOptions(field, dateConverter)
  } else if (field.name.includes('Month')) {
    return getMonthOptions(field, dateConverter)
  } else if (field.name.includes('Day')) {
    return getDayOptions(field, dateConverter)
  }
  return getRulerOptions(dateConverter)
}

const getYearOptions = (
  field: Field,
  dateConverter: DateConverter,
): JSX.Element[] => {
  const seYearLabelGetter = (number) => getYearOptionLabel(number, 'se')
  const labelGetter =
    field.name === 'seBabylonianYear' ? seYearLabelGetter : getYearOptionLabel
  if (field.name === 'regnalYear') {
    return getRegnalYearOptions(dateConverter)
  }
  return getNumberRangeOptions(
    ...getValuesAtEdges(field.name, dateConverter),
    labelGetter,
  )
}

const getMonthOptions = (
  field: Field,
  dateConverter: DateConverter,
): JSX.Element[] => {
  return field.name === 'mesopotamianMonth'
    ? getMesopotamianMonthOptions(field, dateConverter)
    : getGregorianJulianMonthOptions(field, dateConverter)
}

const getDayOptions = (
  field: Field,
  dateConverter: DateConverter,
): JSX.Element[] => {
  if (field.name.includes('week')) {
    return getStringOptions(weekDayNames)
  }
  const indexOffset = getDayOffset(field, dateConverter)
  return getNumberRangeOptions(
    1 + indexOffset[0],
    indexOffset[1] ?? getMonthLength(field, dateConverter),
  )
}

const getMonthLength = (field: Field, dateConverter: DateConverter): number => {
  if (field.name.includes('mesopotamian')) {
    return dateConverter.calendar.mesopotamianMonthLength
  } else {
    return dateConverter.getMonthLength(field.name.includes('julian'))
  }
}

const getMonthOffset = (
  field: Field,
  dateConverter: DateConverter,
): number[] => {
  let indexOffset = [0]
  const { year } = getFieldTypeYearAndMonth(field, dateConverter)
  const { yearEdges, monthEdges } = getAllFieldTypeEdges(field, dateConverter)
  if (year === yearEdges[0]) {
    indexOffset = [monthEdges[0] - 1]
  } else if (year === yearEdges[1]) {
    indexOffset = [0, monthEdges[1]]
  }
  return indexOffset
}

const getDayOffset = (field: Field, dateConverter: DateConverter): number[] => {
  let indexOffset = [0]
  const { year, month } = getFieldTypeYearAndMonth(field, dateConverter)
  const { yearEdges, monthEdges, dayEdges } = getAllFieldTypeEdges(
    field,
    dateConverter,
  )
  if (year === yearEdges[0] && month === monthEdges[0]) {
    indexOffset = [dayEdges[0] - 1]
  } else if (year === yearEdges[1] && month === monthEdges[1]) {
    indexOffset = [0, dayEdges[1]]
  }
  return indexOffset
}

const getGregorianJulianMonthOptions = (
  field: Field,
  dateConverter: DateConverter,
): JSX.Element[] => {
  const indexOffset = getMonthOffset(field, dateConverter)
  return getLabelValueOptions(
    monthNames
      .slice(...indexOffset)
      .map((label) => ({ value: monthNames.indexOf(label) + 1, label })),
  )
}

const getMesopotamianMonthOptions = (
  field: Field,
  dateConverter: DateConverter,
): JSX.Element[] => {
  const months = dateConverter.getMesopotamianMonthsOfSeYear(
    dateConverter.calendar.seBabylonianYear,
  )
  const indexOffset = getMonthOffset(field, dateConverter)
  return getLabelValueOptions(
    months.slice(...indexOffset).map(({ name, number, value }) => {
      return {
        label: `${number}. ${name}`,
        value,
      }
    }),
  )
}

const getRegnalYearOptions = (dateConverter: DateConverter): JSX.Element[] => {
  const { regnalYears } = dateConverter.calendar
  return regnalYears ? getNumberRangeOptions(1, regnalYears) : []
}

const getRulerOptions = (dateConverter: DateConverter): JSX.Element[] => {
  return getLabelValueOptions([
    ...data.rulerName.map((name) => ({
      value: name,
      label: dateConverter.rulerToBrinkmanKings(name)?.name ?? name,
    })),
    {
      value: '',
      label: '',
    },
  ])
}
