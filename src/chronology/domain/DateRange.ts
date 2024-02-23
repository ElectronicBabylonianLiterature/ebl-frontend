import { MesopotamianDate } from 'chronology/domain/Date'

export function getDateRangeFromPartialDate(date: MesopotamianDate): DateRange {
  // ToDo:
  // Use ranges when calculating approximation.
  const startDate = new MesopotamianDate({ ...date })
  const endDate = new MesopotamianDate({ ...date })
  return new DateRange({ start: startDate, end: endDate })
}

export default class DateRange {
  start: MesopotamianDate
  end: MesopotamianDate
  constructor({
    start,
    end,
  }: {
    start: MesopotamianDate
    end: MesopotamianDate
  }) {
    this.start = start
    this.end = end
  }

  toString(): string {
    return `${this.start.toString()} - ${this.start.toString()}`
  }
}
