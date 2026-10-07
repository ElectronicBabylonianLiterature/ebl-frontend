import { excavationSites, PartialDate } from 'fragmentarium/domain/archaeology'
import {
  createArchaeology,
  fromFindspotDto,
  toFindspotDto,
} from 'fragmentarium/domain/archaeologyDtos'
import { findspotFactory } from 'test-support/archaeology-fixtures'

describe('createArchaeology', () => {
  it('leaves a missing excavation number and findspot empty', () => {
    const archaeology = createArchaeology({
      site: 'Assyria',
      isRegularExcavation: true,
    })

    expect(archaeology.excavationNumber).toBeUndefined()
    expect(archaeology.findspot).toBeNull()
    expect(archaeology.site?.name).toEqual('Assyria')
  })

  it('uses the empty excavation site when none is given', () => {
    expect(createArchaeology({}).site).toEqual(excavationSites[''])
  })
})

describe('fromFindspotDto', () => {
  it('keeps an open-ended date range without an end', () => {
    const findspotDto = toFindspotDto(
      findspotFactory.build({
        date: { start: new PartialDate(-1200), end: null, notes: '' },
        plans: [],
      }),
    )

    expect(fromFindspotDto(findspotDto).date).toEqual({
      start: new PartialDate(-1200),
      end: null,
      notes: '',
    })
  })
})
