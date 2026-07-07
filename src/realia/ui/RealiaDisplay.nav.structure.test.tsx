import { act, fireEvent, screen, within } from '@testing-library/react'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'
import {
  realiaEntryFactory,
  reallexikonEntryFactory,
  afoRegisterEntryFactory,
  realiaCrossReferenceFactory,
} from 'test-support/realia-fixtures'
import { afoVolumeId, rlaArticleId } from 'realia/ui/realiaSections'
import { referenceFactory } from 'test-support/bibliography-fixtures'
import {
  installMockIntersectionObserver,
  triggerIntersection,
} from 'test-support/intersectionObserverMock'
import { renderDisplay } from 'realia/ui/RealiaDisplay.testSupport'

jest.mock('realia/application/RealiaService')

describe('RealiaDisplay navigation menu structure', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    installMockIntersectionObserver()
  })

  it('shows the entry title and type in the menu, linking to the top', async () => {
    const entry = realiaEntryFactory.build({
      id: 'Königsinschriften',
      type: ['Royal inscriptions'],
    })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    const navMenu = screen.getByRole('navigation', { name: 'On this page' })
    const topLink = within(navMenu).getByRole('link', {
      name: 'Königsinschriften Royal inscriptions',
    })
    expect(topLink).toHaveAttribute('href', '#realia-top')
    expect(
      within(navMenu).getByText('Königsinschriften', {
        selector: '.Realia__nav-top-title',
      }),
    ).toBeInTheDocument()
    expect(
      within(navMenu).getByText('Royal inscriptions', {
        selector: '.Realia__nav-top-type',
      }),
    ).toBeInTheDocument()
  })

  it('omits the type from the menu when no type is given', async () => {
    const entry = realiaEntryFactory.build({ id: 'Anu', type: [] })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    const navMenu = screen.getByRole('navigation', { name: 'On this page' })
    expect(
      within(navMenu).getByText('Anu', { selector: '.Realia__nav-top-title' }),
    ).toBeInTheDocument()
    expect(
      within(navMenu).queryByText(/\w/, {
        selector: '.Realia__nav-top-type',
      }),
    ).not.toBeInTheDocument()
  })

  it('highlights the entry title when the top of the page is in view', async () => {
    const entry = realiaEntryFactory.build({
      id: 'Anu',
      type: ['Divine names'],
    })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    const navMenu = screen.getByRole('navigation', { name: 'On this page' })
    act(() => {
      triggerIntersection([{ id: 'realia-top', isIntersecting: true, top: 0 }])
    })
    const topLink = within(navMenu).getByRole('link', {
      name: 'Anu Divine names',
    })
    expect(topLink).toHaveClass('is-active')
    expect(topLink).toHaveAttribute('aria-current', 'true')
  })

  it('renders a navigation menu with a link for each section', async () => {
    const entry = realiaEntryFactory.build({
      references: [referenceFactory.build()],
      crossReferences: [realiaCrossReferenceFactory.build({ lemma: 'Anu' })],
    })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    const navMenu = screen.getByRole('navigation', { name: 'On this page' })
    expect(
      within(navMenu).getByRole('link', { name: 'Reallexikon' }),
    ).toHaveAttribute('href', '#realia-section-reallexikon')
    expect(
      within(navMenu).getByRole('link', { name: 'AfO-Register' }),
    ).toHaveAttribute('href', '#realia-section-afo-register')
    expect(
      within(navMenu).getByRole('link', { name: 'References' }),
    ).toBeInTheDocument()
    expect(
      within(navMenu).getByRole('link', { name: 'See Also' }),
    ).toBeInTheDocument()
  })

  it('lists RlA articles as subsections in the navigation menu', async () => {
    const entry = realiaEntryFactory.build({
      reallexikon: [
        reallexikonEntryFactory.build({ title: 'Aššur A. Stadt' }),
        reallexikonEntryFactory.build({ title: 'Aššur C. Hauptgott' }),
      ],
      afoRegister: [],
    })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    const navMenu = screen.getByRole('navigation', { name: 'On this page' })
    expect(
      within(navMenu).getByRole('link', { name: 'Aššur A. Stadt' }),
    ).toHaveAttribute('href', `#${rlaArticleId('Aššur A. Stadt')}`)
    expect(
      within(navMenu).getByRole('link', { name: 'Aššur C. Hauptgott' }),
    ).toHaveAttribute('href', `#${rlaArticleId('Aššur C. Hauptgott')}`)
  })

  it('lists AfO volumes as subsections in the navigation menu', async () => {
    const entry = realiaEntryFactory.build({
      reallexikon: [],
      afoRegister: [
        afoRegisterEntryFactory.build({
          afoVolume: 'AfO 25',
          year: '',
          page: '370',
        }),
        afoRegisterEntryFactory.build({
          afoVolume: 'AfO 26',
          year: '',
          page: '12',
        }),
      ],
    })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    const navMenu = screen.getByRole('navigation', { name: 'On this page' })
    expect(
      within(navMenu).getByRole('link', { name: 'AfO 26' }),
    ).toHaveAttribute('href', `#${afoVolumeId('AfO 26')}`)
    expect(
      within(navMenu).getByRole('link', { name: 'AfO 25' }),
    ).toHaveAttribute('href', `#${afoVolumeId('AfO 25')}`)
  })

  it('highlights the active subsection and its parent group from scroll position', async () => {
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
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    const navMenu = screen.getByRole('navigation', { name: 'On this page' })
    act(() => {
      triggerIntersection([
        { id: rlaArticleId('Aššur A. Stadt'), isIntersecting: true },
      ])
    })
    expect(
      within(navMenu).getByRole('link', { name: 'Aššur A. Stadt' }),
    ).toHaveClass('is-active')
    act(() => {
      triggerIntersection([
        { id: rlaArticleId('Aššur A. Stadt'), isIntersecting: false },
        { id: afoVolumeId('AfO 25'), isIntersecting: true },
      ])
    })
    expect(within(navMenu).getByRole('link', { name: 'AfO 25' })).toHaveClass(
      'is-active',
    )
    expect(
      within(navMenu).getByRole('link', { name: 'AfO-Register' }),
    ).not.toHaveClass('is-active')
  })

  it('keeps the clicked menu item active and does not revert to the previous section', async () => {
    const entry = realiaEntryFactory.build({
      reallexikon: [reallexikonEntryFactory.build({ title: 'Aššur A. Stadt' })],
      afoRegister: [],
      references: [referenceFactory.build()],
      crossReferences: [],
      afoCrossReferences: [],
    })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    const navMenu = screen.getByRole('navigation', { name: 'On this page' })
    fireEvent.click(within(navMenu).getByRole('link', { name: 'References' }))
    expect(
      within(navMenu).getByRole('link', { name: 'References' }),
    ).toHaveClass('is-active')
    act(() => {
      triggerIntersection([
        { id: rlaArticleId('Aššur A. Stadt'), isIntersecting: true },
      ])
    })
    expect(
      within(navMenu).getByRole('link', { name: 'References' }),
    ).toHaveClass('is-active')
    expect(
      within(navMenu).getByRole('link', { name: 'Reallexikon' }),
    ).not.toHaveClass('is-active')
  })
})
