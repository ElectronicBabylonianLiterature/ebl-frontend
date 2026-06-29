import { screen, within } from '@testing-library/react'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'
import {
  realiaEntryFactory,
  afoRegisterEntryFactory,
} from 'test-support/realia-fixtures'
import { installMockIntersectionObserver } from 'test-support/intersectionObserverMock'
import { renderDisplay } from 'realia/ui/RealiaDisplay.testSupport'

jest.mock('realia/application/RealiaService')

describe('RealiaDisplay AfO-Register volumes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    installMockIntersectionObserver()
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
})
