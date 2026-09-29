import DateConverter from 'chronology/domain/DateConverter'
import getOptions from 'chronology/ui/DateConverter/DateConverterFormOptions'

const makeField = (name: string) => ({
  name,
  type: 'number',
  placeholder: name,
  help: '',
})

const optionValues = (name: string, dateConverter: DateConverter): string[] =>
  getOptions({ field: makeField(name), dateConverter }).map((option) =>
    String(option.props.value),
  )

describe('getOptions', () => {
  let dateConverter: DateConverter

  beforeEach(() => {
    dateConverter = new DateConverter()
  })

  it('returns no options for an unsupported field', () => {
    expect(optionValues('cjdn', dateConverter)).toEqual([])
  })

  it('starts months at the earliest month in the earliest year', () => {
    dateConverter.setToEarliestDate()
    const { gregorianMonth } = dateConverter.earliestDate
    expect(optionValues('gregorianMonth', dateConverter)[0]).toEqual(
      String(gregorianMonth),
    )
  })

  it('ends months at the latest month in the latest year', () => {
    dateConverter.setToLatestDate()
    const { gregorianMonth } = dateConverter.latestDate
    expect(optionValues('gregorianMonth', dateConverter).slice(-1)[0]).toEqual(
      String(gregorianMonth),
    )
  })

  it('starts days at the earliest day in the earliest month', () => {
    dateConverter.setToEarliestDate()
    const { gregorianDay } = dateConverter.earliestDate
    expect(optionValues('gregorianDay', dateConverter)[0]).toEqual(
      String(gregorianDay),
    )
  })

  it('ends days at the latest day in the latest month', () => {
    dateConverter.setToLatestDate()
    const { gregorianDay } = dateConverter.latestDate
    expect(optionValues('gregorianDay', dateConverter).slice(-1)[0]).toEqual(
      String(gregorianDay),
    )
  })

  it('lists all days of another month in the earliest year', () => {
    dateConverter.setToEarliestDate()
    dateConverter.calendar = {
      ...dateConverter.calendar,
      gregorianMonth: dateConverter.earliestDate.gregorianMonth + 1,
    }
    expect(optionValues('gregorianDay', dateConverter)[0]).toEqual('1')
  })

  it('lists all days of another month in the latest year', () => {
    dateConverter.setToLatestDate()
    dateConverter.calendar = {
      ...dateConverter.calendar,
      gregorianMonth: dateConverter.latestDate.gregorianMonth - 1,
    }
    expect(optionValues('gregorianDay', dateConverter).slice(-1)[0]).toEqual(
      String(dateConverter.getMonthLength()),
    )
  })
})

describe('getOptions fallbacks', () => {
  let dateConverter: DateConverter

  beforeEach(() => {
    dateConverter = new DateConverter()
  })

  it('returns no options for an unknown month field', () => {
    expect(optionValues('unknownMonth', dateConverter)).toEqual([])
  })

  it('assumes 30 days when the Mesopotamian month length is unknown', () => {
    dateConverter.calendar = {
      ...dateConverter.calendar,
      mesopotamianMonthLength: undefined,
    }
    expect(optionValues('mesopotamianDay', dateConverter).slice(-1)).toEqual([
      '30',
    ])
  })

  it('returns no regnal year options without regnal years', () => {
    dateConverter.calendar = {
      ...dateConverter.calendar,
      regnalYears: undefined,
    }
    expect(optionValues('regnalYear', dateConverter)).toEqual([])
  })

  it('labels rulers without a Brinkman king by their name', () => {
    jest.spyOn(dateConverter, 'rulerToBrinkmanKings').mockReturnValue(null)
    const options = getOptions({ field: makeField('ruler'), dateConverter })
    expect(options[0].props.children).toEqual(options[0].props.value)
  })
})
