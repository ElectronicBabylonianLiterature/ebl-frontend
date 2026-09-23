import { Findspot, PartialDate } from 'fragmentarium/domain/archaeology'

describe('PartialDate', () => {
  it.each([
    [new PartialDate(1920), '1920'],
    [new PartialDate(1920, 6), '06/1920'],
    [new PartialDate(1920, 6, 5), '06/05/1920'],
    [new PartialDate(-1200), '1200 BCE'],
    [new PartialDate(-1200, 6, 5), '1200 BCE'],
  ])('formats %p as %s', (partialDate: PartialDate, expected: string) => {
    expect(partialDate.toLocaleString('en-US')).toEqual(expected)
  })

  it('uses the default locale for its string form', () => {
    const partialDate = new PartialDate(1920, 6)

    expect(partialDate.toString()).toEqual(
      partialDate.toLocaleString('default'),
    )
  })
})

describe('Findspot', () => {
  it('describes a findspot with only an id as empty', () => {
    const findspot = new Findspot(1)

    expect(findspot.toString()).toEqual('')
  })

  it.each([
    [true, 'Room 3, pit (primary context).'],
    [false, 'Room 3, pit (secondary context).'],
    [null, 'Room 3, pit.'],
  ])(
    'describes the context when primaryContext is %p',
    (primaryContext: boolean | null, expected: string) => {
      const findspot = new Findspot(
        1,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        'Room 3',
        'pit',
        primaryContext,
      )

      expect(findspot.toString()).toEqual(expected)
    },
  )
})
