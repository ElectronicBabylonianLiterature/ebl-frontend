import React from 'react'
import ResizeObserver from 'resize-observer-polyfill'
import { MemoryRouter } from 'react-router-dom'
import { render, screen, waitFor } from '@testing-library/react'
import Promise from 'bluebird'
import Images, {
  hasUsableCdliTab,
  TabController,
} from 'fragmentarium/ui/images/Images'
import FragmentService from 'fragmentarium/application/FragmentService'
import { Fragment } from 'fragmentarium/domain/fragment'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { folioFactory } from 'test-support/fragment-data-fixtures'

global.ResizeObserver = ResizeObserver

const folios = [folioFactory.build({ name: 'WGL' })]
const pending = (): Promise<never> => new Promise(() => undefined)

function fragmentService(): jest.Mocked<FragmentService> {
  return {
    findFolio: jest.fn(pending),
    findPhoto: jest.fn(pending),
    folioPager: jest.fn(pending),
  } as unknown as jest.Mocked<FragmentService>
}

function buildFragment({
  hasPhoto = false,
  cdliImages = [] as readonly string[],
  withFolios = false,
}): Fragment {
  return fragmentFactory.build(
    { hasPhoto, cdliImages },
    { associations: { folios: withFolios ? folios : [] } },
  )
}

function renderImages(fragment: Fragment, tab: string | null = null): void {
  render(
    <MemoryRouter>
      <Images
        fragment={fragment}
        fragmentService={fragmentService()}
        activeFolio={null}
        tab={tab}
      />
    </MemoryRouter>,
  )
}

function selectedTabNames(): string[] {
  return screen
    .queryAllByRole('tab')
    .filter((tab) => tab.getAttribute('aria-selected') === 'true')
    .map((tab) => tab.textContent ?? '')
}

const folioLabel = `${folios[0].humanizedName} Folio ${folios[0].number}`

describe('the selected tab always exists', () => {
  it.each([
    ['photo only', { hasPhoto: true }, 'Photo'],
    ['folio only', { withFolios: true }, folioLabel],
    ['CDLI only', { cdliImages: ['dl/lineart/P550449_l.jpg'] }, 'CDLI'],
    ['photo and folio', { hasPhoto: true, withFolios: true }, 'Photo'],
  ])('selects the %s tab', async (unusedName, options, expected) => {
    renderImages(buildFragment(options))

    await waitFor(() => expect(selectedTabNames()).toEqual([expected]))
  })

  it('selects no tab when the fragment has no photo, folio or CDLI image', async () => {
    renderImages(buildFragment({}))

    await waitFor(() => expect(screen.queryAllByRole('tab')).toHaveLength(0))
    expect(selectedTabNames()).toEqual([])
  })

  it.each(['cdli', 'photo', '0', 'nonsense'])(
    'ignores the unavailable requested tab %s',
    async (tab) => {
      renderImages(buildFragment({}), tab)

      await waitFor(() => expect(selectedTabNames()).toEqual([]))
    },
  )

  it('falls back to an available tab when the requested one is missing', async () => {
    renderImages(buildFragment({ hasPhoto: true }), 'cdli')

    await waitFor(() => expect(selectedTabNames()).toEqual(['Photo']))
  })

  it('keeps a requested tab that is available', async () => {
    renderImages(
      buildFragment({ hasPhoto: true, cdliImages: ['P550449_l.jpg'] }),
      'cdli',
    )

    await waitFor(() => expect(selectedTabNames()).toEqual(['CDLI']))
    expect(await screen.findByAltText('CDLI Line Art')).toBeInTheDocument()
  })
})

describe('TabController keys', () => {
  const navigate = jest.fn()

  it.each([
    ['no available tab', {}, undefined],
    ['a photo', { hasPhoto: true }, 'photo'],
    ['a folio', { withFolios: true }, '0'],
    ['CDLI images', { cdliImages: ['P550449_l.jpg'] }, 'cdli'],
  ])('reports the default key for %s', (unusedName, options, expected) => {
    const controller = new TabController(
      buildFragment(options),
      null,
      null,
      navigate,
    )

    expect(controller.defaultKey).toEqual(expected)
    expect(controller.activeKey).toEqual(expected)
  })

  it('falls back to the default key for an unmatched folio request', () => {
    const controller = new TabController(
      buildFragment({ hasPhoto: true, withFolios: true }),
      'folio',
      folioFactory.build({ name: 'AHA' }),
      navigate,
    )

    expect(controller.activeKey).toEqual('photo')
  })

  it('selects the matching folio index', () => {
    const controller = new TabController(
      buildFragment({ withFolios: true }),
      'folio',
      folios[0],
      navigate,
    )

    expect(controller.activeKey).toEqual('0')
  })
})

describe('hasUsableCdliTab', () => {
  it.each([
    ['a CDLI image', ['P550449_l.jpg'], true],
    ['an empty image list', [], false],
  ])('reports %s as %s', (unusedName, cdliImages, expected) => {
    expect(hasUsableCdliTab(buildFragment({ cdliImages }))).toBe(expected)
  })

  it('tolerates a payload without the cdliImages field', () => {
    const withoutCdliImages = {
      ...buildFragment({}),
      cdliImages: undefined,
    } as unknown as Fragment

    expect(hasUsableCdliTab(withoutCdliImages)).toBe(false)
  })
})

describe('TabController.openTab', () => {
  it('navigates to the folio URL for a folio key', () => {
    const navigate = jest.fn()
    const fragment = buildFragment({ withFolios: true })
    new TabController(fragment, null, null, navigate).openTab('0')

    expect(navigate).toHaveBeenCalledWith(expect.stringContaining('tab=folio'))
  })

  it.each(['photo', 'cdli', '9'])(
    'navigates to the tab URL for the non-folio key %s',
    (eventKey) => {
      const navigate = jest.fn()
      const fragment = buildFragment({ hasPhoto: true, withFolios: true })
      new TabController(fragment, null, null, navigate).openTab(eventKey)

      expect(navigate).toHaveBeenCalledWith(
        expect.stringContaining(`tab=${eventKey}`),
      )
    },
  )

  it('ignores a null event key', () => {
    const navigate = jest.fn()
    new TabController(buildFragment({}), null, null, navigate).openTab(null)

    expect(navigate).not.toHaveBeenCalled()
  })
})

describe('folio dropdown threshold', () => {
  it('collapses more than three folios into a dropdown', async () => {
    const manyFolios = ['WGL', 'AKG', 'AHA', 'MJG'].map((name) =>
      folioFactory.build({ name }),
    )

    render(
      <MemoryRouter>
        <Images
          fragment={fragmentFactory.build(
            { hasPhoto: false, cdliImages: [] },
            { associations: { folios: manyFolios } },
          )}
          fragmentService={fragmentService()}
          activeFolio={null}
          tab={null}
        />
      </MemoryRouter>,
    )

    expect(await screen.findByText(/Folios/)).toBeVisible()
  })
})
