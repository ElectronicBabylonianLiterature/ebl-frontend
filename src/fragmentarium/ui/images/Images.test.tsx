import React from 'react'
import ResizeObserver from 'resize-observer-polyfill'
import { MemoryRouter } from 'react-router'
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import Promise from 'bluebird'
import Images, { FragmentPhoto, TabController } from './Images'
import Folio from 'fragmentarium/domain/Folio'
import { Fragment } from 'fragmentarium/domain/fragment'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import {
  folioFactory,
  folioPagerFactory,
} from 'test-support/fragment-data-fixtures'
import { FolioPagerData } from 'fragmentarium/domain/pager'

global.ResizeObserver = ResizeObserver

let fragment: Fragment
let fragmentService
let folios: Folio[]
let folioPager: FolioPagerData

beforeEach(() => {
  fragmentService = {
    findFolio: jest.fn(),
    findPhoto: jest.fn(),
    folioPager: jest.fn(),
  }
  folioPager = folioPagerFactory.build()
  ;(URL.createObjectURL as jest.Mock).mockReturnValue('url')
  fragmentService.findFolio.mockReturnValue(
    Promise.resolve(new Blob([''], { type: 'image/jpeg' })),
  )
  fragmentService.findPhoto.mockReturnValue(
    Promise.resolve(new Blob([''], { type: 'image/jpeg' })),
  )
  fragmentService.folioPager.mockReturnValue(Promise.resolve(folioPager))
})

describe('Images', () => {
  beforeEach(() => {
    folios = folioFactory.buildList(3)
    fragment = fragmentFactory.build(
      { hasPhoto: true, cdliImages: ['dl/photo/P550449.jpg'] },
      { associations: { folios: folios } },
    )
  })

  it('Renders folio tabs', async () => {
    renderImages()
    await waitForElementToBeRemoved(() => screen.queryAllByLabelText('Spinner'))
    for (const folio of folios) {
      expect(
        await screen.findByText(`${folio.humanizedName} Folio ${folio.number}`),
      ).toBeVisible()
    }
  })

  it('Renders CDLI tab', async () => {
    renderImages()
    await waitForElementToBeRemoved(() => screen.queryAllByLabelText('Spinner'))
    expect(await screen.findByText('CDLI')).toBeVisible()
  })

  it('Renders photo tab', async () => {
    renderImages()
    await waitForElementToBeRemoved(() => screen.queryAllByLabelText('Spinner'))
    expect((await screen.findAllByText('Photo'))[0]).toBeVisible()
  })
})

it('Displays selected folio', async () => {
  folios = [
    folioFactory.build({ name: 'WGL' }),
    folioFactory.build({ name: 'AKG' }),
  ]
  fragment = fragmentFactory.build({}, { associations: { folios: folios } })
  const selected = folios[0]
  const selectedTitle = `${selected.humanizedName} Folio ${selected.number}`
  renderImages(selected)
  expect(await screen.findByText(selectedTitle)).toHaveAttribute(
    'aria-selected',
    'true',
  )
})

it('Displays photo if no folio specified', async () => {
  folios = [
    folioFactory.build({ name: 'WGL' }),
    folioFactory.build({ name: 'AKG' }),
  ]
  fragment = fragmentFactory.build(
    { hasPhoto: true },
    { associations: { folios: folios } },
  )
  renderImages()
  expect(
    await screen.findByAltText(`Fragment ${fragment.number}`),
  ).toBeVisible()
})

it('Displays CDLI photo if no photo and no folio specified', async () => {
  folios = [
    folioFactory.build({ name: 'WGL' }),
    folioFactory.build({ name: 'AKG' }),
  ]
  fragment = fragmentFactory.build(
    { hasPhoto: false, cdliImages: ['dl/photo/P550449.jpg'] },
    { associations: { folios: folios } },
  )
  renderImages()
  expect(await screen.findByAltText('CDLI Photo')).toBeVisible()
})

test('No photo, folios, CDLI photo', async () => {
  fragment = fragmentFactory.build(
    { hasPhoto: false, cdliImages: [] },
    { associations: { folios: [] } },
  )
  renderImages()
  expect(screen.queryByText('CDLI')).not.toBeInTheDocument()
})

function renderImages(activeFolio: Folio | null = null) {
  render(
    <MemoryRouter>
      <Images
        fragment={fragment}
        fragmentService={fragmentService}
        activeFolio={activeFolio}
        tab={activeFolio && 'folio'}
      />
    </MemoryRouter>,
  )
}

describe('TabController', () => {
  let fragment, navigate, activeFolio

  beforeEach(() => {
    fragment = fragmentFactory.build(
      { hasPhoto: true },
      { associations: { folios: folioFactory.buildList(3) } },
    )
    navigate = jest.fn()
    activeFolio = fragment.folios[1]
  })

  it('Returns correct defaultKey', () => {
    const controller = new TabController(fragment, null, null, navigate)
    expect(controller.defaultKey).toBe('photo')
  })

  it('Returns correct activeKey when tab is folio', () => {
    const controller = new TabController(
      fragment,
      'folio',
      activeFolio,
      navigate,
    )
    expect(controller.activeKey).toBe('1')
  })

  it('Returns correct activeKey when tab is null', () => {
    const controller = new TabController(fragment, null, null, navigate)
    expect(controller.activeKey).toBe('photo')
  })

  it('Opens the correct tab for a folio', () => {
    const controller = new TabController(fragment, null, activeFolio, navigate)
    controller.openTab('1')
    // expect(history.push).toHaveBeenCalledWith(
    //   createFragmentUrlWithFolio(fragment.number, activeFolio)
    // )
  })

  it('Opens the correct tab for a photo', () => {
    const controller = new TabController(fragment, null, null, navigate)
    controller.openTab('photo')
    // expect(history.push).toHaveBeenCalledWith(
    //   createFragmentUrlWithTab(fragment.number, 'photo')
    // )
  })
})

describe('FragmentPhoto', () => {
  let fragment

  beforeEach(() => {
    fragment = fragmentFactory.build(
      { hasPhoto: true },
      { associations: { folios: folioFactory.buildList(3) } },
    )
  })

  it('renders photo correctly', async () => {
    render(
      <MemoryRouter>
        <FragmentPhoto fragment={fragment} fragmentService={fragmentService} />
      </MemoryRouter>,
    )
    await waitForElementToBeRemoved(() => screen.queryByLabelText('Spinner'))
    expect(screen.getByAltText(`Fragment ${fragment.number}`)).toBeVisible()
  })
})
