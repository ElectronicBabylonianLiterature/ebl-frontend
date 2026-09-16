import { screen, waitFor } from '@testing-library/react'
import Promise from 'bluebird'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'
import { referenceFactory } from 'test-support/bibliography-fixtures'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { folioFactory } from 'test-support/fragment-data-fixtures'
import { Fragment } from 'fragmentarium/domain/fragment'
import {
  createFragmentViewHarness,
  fragmentNumber,
} from './FragmentView.testSupport'

describe('Fragment is loaded', () => {
  let fragment: Fragment
  let selectedFolio: Fragment['folios'][number]
  let harness: ReturnType<typeof createFragmentViewHarness>

  async function renderAndWaitForLoadedFragment(): Promise<void> {
    harness.renderFragmentView(
      fragmentNumber,
      selectedFolio.name,
      selectedFolio.number,
      'folio',
    )
    await waitForSpinnerToBeRemoved(screen)
  }

  beforeEach(() => {
    harness = createFragmentViewHarness()
    const folios = [
      folioFactory.build({ name: 'WGL' }),
      folioFactory.build({ name: 'AKG' }),
    ]
    fragment = fragmentFactory
      .build(
        {
          number: fragmentNumber,
          atf: '1. ku',
          hasPhoto: true,
        },
        { associations: { folios } },
      )
      .setReferences(referenceFactory.buildList(2))
    selectedFolio = fragment.folios[0]
    harness.fragmentService.find.mockReturnValue(Promise.resolve(fragment))
    harness.fragmentService.updateGenres.mockReturnValue(
      Promise.resolve(fragment),
    )
  })

  it('Queries the Fragmentarium API with given parameters', async () => {
    await renderAndWaitForLoadedFragment()
    expect(harness.fragmentService.find).toBeCalledWith(fragmentNumber)
  })

  it('Shows the fragment number', async () => {
    await renderAndWaitForLoadedFragment()
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      fragmentNumber,
    )
  })

  it('Shows pager', async () => {
    await renderAndWaitForLoadedFragment()
    expect(screen.getByLabelText('Next')).toBeVisible()
  })

  it('Shows annotate button', async () => {
    await renderAndWaitForLoadedFragment()
    expect(screen.getByText('Tag signs')).not.toHaveAttribute('aria-disabled')
  })

  it('Selects active folio', async () => {
    await renderAndWaitForLoadedFragment()
    await waitFor(() =>
      expect(
        screen.getByRole('tab', {
          name: `${selectedFolio.humanizedName} Folio ${selectedFolio.number}`,
        }),
      ).toHaveAttribute('aria-selected', 'true'),
    )
  })
})

describe('Fragment without an image is loaded', () => {
  let fragment: Fragment
  let harness: ReturnType<typeof createFragmentViewHarness>

  async function renderAndWaitForFragment(): Promise<void> {
    harness.renderFragmentView(fragment.number, null, null, null)
    await waitForSpinnerToBeRemoved(screen)
  }

  beforeEach(() => {
    harness = createFragmentViewHarness()
    fragment = fragmentFactory.build(
      {
        number: fragmentNumber,
        atf: '1. ku',
        hasPhoto: false,
      },
      { associations: { folios: [], references: [] } },
    )
    harness.fragmentService.find.mockReturnValue(Promise.resolve(fragment))
  })

  it('Tag signs button is disabled', async () => {
    await renderAndWaitForFragment()
    expect(screen.getByText('Tag signs')).toBeDisabled()
  })
})
