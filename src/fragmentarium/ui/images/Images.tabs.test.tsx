import React from 'react'
import ResizeObserver from 'resize-observer-polyfill'
import { MemoryRouter } from 'react-router-dom'
import { render, screen, waitFor } from '@testing-library/react'
import Promise from 'bluebird'
import Images from 'fragmentarium/ui/images/Images'
import FragmentService from 'fragmentarium/application/FragmentService'
import Folio from 'fragmentarium/domain/Folio'
import { Fragment } from 'fragmentarium/domain/fragment'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import {
  folioFactory,
  folioPagerFactory,
} from 'test-support/fragment-data-fixtures'

global.ResizeObserver = ResizeObserver

function createFragmentService(): jest.Mocked<FragmentService> {
  return {
    findFolio: jest
      .fn()
      .mockReturnValue(Promise.resolve(new Blob([''], { type: 'image/jpeg' }))),
    findPhoto: jest
      .fn()
      .mockReturnValue(Promise.resolve(new Blob([''], { type: 'image/jpeg' }))),
    folioPager: jest
      .fn()
      .mockReturnValue(Promise.resolve(folioPagerFactory.build())),
  } as unknown as jest.Mocked<FragmentService>
}

function renderImages({
  fragment,
  fragmentService = createFragmentService(),
  activeFolio = null,
  tab = activeFolio ? 'folio' : null,
}: {
  fragment: Fragment
  fragmentService?: jest.Mocked<FragmentService>
  activeFolio?: Folio | null
  tab?: string | null
}) {
  return {
    fragmentService,
    ...render(
      <MemoryRouter>
        <Images
          fragment={fragment}
          fragmentService={fragmentService}
          activeFolio={activeFolio}
          tab={tab}
        />
      </MemoryRouter>,
    ),
  }
}

test('selects the first folio when CDLI number has no usable images', async () => {
  const folios = [folioFactory.build({ name: 'WGL' })]
  const fragment = fragmentFactory.build(
    {
      hasPhoto: false,
      cdliImages: [],
      externalNumbers: { cdliNumber: 'P123456' },
    },
    { associations: { folios } },
  )

  renderImages({ fragment })

  const folioTab = await screen.findByText(
    `${folios[0].humanizedName} Folio ${folios[0].number}`,
  )
  expect(folioTab).toHaveAttribute('aria-selected', 'true')
  expect(screen.queryByText('CDLI')).not.toBeInTheDocument()
})

test('keeps visited folios mounted when switching away and back', async () => {
  const folios = [
    folioFactory.build({ name: 'WGL' }),
    folioFactory.build({ name: 'AKG' }),
  ]
  const fragment = fragmentFactory.build(
    { hasPhoto: false },
    { associations: { folios } },
  )
  const { fragmentService, rerender } = renderImages({ fragment })

  expect(await screen.findByAltText(folios[0].fileName)).toBeVisible()
  rerender(
    <MemoryRouter>
      <Images
        fragment={fragment}
        fragmentService={fragmentService}
        activeFolio={folios[1]}
        tab="folio"
      />
    </MemoryRouter>,
  )
  expect(await screen.findByAltText(folios[1].fileName)).toBeVisible()
  rerender(
    <MemoryRouter>
      <Images
        fragment={fragment}
        fragmentService={fragmentService}
        activeFolio={folios[0]}
        tab="folio"
      />
    </MemoryRouter>,
  )

  await waitFor(() =>
    expect(fragmentService.findFolio).toHaveBeenCalledTimes(2),
  )
  await waitFor(() =>
    expect(fragmentService.folioPager).toHaveBeenCalledTimes(2),
  )
  expect(fragmentService.findFolio).toHaveBeenNthCalledWith(1, folios[0])
  expect(fragmentService.findFolio).toHaveBeenNthCalledWith(2, folios[1])
})

test('resets visited media tabs when the fragment changes', async () => {
  const firstFolios = [
    folioFactory.build({ name: 'WGL' }),
    folioFactory.build({ name: 'AKG' }),
  ]
  const secondFolios = [folioFactory.build({ name: 'AHA' })]
  const fragmentService = createFragmentService()
  const firstFragment = fragmentFactory.build(
    { number: 'K.1', hasPhoto: false },
    { associations: { folios: firstFolios } },
  )
  const secondFragment = fragmentFactory.build(
    { number: 'K.2', hasPhoto: false },
    { associations: { folios: secondFolios } },
  )
  const { rerender } = renderImages({
    fragment: firstFragment,
    fragmentService,
  })

  expect(await screen.findByAltText(firstFolios[0].fileName)).toBeVisible()
  rerender(
    <MemoryRouter>
      <Images
        fragment={firstFragment}
        fragmentService={fragmentService}
        activeFolio={firstFolios[1]}
        tab="folio"
      />
    </MemoryRouter>,
  )
  expect(await screen.findByAltText(firstFolios[1].fileName)).toBeVisible()

  rerender(
    <MemoryRouter>
      <Images
        fragment={secondFragment}
        fragmentService={fragmentService}
        activeFolio={null}
        tab={null}
      />
    </MemoryRouter>,
  )

  expect(await screen.findByAltText(secondFolios[0].fileName)).toBeVisible()
  expect(screen.queryByAltText(firstFolios[1].fileName)).not.toBeInTheDocument()
})
