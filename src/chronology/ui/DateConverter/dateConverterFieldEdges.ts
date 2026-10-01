import DateConverter from 'chronology/domain/DateConverter'
import { Field } from 'chronology/application/DateConverterFormFieldData'

export type Edges = [number, number]

export const getValuesAtEdges = (
  fieldName: string,
  dateConverter: DateConverter,
): Edges => {
  return [
    dateConverter.earliestDate[fieldName],
    dateConverter.latestDate[fieldName],
  ]
}

export const getAllFieldTypeEdges = (
  field: Field,
  dateConverter: DateConverter,
): { yearEdges: Edges; monthEdges: Edges; dayEdges: Edges } => {
  const prefixes = getDateFieldPrefixes(field)
  const [yearEdges, monthEdges, dayEdges] = [
    `${prefixes.yearPrefix}Year`,
    `${prefixes.monthPrefix}Month`,
    `${prefixes.dayPrefix}Day`,
  ].map((fieldName) => getValuesAtEdges(fieldName, dateConverter))
  return { yearEdges, monthEdges, dayEdges }
}

export const getFieldTypeYearAndMonth = (
  field: Field,
  dateConverter: DateConverter,
): { year: number; month: number } => {
  const prefixes = getDateFieldPrefixes(field)
  const year = dateConverter.calendar[`${prefixes.yearPrefix}Year`]
  const month = dateConverter.calendar[`${prefixes.yearPrefix}Month`]
  return { year, month }
}

const getDateFieldPrefixes = (
  field: Field,
): { yearPrefix: string; monthPrefix: string; dayPrefix: string } => {
  const toPlainPrefix = (prefix: string) => ({
    yearPrefix: prefix,
    monthPrefix: prefix,
    dayPrefix: prefix,
  })
  if (field.name.includes('gregorian')) {
    return toPlainPrefix('gregorian')
  } else if (field.name.includes('julian')) {
    return toPlainPrefix('julian')
  } else {
    return {
      yearPrefix: 'seBabylonian',
      monthPrefix: 'mesopotamian',
      dayPrefix: 'mesopotamian',
    }
  }
}
