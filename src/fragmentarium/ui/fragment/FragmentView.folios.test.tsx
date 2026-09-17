import { screen } from '@testing-library/react'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { folioFactory } from 'test-support/fragment-data-fixtures'
import { Fragment } from 'fragmentarium/domain/fragment'
import Folio from 'fragmentarium/domain/Folio'
import MemorySession from 'auth/Session'
import ResizeObserver from 'resize-observer-polyfill'
import {
  createFragmentViewTestContext,
  FragmentViewTestContext,
  fragmentNumber,
} from 'fragmentarium/ui/fragment/FragmentView.testSupport'

jest.mock('dictionary/application/WordService')
jest.mock('fragmentarium/application/FindspotService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('fragmentarium/application/FragmentSearchService')
jest.mock('afo-register/application/AfoRegisterService')
jest.mock('dossiers/application/DossiersService')

global.ResizeObserver = ResizeObserver

let context: FragmentViewTestContext

beforeEach(() => {
  context = createFragmentViewTestContext()
})

describe('Filter folios', () => {
  let fragment: Fragment
  let folios: readonly Folio[]
  const openFolios: readonly Folio[] = [
    folioFactory.build({ name: 'WGL' }),
    folioFactory.build({ name: 'AKG' }),
  ]

  async function renderAndWaitForFragment(): Promise<void> {
    context.renderFragmentView(fragment.number, null, null, null)
    await waitForSpinnerToBeRemoved(screen)
  }

  beforeEach(async () => {
    context.session = new MemorySession(['read:WGL-folios', 'read:AKG-folios'])
    folios = [
      ...openFolios,
      folioFactory.build({}, { associations: { name: 'WRM' } }),
    ]
    fragment = fragmentFactory.build(
      {
        number: fragmentNumber,
        atf: '1. ku',
        hasPhoto: true,
      },
      { associations: { folios: folios } },
    )
    context.fragmentService.find.mockReturnValue(Promise.resolve(fragment))
  })

  it("excludes folios the user doesn't have access to", async () => {
    expect(fragment.filterFolios(context.session).folios).toEqual(openFolios)
  })

  it.each(openFolios)('shows the included folio %#', async (folio) => {
    await renderAndWaitForFragment()
    expect(
      screen.getByText(`${folio.humanizedName} Folio ${folio.number}`),
    ).toBeVisible()
  })

  it('Does not show the excluded folios', async () => {
    await renderAndWaitForFragment()
    expect(
      screen.queryByText(
        `${folios[2].humanizedName} Folio ${folios[2].number}`,
      ),
    ).not.toBeInTheDocument()
  })
})
