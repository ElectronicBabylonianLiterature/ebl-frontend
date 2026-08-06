import { screen } from '@testing-library/react'
import { Fragment } from 'fragmentarium/domain/fragment'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import {
  archaeologyFactory,
  externalNumbersFactory,
  measuresFactory,
} from 'test-support/fragment-data-fixtures'
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

describe('Missing details', () => {
  async function setupMissingDetails(): Promise<void> {
    const { fragmentService, renderDetails } = context
    const archaeology = archaeologyFactory.build({
      excavationNumber: undefined,
      site: undefined,
    })
    fragment = fragmentFactory.build(
      {
        collection: '',
        accession: '',
        archaeology,
      },
      {
        associations: {
          joins: [],
          measures: measuresFactory.build({
            width: null,
          }),
          externalNumbers: externalNumbersFactory.build({
            cdliNumber: '',
            bmIdNumber: '',
          }),
        },
      },
    )
    fragmentService.fetchGenres.mockReturnValue(Promise.resolve([]))
    fragmentService.fetchPeriods.mockReturnValue(Promise.resolve([]))
    await renderDetails(fragment)
  }

  it('Does not render undefined', async () => {
    await setupMissingDetails()
    expect(screen.queryByText('undefined')).not.toBeInTheDocument()
  })

  it('Does not render collection', async () => {
    await setupMissingDetails()
    expect(screen.queryByText('Collection')).not.toBeInTheDocument()
  })

  it(`Renders dash for joins`, async () => {
    await setupMissingDetails()
    expect(screen.getByText(/Joins:/)).toHaveTextContent('-')
  })

  it('Does not render missing measures', async () => {
    await setupMissingDetails()
    expectMeasurementsToBeRendered(fragment)
  })

  it('Renders dash for accession', async () => {
    await setupMissingDetails()
    expect(screen.getByText('Accession no.: -')).toBeInTheDocument()
  })

  it('Renders dash for excavation', async () => {
    await setupMissingDetails()
    expect(screen.getByText('Excavation no.: -')).toBeInTheDocument()
  })

  it('Renders dash for provenance', async () => {
    await setupMissingDetails()
    expect(screen.getByText('Provenance: -')).toBeInTheDocument()
  })
})
