import React from 'react'
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RealiaDisplay from 'realia/ui/RealiaDisplay'
import SessionContext from 'auth/SessionContext'
import MemorySession from 'auth/Session'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'
import {
  realiaEntryFactory,
  reallexikonEntryFactory,
  afoRegisterEntryFactory,
} from 'test-support/realia-fixtures'
import { afoVolumeId, rlaArticleId } from 'realia/ui/realiaSections'
import { referenceFactory } from 'test-support/bibliography-fixtures'
import {
  installMockIntersectionObserver,
  triggerIntersection,
} from 'test-support/intersectionObserverMock'
import prefersReducedMotion from 'common/utils/prefersReducedMotion'
import {
  realiaService,
  renderDisplay,
  renderDisplayWithLocation,
} from 'realia/ui/RealiaDisplay.testSupport'

jest.mock('realia/application/RealiaService')
jest.mock('common/utils/prefersReducedMotion')

describe('RealiaDisplay navigation interaction', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    installMockIntersectionObserver()
  })

  it('scrolls to the top section when the menu title is clicked', async () => {
    const scrollIntoView = jest.spyOn(HTMLElement.prototype, 'scrollIntoView')
    const entry = realiaEntryFactory.build({ id: 'Anu', type: [] })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    const navMenu = screen.getByRole('navigation', { name: 'On this page' })
    fireEvent.click(within(navMenu).getByRole('link', { name: 'Anu' }))
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalled())
    scrollIntoView.mockRestore()
  })

  it('collapses a section from its on-page heading and stays in sync with the menu', async () => {
    const entry = realiaEntryFactory.build({
      reallexikon: [],
      afoRegister: [
        afoRegisterEntryFactory.build({ afoVolume: 'AfO 25', page: '370' }),
      ],
    })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    const heading = screen.getByRole('button', {
      name: 'II. AfO-Register Realien',
    })
    expect(heading).toHaveAttribute('aria-expanded', 'true')
    fireEvent.click(heading)
    expect(heading).toHaveAttribute('aria-expanded', 'false')
    expect(
      screen.getByRole('button', { name: 'Expand AfO-Register' }),
    ).toBeInTheDocument()
  })

  it('toggles the section collapse state from the menu', async () => {
    const entry = realiaEntryFactory.build({
      reallexikon: [],
      afoRegister: [
        afoRegisterEntryFactory.build({ afoVolume: 'AfO 25', page: '370' }),
      ],
    })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(
      screen.getByRole('button', { name: 'Collapse AfO-Register' }),
    ).toHaveAttribute('aria-expanded', 'true')
    fireEvent.click(
      screen.getByRole('button', { name: 'Collapse AfO-Register' }),
    )
    const reExpand = screen.getByRole('button', { name: 'Expand AfO-Register' })
    expect(reExpand).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(reExpand)
    expect(
      screen.getByRole('button', { name: 'Collapse AfO-Register' }),
    ).toHaveAttribute('aria-expanded', 'true')
  })

  it('re-opens a collapsed section and scrolls when its subsection link is clicked', async () => {
    const scrollIntoView = jest.spyOn(HTMLElement.prototype, 'scrollIntoView')
    const entry = realiaEntryFactory.build({
      reallexikon: [],
      afoRegister: [
        afoRegisterEntryFactory.build({
          afoVolume: 'AfO 25',
          year: '',
          page: '370',
        }),
      ],
    })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    fireEvent.click(
      screen.getByRole('button', { name: 'Collapse AfO-Register' }),
    )
    const navMenu = screen.getByRole('navigation', { name: 'On this page' })
    fireEvent.click(within(navMenu).getByRole('link', { name: 'AfO 25' }))
    expect(
      screen.getByRole('button', { name: 'Collapse AfO-Register' }),
    ).toHaveAttribute('aria-expanded', 'true')
    await waitFor(() =>
      expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' }),
    )
    scrollIntoView.mockRestore()
  })

  it('scrolls instantly when the user prefers reduced motion', async () => {
    ;(prefersReducedMotion as jest.Mock).mockReturnValueOnce(true)
    const scrollIntoView = jest.spyOn(HTMLElement.prototype, 'scrollIntoView')
    const entry = realiaEntryFactory.build()
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    const navMenu = screen.getByRole('navigation', { name: 'On this page' })
    fireEvent.click(within(navMenu).getByRole('link', { name: 'Reallexikon' }))
    await waitFor(() =>
      expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto' }),
    )
    scrollIntoView.mockRestore()
  })

  it('scrolls to the AfO volume named in the URL hash on load', async () => {
    const scrollIntoView = jest.spyOn(HTMLElement.prototype, 'scrollIntoView')
    const entry = realiaEntryFactory.build({
      reallexikon: [],
      afoRegister: [
        afoRegisterEntryFactory.build({
          afoVolume: 'AfO 25',
          year: '',
          page: '370',
        }),
      ],
    })
    realiaService.find.mockReturnValue(Promise.resolve(entry))
    render(
      <MemoryRouter
        initialEntries={[{ pathname: '/', hash: `#${afoVolumeId('AfO 25')}` }]}
      >
        <SessionContext.Provider value={new MemorySession(['read:realia'])}>
          <RealiaDisplay id={entry.id} realiaService={realiaService} />
        </SessionContext.Provider>
      </MemoryRouter>,
    )
    await waitForSpinnerToBeRemoved(screen)
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalled())
    const scrolled = scrollIntoView.mock.instances[0] as unknown as HTMLElement
    expect(scrolled).toHaveAttribute('id', afoVolumeId('AfO 25'))
    scrollIntoView.mockRestore()
  })

  it('changes the URL hash when a section link is clicked', async () => {
    const entry = realiaEntryFactory.build({
      reallexikon: [],
      afoRegister: [],
      references: [referenceFactory.build()],
      crossReferences: [],
      afoCrossReferences: [],
    })
    renderDisplayWithLocation(entry)
    await waitForSpinnerToBeRemoved(screen)
    const navMenu = screen.getByRole('navigation', { name: 'On this page' })
    fireEvent.click(within(navMenu).getByRole('link', { name: 'References' }))
    expect(screen.getByTestId('location-hash')).toHaveTextContent(
      '#realia-section-references',
    )
  })

  it('changes the URL hash when a subsection link is clicked', async () => {
    const entry = realiaEntryFactory.build({
      reallexikon: [],
      afoRegister: [
        afoRegisterEntryFactory.build({
          afoVolume: 'AfO 25',
          year: '',
          page: '370',
        }),
      ],
    })
    renderDisplayWithLocation(entry)
    await waitForSpinnerToBeRemoved(screen)
    const navMenu = screen.getByRole('navigation', { name: 'On this page' })
    fireEvent.click(within(navMenu).getByRole('link', { name: 'AfO 25' }))
    expect(screen.getByTestId('location-hash')).toHaveTextContent(
      `#${afoVolumeId('AfO 25')}`,
    )
  })

  it('marks the URL-selected subsection with a second highlight that survives scrolling', async () => {
    const entry = realiaEntryFactory.build({
      reallexikon: [reallexikonEntryFactory.build({ title: 'Aššur A. Stadt' })],
      afoRegister: [
        afoRegisterEntryFactory.build({
          afoVolume: 'AfO 25',
          year: '',
          page: '370',
        }),
      ],
      references: [],
      crossReferences: [],
      afoCrossReferences: [],
    })
    renderDisplayWithLocation(entry, {
      pathname: '/',
      hash: `#${afoVolumeId('AfO 25')}`,
    })
    await waitForSpinnerToBeRemoved(screen)
    const navMenu = screen.getByRole('navigation', { name: 'On this page' })
    expect(within(navMenu).getByRole('link', { name: 'AfO 25' })).toHaveClass(
      'is-selected',
    )
    expect(
      within(navMenu).getByRole('link', { name: 'Aššur A. Stadt' }),
    ).not.toHaveClass('is-selected')
    act(() => {
      triggerIntersection([
        { id: rlaArticleId('Aššur A. Stadt'), isIntersecting: true },
      ])
    })
    expect(within(navMenu).getByRole('link', { name: 'AfO 25' })).toHaveClass(
      'is-selected',
    )
  })
})
