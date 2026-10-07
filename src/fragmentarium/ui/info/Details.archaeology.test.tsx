import { screen } from '@testing-library/react'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import {
  archaeologyFactory,
  findspotFactory,
} from 'test-support/fragment-data-fixtures'
import { PartialDate } from 'fragmentarium/domain/archaeology'
import {
  createDetailsTestContext,
  DetailsTestContext,
} from 'fragmentarium/ui/info/Details.testSupport'

jest.mock('fragmentarium/application/FragmentService')

let context: DetailsTestContext

beforeEach(() => {
  context = createDetailsTestContext()
  context.fragmentService.fetchGenres.mockResolvedValue([])
  context.fragmentService.fetchPeriods.mockResolvedValue([])
})

describe('ExcavationDate', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'language', {
      value: 'en-US',
      writable: true,
    })
  })

  it('renders excavation date when isRegularExcavation is true', async () => {
    const excavationDate = {
      start: new PartialDate(2024, 5, 10),
      end: new PartialDate(2024, 10, 10),
    }
    await context.renderDetails(
      fragmentFactory.build({
        archaeology: {
          isRegularExcavation: true,
          date: excavationDate,
        },
      }),
    )

    expect(screen.getByText(/Regular Excavation/)).toBeInTheDocument()
    expect(screen.getByText(/05\/10\/2024 – 10\/10\/2024/)).toBeInTheDocument()
  })

  it('renders only start date when end date is missing', async () => {
    const excavationDate = {
      start: new PartialDate(2024, 5, 10),
      end: null,
    }
    await context.renderDetails(
      fragmentFactory.build({
        archaeology: {
          isRegularExcavation: true,
          date: excavationDate,
        },
      }),
    )

    expect(screen.getByText(/Regular Excavation/)).toBeInTheDocument()
    expect(screen.getByText(/05\/10\/2024/)).toBeInTheDocument()
  })

  it('does not render excavation date when isRegularExcavation is false', async () => {
    await context.renderDetails(
      fragmentFactory.build({
        archaeology: {
          isRegularExcavation: false,
          date: undefined,
        },
      }),
    )

    expect(screen.queryByText(/Regular Excavation/)).not.toBeInTheDocument()
    expect(screen.queryByText(/10\/05\/2024/)).not.toBeInTheDocument()
  })
})

describe('Findspot uncertain display', () => {
  it('appends (?) to findspot string when isFindspotUncertain is true', async () => {
    const findspot = findspotFactory.build()
    const fragment = fragmentFactory.build({
      archaeology: archaeologyFactory.build(
        { isFindspotUncertain: true },
        { associations: { findspot } },
      ),
    })
    const findspotString = fragment.archaeology?.findspot?.toString()
    await context.renderDetails(fragment)

    expect(findspotString).toBeTruthy()
    expect(
      screen.getByText(`Findspot: ${findspotString} (?)`),
    ).toBeInTheDocument()
  })

  it('does not append (?) when isFindspotUncertain is false', async () => {
    const findspot = findspotFactory.build()
    const fragment = fragmentFactory.build({
      archaeology: archaeologyFactory.build(
        { isFindspotUncertain: false },
        { associations: { findspot } },
      ),
    })
    const findspotString = fragment.archaeology?.findspot?.toString()
    await context.renderDetails(fragment)

    expect(findspotString).toBeTruthy()
    expect(screen.getByText(`Findspot: ${findspotString}`)).toBeInTheDocument()
    expect(
      screen.queryByText(`Findspot: ${findspotString} (?)`),
    ).not.toBeInTheDocument()
  })
})
