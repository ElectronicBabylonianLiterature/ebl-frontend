import { screen } from '@testing-library/react'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { folioFactory } from 'test-support/fragment-data-fixtures'
import { Fragment } from 'fragmentarium/domain/fragment'
import {
  createFragmentViewHarness,
  fragmentNumber,
} from './FragmentView.test-support'

describe('On error', () => {
  let harness: ReturnType<typeof createFragmentViewHarness>
  const message = 'message'

  beforeEach(() => {
    harness = createFragmentViewHarness()
  })

  it('Shows the error message', async () => {
    harness.fragmentService.find.mockReturnValue(
      Promise.reject(new Error(message)),
    )
    harness.renderFragmentView(fragmentNumber, null, null, null)
    await waitForSpinnerToBeRemoved(screen)
    await screen.findByText(message)
  })
})

describe('Filter folios', () => {
  let fragment: Fragment
  const openFolios = [
    folioFactory.build({ name: 'WGL' }),
    folioFactory.build({ name: 'AKG' }),
  ]
  let harness: ReturnType<typeof createFragmentViewHarness>

  async function renderAndWaitForFragment(): Promise<void> {
    harness.renderFragmentView(fragment.number, null, null, null)
    await waitForSpinnerToBeRemoved(screen)
  }

  beforeEach(() => {
    harness = createFragmentViewHarness(['read:WGL-folios', 'read:AKG-folios'])
    const folios = [
      ...openFolios,
      folioFactory.build({}, { associations: { name: 'WRM' } }),
    ]
    fragment = fragmentFactory.build(
      {
        number: fragmentNumber,
        atf: '1. ku',
        hasPhoto: true,
      },
      { associations: { folios } },
    )
    harness.fragmentService.find.mockReturnValue(Promise.resolve(fragment))
  })

  it("excludes folios the user doesn't have access to", async () => {
    expect(fragment.filterFolios(harness.session).folios).toEqual(openFolios)
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
        `${fragment.folios[2].humanizedName} Folio ${fragment.folios[2].number}`,
      ),
    ).not.toBeInTheDocument()
  })
})
