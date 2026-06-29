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
import RealiaService from 'realia/application/RealiaService'
import SessionContext from 'auth/SessionContext'
import MemorySession from 'auth/Session'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'
import Bluebird from 'bluebird'
import {
  realiaEntryFactory,
  reallexikonEntryFactory,
  afoRegisterEntryFactory,
  realiaCrossReferenceFactory,
} from 'test-support/realia-fixtures'
import { RealiaEntry } from 'realia/domain/RealiaEntry'
import { afoVolumeId, rlaArticleId } from 'realia/ui/realiaSections'
import { referenceFactory } from 'test-support/bibliography-fixtures'
import {
  installMockIntersectionObserver,
  triggerIntersection,
} from 'test-support/intersectionObserverMock'
import prefersReducedMotion from 'common/utils/prefersReducedMotion'

jest.mock('realia/application/RealiaService')
jest.mock('common/utils/prefersReducedMotion')

const realiaService = new (RealiaService as jest.Mock<
  jest.Mocked<RealiaService>
>)()

function renderDisplay(
  entry: RealiaEntry,
  session = new MemorySession(['read:realia']),
): void {
  realiaService.find.mockReturnValue(Bluebird.resolve(entry))
  render(
    <MemoryRouter>
      <SessionContext.Provider value={session}>
        <RealiaDisplay id={entry.id} realiaService={realiaService} />
      </SessionContext.Provider>
    </MemoryRouter>,
  )
}

