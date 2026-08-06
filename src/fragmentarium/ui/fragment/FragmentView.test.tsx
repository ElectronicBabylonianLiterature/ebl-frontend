import { screen } from '@testing-library/react'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'
import { referenceFactory } from 'test-support/bibliography-fixtures'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { folioFactory } from 'test-support/fragment-data-fixtures'
import { Fragment } from 'fragmentarium/domain/fragment'
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

const message = 'message'

let context: FragmentViewTestContext

beforeEach(() => {
  context = createFragmentViewTestContext()
})

describe('Fragment is loaded', () => {
  let fragment
  let selectedFolio

  async function renderAndWaitForLoadedFragment(): Promise<void> {
    context.renderFragmentView(
      fragmentNumber,
      selectedFolio.name,
      selectedFolio.number,
      'folio',
    )
    await waitForSpinnerToBeRemoved(screen)
  }

  beforeEach(async () => {
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
        { associations: { folios: folios } },
      )
      .setReferences(referenceFactory.buildList(2))
    selectedFolio = fragment.folios[0]
    context.fragmentService.find.mockReturnValue(Promise.resolve(fragment))
    context.fragmentService.updateGenres.mockReturnValue(
      Promise.resolve(fragment),
    )
  })

  it('Queries the Fragmentarium API with given parameters', async () => {
    await renderAndWaitForLoadedFragment()
    expect(context.fragmentService.find).toBeCalledWith(fragmentNumber)
  })

  it('Shows the fragment number', async () => {
    await renderAndWaitForLoadedFragment()
    expect(context.container).toHaveTextContent(fragmentNumber)
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
    expect(
      screen.getByText(
        `${selectedFolio.humanizedName} Folio ${selectedFolio.number}`,
      ),
    ).toHaveAttribute('aria-selected', 'true')
  })
})

describe('Fragment without an image is loaded', () => {
  let fragment: Fragment

  async function renderAndWaitForFragment(): Promise<void> {
    context.renderFragmentView(fragment.number, null, null, null)
    await waitForSpinnerToBeRemoved(screen)
  }

  beforeEach(async () => {
    fragment = fragmentFactory.build(
      {
        number: fragmentNumber,
        atf: '1. ku',
        hasPhoto: false,
      },
      { associations: { folios: [], references: [] } },
    )
    context.fragmentService.find.mockReturnValue(Promise.resolve(fragment))
  })

  it('Tag signs button is disabled', async () => {
    await renderAndWaitForFragment()
    expect(screen.getByText('Tag signs')).toBeDisabled()
  })
})

describe('On error', () => {
  it('Shows the error message', async () => {
    context.fragmentService.find.mockReturnValue(
      Promise.reject(new Error(message)),
    )
    context.renderFragmentView(fragmentNumber, null, null, null)
    await waitForSpinnerToBeRemoved(screen)
    await screen.findByText(message)
  })
})
