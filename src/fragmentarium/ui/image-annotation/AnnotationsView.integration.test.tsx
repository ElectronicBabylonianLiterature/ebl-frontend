import React from 'react'
import ResizeObserver from 'resize-observer-polyfill'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import FakeApi from 'test-support/FakeApi'
import { fragmentDto } from 'test-support/test-fragment'
import { annotationsDto } from 'test-support/test-annotation'
import { produce } from 'immer'
import mockObjectUrl from 'test-support/mockObjectUrl'
import TagSignsView from 'fragmentarium/ui/image-annotation/TagSignsView'
import MemorySession from 'auth/Session'
import SessionContext from 'auth/SessionContext'
import { breadcrumbs, getServices } from 'test-support/appDriverHelpers'

global.ResizeObserver = ResizeObserver

mockObjectUrl('mock url')

const fragmentWithoutReferences = produce(fragmentDto, (draft) => {
  draft.references = []
})
const fragmentNumber = 'Test.Fragment'
const photo = { blobParts: [''], options: { type: 'image/jpeg' }, size: 1 }
let fakeApi: FakeApi

async function renderAnnotateView(): Promise<void> {
  fakeApi = new FakeApi()
    .expectFragment(fragmentWithoutReferences)
    .expectPhoto(fragmentNumber, photo)
    .expectAnnotations(fragmentNumber, annotationsDto)
  const { fragmentService, signService } = getServices(fakeApi.client)

  render(
    <MemoryRouter>
      <SessionContext.Provider
        value={new MemorySession(['read:fragments', 'annotate:fragments'])}
      >
        <TagSignsView
          number={fragmentNumber}
          fragmentService={fragmentService}
          signService={signService}
        />
      </SessionContext.Provider>
    </MemoryRouter>,
  )

  await screen.findByRole('button', { name: 'Save' })
  await screen.findByRole('img')
}

afterEach(() => {
  fakeApi.verifyExpectations()
})

describe('Display annotate view', () => {
  test('Breadcrumbs', async () => {
    await renderAnnotateView()

    breadcrumbs.expectCrumbs(['eBL', 'Library', fragmentNumber, 'Tag Signs'])
  })

  test('Fragment crumb', async () => {
    await renderAnnotateView()

    breadcrumbs.expectCrumb(fragmentNumber, `/library/${fragmentNumber}`)
  })

  test('renders heading and image annotation controls', async () => {
    await renderAnnotateView()

    expect(screen.getByRole('heading', { name: /Tag Signs/i })).toBeVisible()
    expect(screen.getAllByRole('img').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Save' })).toBeVisible()
  })
})
