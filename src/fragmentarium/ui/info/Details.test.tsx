import _ from 'lodash'
import { screen } from '@testing-library/react'
import { Museums } from 'fragmentarium/domain/museum'
import { Fragment } from 'fragmentarium/domain/fragment'
import { Genres } from 'fragmentarium/domain/Genres'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { archaeologyFactory } from 'test-support/fragment-data-fixtures'
import { joinFactory } from 'test-support/join-fixtures'
import { Periods } from 'common/utils/period'
import { excavationSites } from 'fragmentarium/domain/archaeology'
import {
  createDetailsTestContext,
  DetailsTestContext,
  expectMeasurementsToBeRendered,
} from 'fragmentarium/ui/info/Details.testSupport'

jest.mock('fragmentarium/application/FragmentService')

let context: DetailsTestContext
let fragment: Fragment

beforeEach(() => {
  context = createDetailsTestContext()
})

describe('All details', () => {
  async function setupAllDetails(): Promise<void> {
    const { fragmentService, renderDetails } = context
    fragmentService.fetchGenres.mockReturnValue(
      Promise.resolve([['ARCHIVAL'], ['ARCHIVAL', 'Administrative']]),
    )
    fragmentService.fetchPeriods.mockReturnValue(
      Promise.resolve([...Object.keys(Periods)]),
    )
    const number = 'X.1'
    const museum = Museums['THE_BRITISH_MUSEUM']
    const provenanceSite =
      excavationSites['Ur'] ??
      Object.values(excavationSites).find((site) => site.name) ??
      excavationSites['']
    fragment = fragmentFactory.build(
      {
        number,
        collection: 'The Collection',
        museum,
        archaeology: archaeologyFactory.build({ site: provenanceSite }),
      },
      {
        associations: {
          genres: new Genres([]),
          joins: [
            [
              joinFactory.build({
                museumNumber: number,
                isInFragmentarium: true,
              }),
              joinFactory.build({ isInFragmentarium: true }),
            ],
            [
              joinFactory.build({ isInFragmentarium: false }),
              joinFactory.build({ isInFragmentarium: true }),
              joinFactory.build({ isEnvelope: true }),
            ],
          ],
        },
      },
    )
    await renderDetails(fragment)
  }

  it('Renders museum', async () => {
    await setupAllDetails()
    expect(screen.getByText(fragment.museum.name)).toBeInTheDocument()
  })

  it('Links to museum home', async () => {
    await setupAllDetails()
    expect(screen.getByText(fragment.museum.name)).toHaveAttribute(
      'href',
      `/library/search/?museum=${fragment.museum.key}`,
    )
  })

  it('Renders collection', async () => {
    await setupAllDetails()
    expect(
      screen.getByText(`(${fragment.collection} Collection)`),
    ).toBeInTheDocument()
  })

  it(`Renders envelope icon for joins`, async () => {
    await setupAllDetails()
    expect(screen.queryAllByLabelText('envelope icon').length).toBeGreaterThan(
      0,
    )
  })

  it('Does not link to self', async () => {
    await setupAllDetails()
    fragment.joins
      .flat()
      .filter((join) => join.museumNumber === fragment.number)
      .forEach((join) => {
        expect(screen.getByText(join.museumNumber)).not.toHaveAttribute('href')
      })
  })

  it('Does not link to missing joins', async () => {
    await setupAllDetails()
    fragment.joins
      .flat()
      .filter((join) => !join.isInFragmentarium)
      .forEach((join) => {
        expect(
          screen.getByText(new RegExp(_.escapeRegExp(join.museumNumber))),
        ).not.toHaveAttribute('href')
      })
  })

  it('Links to other joins', async () => {
    await setupAllDetails()
    fragment.joins
      .flat()
      .filter((join) => join.museumNumber !== fragment.number)
      .filter((join) => join.isInFragmentarium)
      .forEach((join) => {
        expect(
          screen.getByRole('link', { name: join.museumNumber }),
        ).toHaveAttribute('href', `/library/${join.museumNumber}`)
      })
  })

  it('Renders measures', async () => {
    await setupAllDetails()
    expectMeasurementsToBeRendered(fragment)
  })

  it('Renders accession', async () => {
    await setupAllDetails()
    expect(
      screen.getByText(`Accession no.: ${fragment.accession}`),
    ).toBeInTheDocument()
  })

  it('Renders excavation', async () => {
    await setupAllDetails()
    expect(
      screen.getByText(
        `Excavation no.: ${fragment.archaeology?.excavationNumber}`,
      ),
    ).toBeInTheDocument()
  })

  it('Renders provenance', async () => {
    await setupAllDetails()
    expect(screen.getByText(/Provenance:/)).toBeInTheDocument()
    const site = fragment.archaeology?.site?.name
    if (site) {
      expect(screen.getByRole('link', { name: site })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: site })).toHaveAttribute(
        'href',
        `/library/search/?site=${encodeURIComponent(site)}`,
      )
    }
  })
})