describe('RealiaDisplay', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    installMockIntersectionObserver()
  })

  it('renders all sections for a full entry', async () => {
    const entry = realiaEntryFactory.build()
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(
      screen.getByRole('heading', { level: 1, name: entry.id }),
    ).toBeInTheDocument()
    expect(screen.getByText(/I\. Reallexikon/)).toBeInTheDocument()
    expect(screen.getByText(/II\. AfO-Register/)).toBeInTheDocument()
  })

  it('renders breadcrumbs with Realia section and entry id', async () => {
    const entry = realiaEntryFactory.build()
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(screen.getByText('Realia')).toBeInTheDocument()
    expect(
      screen.getByText(entry.id, { selector: '.breadcrumb-item' }),
    ).toBeInTheDocument()
  })

  it('renders Wikidata ExternalLink with correct href', async () => {
    const entry = realiaEntryFactory.build({ wikidataId: ['Q787'] })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    const link = screen.getByRole('link', { name: 'Wikidata: Q787' })
    expect(link).toHaveAttribute('href', 'https://www.wikidata.org/wiki/Q787')
  })

  it('shows dash when type is empty', async () => {
    const entry = realiaEntryFactory.build({ type: [] })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('omits Reallexikon section when reallexikon is empty', async () => {
    const entry = realiaEntryFactory.build({ reallexikon: [] })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(screen.queryByText(/I\. Reallexikon/)).not.toBeInTheDocument()
  })

  it('omits AfO-Register section when afoRegister is empty', async () => {
    const entry = realiaEntryFactory.build({ afoRegister: [] })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(screen.queryByText(/II\. AfO-Register/)).not.toBeInTheDocument()
  })

  it('omits References section when references is empty', async () => {
    const entry = realiaEntryFactory.build({ references: [] })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(screen.queryByText(/III\. References/)).not.toBeInTheDocument()
  })

  it('renders reallexikon entry with a reference', async () => {
    const reference = referenceFactory.build()
    const reallexikonEntry = reallexikonEntryFactory.build({
      reference,
    })
    const entry = realiaEntryFactory.build({
      reallexikon: [reallexikonEntry],
    })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(screen.getByText(/I\. Reallexikon/)).toBeInTheDocument()
  })

  it('renders multiple reallexikon (RlA) articles on the same page', async () => {
    const entry = realiaEntryFactory.build({
      reallexikon: [
        reallexikonEntryFactory.build({ id: '1069', title: 'Aššur A. Stadt' }),
        reallexikonEntryFactory.build({ id: '1070', title: 'Aššur B. Land' }),
        reallexikonEntryFactory.build({
          id: '1071',
          title: 'Aššur C. Hauptgott',
        }),
      ],
    })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(
      screen.getByText('Aššur A. Stadt', { selector: '.Realia__rla-title' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Aššur B. Land', { selector: '.Realia__rla-title' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Aššur C. Hauptgott', {
        selector: '.Realia__rla-title',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', {
        name: 'Open Aššur A. Stadt on the online RlA',
      }),
    ).toHaveAttribute('href', 'https://publikationen.badw.de/de/rla/index#1069')
    expect(
      screen.getByRole('link', {
        name: 'Open Aššur B. Land on the online RlA',
      }),
    ).toHaveAttribute('href', 'https://publikationen.badw.de/de/rla/index#1070')
    expect(
      screen.getByRole('link', {
        name: 'Open Aššur C. Hauptgott on the online RlA',
      }),
    ).toHaveAttribute('href', 'https://publikationen.badw.de/de/rla/index#1071')
  })

  it('renders every RlA article even when they share an id', async () => {
    const entry = realiaEntryFactory.build({
      reallexikon: [
        reallexikonEntryFactory.build({
          id: 'Sintflut',
          title: 'Sintflut A. Deutsch',
        }),
        reallexikonEntryFactory.build({
          id: 'Sintflut',
          title: 'Sintflut B. English',
        }),
      ],
    })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(
      screen.getByText('Sintflut A. Deutsch', {
        selector: '.Realia__rla-title',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Sintflut B. English', {
        selector: '.Realia__rla-title',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', {
        name: 'Open Sintflut A. Deutsch on the online RlA',
      }),
    ).toHaveAttribute(
      'href',
      'https://publikationen.badw.de/de/rla/index#Sintflut',
    )
    expect(
      screen.getByRole('link', {
        name: 'Open Sintflut B. English on the online RlA',
      }),
    ).toHaveAttribute(
      'href',
      'https://publikationen.badw.de/de/rla/index#Sintflut',
    )
  })

  it('links each reallexikon title to its online RlA article in a new tab', async () => {
    const reallexikonEntry = reallexikonEntryFactory.build({
      id: '12583',
      title: 'Zababa-šuma-iddina',
    })
    const entry = realiaEntryFactory.build({ reallexikon: [reallexikonEntry] })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(
      screen.getByText('Zababa-šuma-iddina', {
        selector: '.Realia__rla-title',
      }),
    ).toBeInTheDocument()
    const link = screen.getByRole('link', {
      name: 'Open Zababa-šuma-iddina on the online RlA',
    })
    expect(link).toHaveAttribute(
      'href',
      'https://publikationen.badw.de/de/rla/index#12583',
    )
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('renders afo entry without note', async () => {
    const afoEntry = afoRegisterEntryFactory.build({ note: '' })
    const entry = realiaEntryFactory.build({ afoRegister: [afoEntry] })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(screen.getByText(/II\. AfO-Register/)).toBeInTheDocument()
  })

  it('groups afo entries that share a volume into one collapsible card', async () => {
    const entry = realiaEntryFactory.build({
      id: 'Tiamat',
      reallexikon: [],
      afoRegister: [
        afoRegisterEntryFactory.build({
          mainWord: 'Tiamat',
          afoVolume: 'AfO 25',
          year: '1977',
          page: '370',
        }),
        afoRegisterEntryFactory.build({
          mainWord: 'Apsû',
          afoVolume: 'AfO 25',
          year: '1977',
          page: '372',
        }),
      ],
    })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(
      screen.getByText('Tiamat, Apsû', {
        selector: '.Realia__afo-volume-mainword',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('AfO 25 (1977), 370-372', {
        selector: '.Realia__afo-volume-details',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Tiamat', { selector: '.Realia__afo-mainword' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Apsû', { selector: '.Realia__afo-mainword' }),
    ).toBeInTheDocument()
  })

  it('renders all AfO volumes newest first', async () => {
    const entry = realiaEntryFactory.build({
      reallexikon: [],
      afoRegister: [
        afoRegisterEntryFactory.build({
          afoVolume: 'AfO 25',
          year: '1977',
          page: '370',
        }),
        afoRegisterEntryFactory.build({
          afoVolume: 'AfO 26',
          year: '1979',
          page: '12',
        }),
      ],
    })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    const volumes = screen
      .getAllByText(/AfO 2\d/, { selector: '.Realia__afo-volume-details' })
      .map((element) => element.textContent)
    expect(volumes).toEqual(['AfO 26 (1979), 12', 'AfO 25 (1977), 370'])
  })

  it('shows the main word and page in the volume title and hides them on the entries when they are constant', async () => {
    const entry = realiaEntryFactory.build({
      id: 'Adad',
      reallexikon: [],
      afoRegister: [
        afoRegisterEntryFactory.build({
          mainWord: 'Adad',
          afoVolume: 'AfO 44/45',
          year: '1997/1998',
          page: '615',
          note: 'first note',
        }),
        afoRegisterEntryFactory.build({
          mainWord: 'Adad',
          afoVolume: 'AfO 44/45',
          year: '1997/1998',
          page: '615',
          note: 'second note',
        }),
      ],
    })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(
      screen.getByText('Adad', { selector: '.Realia__afo-volume-mainword' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('AfO 44/45 (1997/1998), 615', {
        selector: '.Realia__afo-volume-details',
      }),
    ).toBeInTheDocument()
    expect(
      screen.queryByText('Adad', { selector: '.Realia__afo-mainword' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText('615', { selector: '.Realia__afo-citation' }),
    ).not.toBeInTheDocument()
    expect(screen.getByText('first note')).toBeInTheDocument()
    expect(screen.getByText('second note')).toBeInTheDocument()
  })

  it('shows the per-entry AfO caption with the year when pages differ within a volume', async () => {
    const entry = realiaEntryFactory.build({
      id: 'Akkad',
      reallexikon: [],
      afoRegister: [
        afoRegisterEntryFactory.build({
          mainWord: 'Akkad',
          afoVolume: 'AfO 44/45',
          year: '1997/1998',
          page: '615',
          AfO: 'AfO 44/45 (1997/1998), 615',
        }),
        afoRegisterEntryFactory.build({
          mainWord: 'Akkad',
          afoVolume: 'AfO 44/45',
          year: '1997/1998',
          page: '616',
          AfO: 'AfO 44/45 (1997/1998), 616',
        }),
      ],
    })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(
      screen.getByText('Akkad', { selector: '.Realia__afo-volume-mainword' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('AfO 44/45 (1997/1998), 615-616', {
        selector: '.Realia__afo-volume-details',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('AfO 44/45 (1997/1998), 615', {
        selector: '.Realia__afo-citation',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('AfO 44/45 (1997/1998), 616', {
        selector: '.Realia__afo-citation',
      }),
    ).toBeInTheDocument()
  })

  it('drops entries that have no visible content once the main word and page are hidden', async () => {
    const entry = realiaEntryFactory.build({
      id: 'Adad',
      reallexikon: [],
      afoRegister: [
        afoRegisterEntryFactory.build({
          mainWord: 'Adad',
          afoVolume: 'AfO 44/45',
          page: '615',
          note: '',
          reference: '',
        }),
        afoRegisterEntryFactory.build({
          mainWord: 'Adad',
          afoVolume: 'AfO 44/45',
          page: '615',
          note: 'kept note',
          reference: '',
        }),
      ],
    })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    const afoList = screen.getByRole('list', { name: 'AfO 44/45' })
    expect(screen.getByText('kept note')).toBeInTheDocument()
    expect(within(afoList).getAllByRole('listitem')).toHaveLength(1)
  })

  it('links an inline AfO cross-reference to the target lemma and its AfO volume', async () => {
    const afoEntry = afoRegisterEntryFactory.build({
      afoVolume: 'AfO 25',
      crossReference: 'Anu',
      crossReferences: [{ id: 'realia_anu', lemma: 'Anu' }],
    })
    const entry = realiaEntryFactory.build({
      reallexikon: [],
      afoRegister: [afoEntry],
    })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(screen.getByRole('link', { name: 'Anu' })).toHaveAttribute(
      'href',
      `/tools/realia/Anu#${afoVolumeId('AfO 25')}`,
    )
  })

  it('encodes the target lemma, even with spaces and parentheses', async () => {
    const afoEntry = afoRegisterEntryFactory.build({
      afoVolume: 'AfO 50',
      crossReference: 'Elam',
      crossReferences: [{ id: 'realia_elam', lemma: 'Elam (Geschichte)' }],
    })
    const entry = realiaEntryFactory.build({
      reallexikon: [],
      afoRegister: [afoEntry],
    })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(
      screen.getByRole('link', { name: 'Elam (Geschichte)' }),
    ).toHaveAttribute(
      'href',
      `/tools/realia/${encodeURIComponent('Elam (Geschichte)')}#${afoVolumeId(
        'AfO 50',
      )}`,
    )
  })

  it('renders an unresolved inline AfO cross-reference as plain text', async () => {
    const afoEntry = afoRegisterEntryFactory.build({
      crossReference: 'Syntax',
      crossReferences: [],
    })
    const entry = realiaEntryFactory.build({
      reallexikon: [],
      afoRegister: [afoEntry],
    })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(screen.getByText('Syntax')).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Syntax' }),
    ).not.toBeInTheDocument()
  })

  it('shows the AfO volume next to an inline AfO cross-reference link', async () => {
    const afoEntry = afoRegisterEntryFactory.build({
      afoVolume: 'AfO 48/49',
      page: '358',
      crossReference: 'Elam',
      crossReferences: [{ id: 'realia_elam', lemma: 'Elam (Geschichte)' }],
    })
    const entry = realiaEntryFactory.build({
      reallexikon: [],
      afoRegister: [afoEntry],
    })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(
      screen.getByRole('link', { name: 'Elam (Geschichte)' }),
    ).toHaveAttribute(
      'href',
      `/tools/realia/${encodeURIComponent('Elam (Geschichte)')}#${afoVolumeId(
        'AfO 48/49',
      )}`,
    )
    expect(screen.getByText('(AfO 48/49, 358)')).toBeInTheDocument()
  })

  it('keeps an AfO entry whose only content is a cross-reference', async () => {
    const entry = realiaEntryFactory.build({
      id: 'Adad',
      reallexikon: [],
      afoRegister: [
        afoRegisterEntryFactory.build({
          mainWord: 'Adad',
          afoVolume: 'AfO 44/45',
          page: '615',
          note: '',
          reference: '',
          crossReference: 'Iškur',
          crossReferences: [{ id: 'realia_iskur', lemma: 'Iškur' }],
        }),
        afoRegisterEntryFactory.build({
          mainWord: 'Adad',
          afoVolume: 'AfO 44/45',
          page: '615',
          note: 'kept note',
          reference: '',
          crossReference: '',
          crossReferences: [],
        }),
      ],
    })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    const afoList = screen.getByRole('list', { name: 'AfO 44/45' })
    expect(within(afoList).getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByRole('link', { name: 'Iškur' })).toHaveAttribute(
      'href',
      `/tools/realia/${encodeURIComponent('Iškur')}#${afoVolumeId('AfO 44/45')}`,
    )
  })

  it('renders the AfO-Register section expanded by default', async () => {
    const afoEntry = afoRegisterEntryFactory.build({
      afoVolume: 'AfO 25',
      page: '370',
      mainWord: 'Tiamat',
    })
    const entry = realiaEntryFactory.build({
      reallexikon: [],
      afoRegister: [afoEntry],
    })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(screen.getByRole('list', { name: 'AfO 25' })).toBeVisible()
  })

  it('uses the afoVolume label verbatim, including the slash form', async () => {
    const afoEntry = afoRegisterEntryFactory.build({
      afoVolume: 'AfO 40/41',
      year: '1993/1994',
      page: '420',
      AfO: 'AfO 40/41 (1993/1994), 420',
    })
    const entry = realiaEntryFactory.build({
      reallexikon: [],
      afoRegister: [afoEntry],
    })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(
      screen.getByText('AfO 40/41 (1993/1994), 420', {
        selector: '.Realia__afo-volume-details',
      }),
    ).toBeInTheDocument()
    expect(screen.queryByText(/AfO AfO/)).not.toBeInTheDocument()
  })

  it('renders References section when references are present', async () => {
    const reference = referenceFactory.build()
    const entry = realiaEntryFactory.build({ references: [reference] })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(screen.getByText(/III\. References/)).toBeInTheDocument()
  })

  it('renders "Related terms:" label when relatedTerms present', async () => {
    const entry = realiaEntryFactory.build({ relatedTerms: ['pig', 'swine'] })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(screen.getByText('Related terms:')).toBeInTheDocument()
  })

  it('renders "Type:" label with the backend type value verbatim', async () => {
    const entry = realiaEntryFactory.build({ type: ['Divine names'] })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(screen.getByText('Type:')).toBeInTheDocument()
    expect(
      screen.getByText('Divine names', { selector: '.Realia__metadata span' }),
    ).toBeInTheDocument()
  })

  it('shows the Reallexikon section and hides References when there are none', async () => {
    const reference = referenceFactory.build()
    const reallexikonEntry = reallexikonEntryFactory.build({
      reference,
    })
    const entry = realiaEntryFactory.build({
      reallexikon: [reallexikonEntry],
      references: [],
    })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(screen.getByText(/I\. Reallexikon/)).toBeInTheDocument()
    expect(screen.queryByText(/III\. References/)).not.toBeInTheDocument()
  })

  it('renders the See Also section with links for cross-references', async () => {
    const entry = realiaEntryFactory.build({
      crossReferences: [
        realiaCrossReferenceFactory.build({ id: 'realia_1', lemma: 'Anu' }),
      ],
      afoCrossReferences: [
        realiaCrossReferenceFactory.build({ id: 'realia_2', lemma: 'Enlil' }),
      ],
    })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(screen.getByText('IV. See Also')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Anu' })).toHaveAttribute(
      'href',
      '/tools/realia/Anu',
    )
    expect(screen.getByRole('link', { name: 'Enlil' })).toHaveAttribute(
      'href',
      '/tools/realia/Enlil',
    )
  })

  it('omits the See Also section when there are no cross-references', async () => {
    const entry = realiaEntryFactory.build({
      crossReferences: [],
      afoCrossReferences: [],
    })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(screen.queryByText(/IV\. See Also/)).not.toBeInTheDocument()
  })

  it('renders a redirect document as a pointer to its target lemma', async () => {
    const entry = realiaEntryFactory.build({
      id: 'Abaralaḫ',
      reallexikon: [],
      afoRegister: [],
      references: [],
      crossReferences: [
        realiaCrossReferenceFactory.build({
          id: 'realia_nusku',
          lemma: 'Nusku',
        }),
      ],
      afoCrossReferences: [],
    })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Abaralaḫ' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Nusku' })).toHaveAttribute(
      'href',
      '/tools/realia/Nusku',
    )
    expect(screen.queryByText(/IV\. See Also/)).not.toBeInTheDocument()
    expect(
      screen.queryByRole('navigation', { name: 'On this page' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByText(/still under active development/i),
    ).toBeInTheDocument()
  })

  it('does not render an AppContent-generated h2 heading', async () => {
    const entry = realiaEntryFactory.build()
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(
      screen.queryByRole('heading', { level: 2, name: entry.id }),
    ).not.toBeInTheDocument()
  })

  it('re-fetches and renders the new entry when the id changes', async () => {
    const first = realiaEntryFactory.build({ id: 'Pig' })
    const second = realiaEntryFactory.build({ id: 'Anu' })
    realiaService.find.mockImplementation((id: string) =>
      Bluebird.resolve(id === 'Anu' ? second : first),
    )
    const session = new MemorySession(['read:realia'])
    const { rerender } = render(
      <MemoryRouter>
        <SessionContext.Provider value={session}>
          <RealiaDisplay id="Pig" realiaService={realiaService} />
        </SessionContext.Provider>
      </MemoryRouter>,
    )
    await waitForSpinnerToBeRemoved(screen)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Pig' }),
    ).toBeInTheDocument()

    rerender(
      <MemoryRouter>
        <SessionContext.Provider value={session}>
          <RealiaDisplay id="Anu" realiaService={realiaService} />
        </SessionContext.Provider>
      </MemoryRouter>,
    )
    await waitForSpinnerToBeRemoved(screen)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Anu' }),
    ).toBeInTheDocument()
    expect(realiaService.find).toHaveBeenCalledWith('Anu')
  })

  it('shows the development notice for an authorized session', async () => {
    const entry = realiaEntryFactory.build()
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(
      screen.getByText(/still under active development/i),
    ).toBeInTheDocument()
  })

  it('shows login message when session lacks readRealia scope', async () => {
    const entry = realiaEntryFactory.build()
    renderDisplay(entry, new MemorySession([]))
    await waitForSpinnerToBeRemoved(screen)
    expect(
      screen.getByText('Please log in to browse the Dictionary of Realia.'),
    ).toBeInTheDocument()
    expect(
      screen.queryByText(/still under active development/i),
    ).not.toBeInTheDocument()
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
    realiaService.find.mockReturnValue(Bluebird.resolve(entry))
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
    const scrolled = scrollIntoView.mock.instances[0] as HTMLElement
    expect(scrolled).toHaveAttribute('id', afoVolumeId('AfO 25'))
    scrollIntoView.mockRestore()
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
